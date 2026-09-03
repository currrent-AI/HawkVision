import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps
from ultralytics import YOLO


# ============================================================
# Configuration
# ============================================================

CONFIDENCE_THRESHOLD = 0.25
IOU_THRESHOLD = 0.45
IMAGE_SIZE = 1280
MAX_DETECTIONS = 300

# Sliced inference (SAHI-style) for small / distant people
SLICE_SIZE = 512
SLICE_OVERLAP = 0.2
SLICE_BATCH_SIZE = 16

# Duplicates from overlapping slices are merged above this IoU
MERGE_IOU_THRESHOLD = 0.45

# Ignore extremely tiny detections in the full-image pass.
# Not applied to slice detections: their original-image size is
# expected to be small — that is the whole point of slicing.
MIN_BOX_WIDTH = 8
MIN_BOX_HEIGHT = 8


# ============================================================
# Helper Functions
# ============================================================

def safe_float(value):
    """Convert a value to float safely."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def calculate_box_size(x1, y1, x2, y2):
    """Return bounding box width and height."""
    width = max(0.0, x2 - x1)
    height = max(0.0, y2 - y1)
    return width, height


def build_slice_offsets(dimension):
    """Slice positions along one axis with SLICE_OVERLAP overlap."""
    step = int(SLICE_SIZE * (1 - SLICE_OVERLAP))

    offsets = []
    start = 0

    while start < dimension:
        end = min(start + SLICE_SIZE, dimension)
        offsets.append((start, end))

        if end >= dimension:
            break

        start += step

    return offsets


def box_iou(box_a, box_b):
    """Intersection over Union of two bounding boxes."""
    x1 = max(box_a["x1"], box_b["x1"])
    y1 = max(box_a["y1"], box_b["y1"])
    x2 = min(box_a["x2"], box_b["x2"])
    y2 = min(box_a["y2"], box_b["y2"])

    intersection = max(0.0, x2 - x1) * max(0.0, y2 - y1)

    area_a = max(0.0, box_a["x2"] - box_a["x1"]) * max(
        0.0, box_a["y2"] - box_a["y1"]
    )
    area_b = max(0.0, box_b["x2"] - box_b["x1"]) * max(
        0.0, box_b["y2"] - box_b["y1"]
    )

    union = area_a + area_b - intersection

    return intersection / union if union > 0 else 0.0


def box_center(box):
    """Return the center point of a bounding box."""
    return ((box["x1"] + box["x2"]) / 2.0, (box["y1"] + box["y2"]) / 2.0)


def box_area(box):
    """Return the area of a bounding box."""
    return max(0.0, box["x2"] - box["x1"]) * max(0.0, box["y2"] - box["y1"])


def center_distance_normalized(box_a, box_b):
    """
    Return center distance normalized by the average box size.
    A value near 0 means the boxes are centered on the same object.
    """
    cx_a, cy_a = box_center(box_a)
    cx_b, cy_b = box_center(box_b)

    distance = ((cx_a - cx_b) ** 2 + (cy_a - cy_b) ** 2) ** 0.5

    width_a = box_a["x2"] - box_a["x1"]
    height_a = box_a["y2"] - box_a["y1"]
    width_b = box_b["x2"] - box_b["x1"]
    height_b = box_b["y2"] - box_b["y1"]

    avg_size = max(1.0, (width_a + height_a + width_b + height_b) / 4.0)

    return distance / avg_size


def containment_ratio(smaller_box, larger_box):
    """
    Return the fraction of the smaller box that is inside the larger box.
    High values indicate one detection is almost completely inside another.
    """
    x1 = max(smaller_box["x1"], larger_box["x1"])
    y1 = max(smaller_box["y1"], larger_box["y1"])
    x2 = min(smaller_box["x2"], larger_box["x2"])
    y2 = min(smaller_box["y2"], larger_box["y2"])

    intersection = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    smaller_area = box_area(smaller_box)

    return intersection / smaller_area if smaller_area > 0 else 0.0


def overlap_ratio(box_a, box_b):
    """
    Return intersection area divided by the area of the smaller box.
    High values mean the boxes heavily overlap the same region.
    """
    x1 = max(box_a["x1"], box_b["x1"])
    y1 = max(box_a["y1"], box_b["y1"])
    x2 = min(box_a["x2"], box_b["x2"])
    y2 = min(box_a["y2"], box_b["y2"])

    intersection = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    smaller_area = min(box_area(box_a), box_area(box_b))

    return intersection / smaller_area if smaller_area > 0 else 0.0


def is_same_detection(box_a, box_b):
    """
    Decide whether two bounding boxes represent the same person.
    Combines IoU, containment, overlap, and center proximity.
    """
    iou = box_iou(box_a, box_b)
    if iou >= MERGE_IOU_THRESHOLD:
        return True

    overlap = overlap_ratio(box_a, box_b)
    contain = max(
        containment_ratio(box_a, box_b),
        containment_ratio(box_b, box_a),
    )
    normalized_center_distance = center_distance_normalized(box_a, box_b)

    # Strong overlap or containment indicates the same person.
    if overlap >= 0.30 or contain >= 0.50:
        return True

    # Moderate overlap combined with close centers handles partial
    # detections across slice edges where each slice sees only part of
    # the same person.
    if overlap >= 0.18 and normalized_center_distance <= 0.60:
        return True

    # Centers nearly on top of each other with any meaningful overlap.
    if normalized_center_distance <= 0.50 and overlap >= 0.10:
        return True

    return False


def merge_duplicate_detections(detections):
    """Greedy NMS — keeps highest confidence box of each person."""
    detections.sort(key=lambda item: item["confidence"], reverse=True)

    kept = []

    for detection in detections:
        is_duplicate = any(
            detection["class"] == existing["class"]
            and is_same_detection(detection["bbox"], existing["bbox"])
            for existing in kept
        )

        if not is_duplicate:
            kept.append(detection)

    return kept


def collect_detections(
    result,
    x_offset=0,
    y_offset=0,
    apply_min_box=False,
):
    """Read person boxes from one YOLO result, offset to original coords."""
    detections = []

    boxes = result.boxes

    if boxes is None:
        return detections

    xyxy_list = boxes.xyxy.tolist()
    confidence_list = boxes.conf.tolist()

    for i in range(len(xyxy_list)):

        x1, y1, x2, y2 = xyxy_list[i]

        confidence = safe_float(confidence_list[i])

        if apply_min_box:

            box_width, box_height = calculate_box_size(
                x1,
                y1,
                x2,
                y2,
            )

            if (
                box_width < MIN_BOX_WIDTH
                or box_height < MIN_BOX_HEIGHT
            ):
                continue

        detections.append(
            {
                "confidence": round(confidence, 4),

                "class": "person",

                "bbox": {
                    "x1": round(max(0.0, x1 + x_offset), 2),
                    "y1": round(max(0.0, y1 + y_offset), 2),
                    "x2": round(x2 + x_offset, 2),
                    "y2": round(y2 + y_offset, 2),
                },
            }
        )

    return detections


# ============================================================
# Main Detection
# ============================================================

def main():

    if len(sys.argv) != 3:
        print(
            json.dumps(
                {
                    "success": False,
                    "error": (
                        "Usage: victimDetection.py "
                        "<model_path> <image_path>"
                    ),
                }
            )
        )
        sys.exit(1)

    model_path = Path(sys.argv[1])
    image_path = Path(sys.argv[2])

    # --------------------------------------------------------
    # Validate files
    # --------------------------------------------------------

    if not model_path.exists():
        print(
            json.dumps(
                {
                    "success": False,
                    "error": f"Model not found: {model_path}",
                }
            )
        )
        sys.exit(1)

    if not image_path.exists():
        print(
            json.dumps(
                {
                    "success": False,
                    "error": f"Image not found: {image_path}",
                }
            )
        )
        sys.exit(1)

    try:

        # ----------------------------------------------------
        # Load YOLO model and image
        # ----------------------------------------------------

        model = YOLO(str(model_path))

        # BGR numpy array — ultralytics convention for array input.
        # exif_transpose keeps phone photos oriented like the
        # browser preview, so boxes match what the user sees.
        pil_image = ImageOps.exif_transpose(
            Image.open(str(image_path))
        ).convert("RGB")

        image = np.array(pil_image)[:, :, ::-1]

        image_height, image_width = image.shape[0], image.shape[1]

        all_detections = []

        # ----------------------------------------------------
        # Pass 1 — full image
        # Catches people larger than a single slice
        # ----------------------------------------------------

        full_result = model.predict(
            source=image,

            # COCO class 0 = person
            classes=[0],

            conf=CONFIDENCE_THRESHOLD,

            imgsz=IMAGE_SIZE,

            iou=IOU_THRESHOLD,

            max_det=MAX_DETECTIONS,

            verbose=False,
        )[0]

        all_detections.extend(
            collect_detections(
                full_result,
                apply_min_box=True,
            )
        )

        # ----------------------------------------------------
        # Pass 2 — sliced inference
        # Catches small / distant people that vanish when the
        # full image is downscaled
        # ----------------------------------------------------

        slices_processed = 0

        if image_width > SLICE_SIZE or image_height > SLICE_SIZE:

            x_offsets = build_slice_offsets(image_width)
            y_offsets = build_slice_offsets(image_height)

            slice_regions = [
                (x_start, x_end, y_start, y_end)
                for y_start, y_end in y_offsets
                for x_start, x_end in x_offsets
            ]

            slices = [
                image[y_start:y_end, x_start:x_end]
                for x_start, x_end, y_start, y_end in slice_regions
            ]

            slices_processed = len(slices)

            for batch_start in range(0, len(slices), SLICE_BATCH_SIZE):

                batch = slices[
                    batch_start : batch_start + SLICE_BATCH_SIZE
                ]

                batch_regions = slice_regions[
                    batch_start : batch_start + SLICE_BATCH_SIZE
                ]

                batch_results = model.predict(
                    source=batch,

                    classes=[0],

                    conf=CONFIDENCE_THRESHOLD,

                    imgsz=SLICE_SIZE,

                    iou=IOU_THRESHOLD,

                    max_det=MAX_DETECTIONS,

                    verbose=False,
                )

                for (
                    x_start,
                    x_end,
                    y_start,
                    y_end,
                ), result in zip(batch_regions, batch_results):
                    all_detections.extend(
                        collect_detections(
                            result,
                            x_offset=x_start,
                            y_offset=y_start,
                        )
                    )

        # ----------------------------------------------------
        # Merge duplicates from overlapping slices
        # ----------------------------------------------------

        detections = merge_duplicate_detections(all_detections)

        # ----------------------------------------------------
        # Risk Classification
        # ----------------------------------------------------

        high_risk = 0
        medium_risk = 0
        low_risk = 0

        for detection in detections:

            confidence = detection["confidence"]

            if confidence >= 0.75:
                high_risk += 1

            elif confidence >= 0.50:
                medium_risk += 1

            else:
                low_risk += 1

        # ----------------------------------------------------
        # Average confidence
        # ----------------------------------------------------

        if detections:

            average_confidence = sum(
                detection["confidence"]
                for detection in detections
            ) / len(detections)

        else:
            average_confidence = 0.0

        # ----------------------------------------------------
        # Final Response
        # ----------------------------------------------------

        response = {
            "success": True,

            "model": model_path.name,

            "image": {
                "name": image_path.name,
                "width": image_width,
                "height": image_height,
            },

            "settings": {
                "confidenceThreshold": CONFIDENCE_THRESHOLD,
                "iouThreshold": IOU_THRESHOLD,
                "imageSize": IMAGE_SIZE,
                "sliceSize": SLICE_SIZE,
                "sliceOverlap": SLICE_OVERLAP,
                "maxDetections": MAX_DETECTIONS,
                "detectedClass": "person",
            },

            "totalVictims": len(detections),

            "riskSummary": {
                "highRisk": high_risk,
                "mediumRisk": medium_risk,
                "lowRisk": low_risk,
            },

            "averageConfidence": round(
                average_confidence,
                4,
            ),

            "slicesProcessed": slices_processed,

            "detections": detections,
        }

        print(json.dumps(response))

    except Exception as error:

        print(
            json.dumps(
                {
                    "success": False,
                    "error": str(error),
                }
            )
        )

        sys.exit(1)


# ============================================================
# Entry Point
# ============================================================

if __name__ == "__main__":
    main()
