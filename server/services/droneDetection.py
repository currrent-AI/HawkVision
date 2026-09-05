import sys
import json
import os
import time
import math
import cv2
import numpy as np
from ultralytics import YOLO

# ============================================================
# HAWKVISION AI - DRONE PERSON / POTENTIAL VICTIM DETECTION
# ============================================================
# This version uses tiled/sliced inference so small people in
# aerial/disaster footage occupy more pixels before YOLO sees them.
#
# Pipeline:
#   frame -> 3x3 overlapping tiles -> YOLO26m person detection
#         -> merge duplicate boxes -> lightweight tracking
#         -> temporal confirmation (suppress one-frame false positives)
#         -> HawkVision JSON + annotated MJPEG
#
# NOTE: A COCO pretrained YOLO model detects PERSON. HawkVision
# labels those detections as potential victims for the demo; it does
# not medically determine whether someone is a victim.
# ============================================================

# ------------------------------------------------------------
# DETECTION SETTINGS
# ------------------------------------------------------------
CONFIDENCE_THRESHOLD = 0.20
IOU_THRESHOLD = 0.45
IMAGE_SIZE = 1280
MAX_DETECTIONS = 100
PERSON_CLASS_ID = 0

# ------------------------------------------------------------
# SLICING SETTINGS
# Exactly 3x3 overlapping tiles. This avoids the slowdown that can
# happen when generic sliding-window code is used with more tiles.
TILE_ROWS = 3
TILE_COLS = 3
TILE_OVERLAP = 0.20

# Recorded-video live analysis: emit at most ~2 AI frames/sec.
# This prevents the Python process from racing far ahead of the HTML5 video.
LIVE_SAMPLE_INTERVAL = 0.50

# ------------------------------------------------------------
# TEMPORAL CONFIRMATION SETTINGS
# CONFIDENCE_THRESHOLD stays the YOLO inference floor (kept at 0.12
# so weak/blurry people still reach the tracker). A detection is only
# REPORTED once its track has been observed on TRACK_MIN_HITS frames,
# or immediately when YOLO is confident enough (TRACK_STRONG_CONF).
# One-frame flickers on debris/water are therefore never shown.
# ------------------------------------------------------------
TRACK_MIN_HITS = 2
TRACK_STRONG_CONF = 0.50

# ------------------------------------------------------------
# LIGHTWEIGHT PERSON TRACKING SETTINGS
# The detector is sliced; therefore detections are merged first and
# then tracked in the original full-frame coordinate system.
# ------------------------------------------------------------
TRACK_MAX_DISTANCE = 110
TRACK_MAX_MISSED = 3
TRACK_IOU_MATCH = 0.08


# ============================================================
# JSON OUTPUT
# ============================================================

def emit(data):
    """Print one machine-readable JSON event to stdout."""
    print(json.dumps(data), flush=True)


# ============================================================
# RISK / PRIORITY
# ============================================================

def get_risk(confidence):
    """Confidence-based demo priority, not medical assessment."""
    confidence = float(confidence)

    if confidence >= 0.80:
        return "HIGH"
    if confidence >= 0.55:
        return "MEDIUM"
    return "LOW"


# ============================================================
# PERSON CLASS CHECK
# ============================================================

def is_person_class(model, class_id):
    try:
        class_id = int(class_id)
        class_name = str(model.names[class_id]).lower().strip()
        return class_name in ("person", "victim", "human")
    except Exception:
        return int(class_id) == PERSON_CLASS_ID


def get_person_class_ids(model):
    """Find the model's person/human class IDs safely."""
    ids = []

    try:
        names = model.names

        if isinstance(names, dict):
            items = names.items()
        else:
            items = enumerate(names)

        for class_id, name in items:
            if str(name).lower().strip() in ("person", "victim", "human"):
                ids.append(int(class_id))
    except Exception:
        pass

    if not ids:
        ids = [PERSON_CLASS_ID]

    return ids


# ============================================================
# LOAD MODEL
# ============================================================

def load_model(model_path):
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"YOLO model not found: {model_path}"
        )

    print(
        f"[HAWKVISION] Loading YOLO model: {model_path}",
        file=sys.stderr,
        flush=True,
    )

    model = YOLO(model_path)

    print(
        "[HAWKVISION] YOLO model loaded successfully",
        file=sys.stderr,
        flush=True,
    )

    try:
        print(
            f"[HAWKVISION] Model classes: {model.names}",
            file=sys.stderr,
            flush=True,
        )
    except Exception:
        pass

    person_ids = get_person_class_ids(model)

    print(
        f"[HAWKVISION] Person class IDs: {person_ids}",
        file=sys.stderr,
        flush=True,
    )

    return model


# ============================================================
# 3x3 OVERLAPPING TILES
# ============================================================

def _tile_start_positions(full_size, tile_size, count):
    """Return exactly count starts, including the final image edge."""
    if count <= 1 or tile_size >= full_size:
        return [0]

    max_start = max(0, full_size - tile_size)

    if count == 2:
        overlap_pixels = int(tile_size * TILE_OVERLAP)
        second_start = max_start

        # Keep the requested overlap when possible.
        desired = tile_size - overlap_pixels
        second_start = min(max_start, max(0, desired))

        # Always make the last tile touch the right/bottom edge.
        return [0, max_start]

    positions = []
    for i in range(count):
        value = int(round(max_start * i / (count - 1)))
        positions.append(value)

    return sorted(set(positions))


def generate_tiles(frame):
    """Create a 3x3 set of overlapping crops in full-frame coordinates."""
    if frame is None or frame.size == 0:
        return []

    height, width = frame.shape[:2]

    if width <= 0 or height <= 0:
        return []

    # For N tiles with overlap fraction o, tile = full / (N - o*(N-1)).
    # Example 640px width, 3 cols, 20% overlap -> 246px tile, 128px overlap.
    tile_width = int(math.ceil(width / (TILE_COLS - TILE_OVERLAP * (TILE_COLS - 1))))
    tile_height = int(math.ceil(height / (TILE_ROWS - TILE_OVERLAP * (TILE_ROWS - 1))))

    tile_width = min(width, max(1, tile_width))
    tile_height = min(height, max(1, tile_height))

    xs = _tile_start_positions(width, tile_width, TILE_COLS)
    ys = _tile_start_positions(height, tile_height, TILE_ROWS)

    tiles = []
    seen = set()

    for row, y in enumerate(ys):
        for col, x in enumerate(xs):
            x2 = min(width, x + tile_width)
            y2 = min(height, y + tile_height)

            key = (x, y, x2, y2)
            if key in seen:
                continue

            seen.add(key)

            crop = frame[y:y2, x:x2]

            if crop is None or crop.size == 0:
                continue

            tiles.append({
                "row": row,
                "col": col,
                "x": x,
                "y": y,
                "x2": x2,
                "y2": y2,
                "image": crop,
            })

    return tiles


# ============================================================
# BOX UTILITIES
# ============================================================

def box_iou(box_a, box_b):
    ax1, ay1, ax2, ay2 = box_a
    bx1, by1, bx2, by2 = box_b

    ix1 = max(ax1, bx1)
    iy1 = max(ay1, by1)
    ix2 = min(ax2, bx2)
    iy2 = min(ay2, by2)

    iw = max(0, ix2 - ix1)
    ih = max(0, iy2 - iy1)
    intersection = iw * ih

    if intersection <= 0:
        return 0.0

    area_a = max(0, ax2 - ax1) * max(0, ay2 - ay1)
    area_b = max(0, bx2 - bx1) * max(0, by2 - by1)

    union = area_a + area_b - intersection

    if union <= 0:
        return 0.0

    return intersection / union


def merge_sliced_detections(raw_detections):
    """Confidence-sorted NMS in original-frame coordinates."""
    if not raw_detections:
        return []

    ordered = sorted(
        raw_detections,
        key=lambda item: float(item["confidence"]),
        reverse=True,
    )

    kept = []

    for candidate in ordered:
        candidate_box = candidate["box"]

        duplicate = False

        for existing in kept:
            if box_iou(candidate_box, existing["box"]) >= IOU_THRESHOLD:
                duplicate = True
                break

        if duplicate:
            continue

        kept.append(candidate)

        if len(kept) >= MAX_DETECTIONS:
            break

    return kept


# ============================================================
# SLICED YOLO DETECTION
# ============================================================

def sliced_detect(model, frame):
    """
    Run YOLO on 3x3 overlapping crops and map all boxes back to the
    original frame. Only person class is requested from YOLO.
    """
    if frame is None or frame.size == 0:
        return []

    raw_detections = []
    person_class_ids = get_person_class_ids(model)
    tiles = generate_tiles(frame)

    print(
        f"[HAWKVISION] Sliced frame: {len(tiles)} tiles",
        file=sys.stderr,
        flush=True,
    )

    frame_height, frame_width = frame.shape[:2]

    for tile in tiles:
        offset_x = tile["x"]
        offset_y = tile["y"]
        tile_row = tile["row"]
        tile_col = tile["col"]
        tile_image = tile["image"]

        try:
            results = model.predict(
                tile_image,
                conf=CONFIDENCE_THRESHOLD,
                iou=IOU_THRESHOLD,
                imgsz=IMAGE_SIZE,
                max_det=MAX_DETECTIONS,
                classes=person_class_ids,
                verbose=False,
            )
        except Exception as error:
            print(
                f"[SLICE ERROR] tile=({tile_row},{tile_col}): {error}",
                file=sys.stderr,
                flush=True,
            )
            continue

        if not results:
            continue

        result = results[0]
        boxes = result.boxes

        if boxes is None:
            continue

        for index in range(len(boxes)):
            try:
                class_id = int(boxes.cls[index].item())
                confidence = float(boxes.conf[index].item())

                if not is_person_class(model, class_id):
                    continue

                coordinates = (
                    boxes.xyxy[index]
                    .detach()
                    .cpu()
                    .numpy()
                )

                tile_x1 = int(round(coordinates[0]))
                tile_y1 = int(round(coordinates[1]))
                tile_x2 = int(round(coordinates[2]))
                tile_y2 = int(round(coordinates[3]))

                x1 = tile_x1 + offset_x
                y1 = tile_y1 + offset_y
                x2 = tile_x2 + offset_x
                y2 = tile_y2 + offset_y

                print(
                    "[PERSON DEBUG] "
                    f"tile=({tile_row},{tile_col}) "
                    f"tile_offset=({offset_x},{offset_y}) "
                    f"tile_bbox=({tile_x1},{tile_y1},{tile_x2},{tile_y2}) "
                    f"original_bbox=({x1},{y1},{x2},{y2}) "
                    f"confidence={confidence:.3f}",
                    file=sys.stderr,
                    flush=True,
                )

                x1 = max(0, min(frame_width - 1, x1))
                y1 = max(0, min(frame_height - 1, y1))
                x2 = max(0, min(frame_width, x2))
                y2 = max(0, min(frame_height, y2))

                if x2 <= x1 or y2 <= y1:
                    continue

                raw_detections.append({
                    "box": (x1, y1, x2, y2),
                    "confidence": confidence,
                })

            except Exception as error:
                print(
                    f"[YOLO DEBUG] slice box error: {error}",
                    file=sys.stderr,
                    flush=True,
                )

    merged = merge_sliced_detections(raw_detections)

    print(
        f"[HAWKVISION] Person detections: raw={len(raw_detections)} merged={len(merged)}",
        file=sys.stderr,
        flush=True,
    )

    return merged


# ============================================================
# LIGHTWEIGHT TRACKER
# ============================================================

class PersonTracker:
    """
    Simple frame-to-frame tracker in original-frame coordinates.
    It keeps IDs stable after sliced detections are merged, and counts
    how many frames each track has been observed on so one-frame false
    positives can be suppressed (temporal confirmation). It never
    re-emits boxes for frames where YOLO found nothing, so it cannot
    invent people.
    """

    def __init__(self):
        self.next_id = 1
        self.tracks = {}

    def reset(self):
        self.next_id = 1
        self.tracks = {}

    @staticmethod
    def center(box):
        x1, y1, x2, y2 = box
        return ((x1 + x2) / 2.0, (y1 + y2) / 2.0)

    @staticmethod
    def diagonal(box):
        x1, y1, x2, y2 = box
        return max(1.0, math.hypot(x2 - x1, y2 - y1))

    @staticmethod
    def _is_confirmed(hits, confidence):
        """
        A detection is reportable once its track has been seen on
        TRACK_MIN_HITS frames, or immediately at a strong confidence.
        """
        return (
            hits >= TRACK_MIN_HITS
            or float(confidence) >= TRACK_STRONG_CONF
        )

    def update(self, detections):
        for track in self.tracks.values():
            track["missed"] += 1

        if not detections:
            self._remove_old_tracks()
            return detections

        candidates = []

        for track_id, track in self.tracks.items():
            track_box = track["box"]
            track_center = track["center"]
            scale = max(40.0, self.diagonal(track_box) * 1.5)

            for detection_index, detection in enumerate(detections):
                detection_box = detection["box"]
                detection_center = self.center(detection_box)

                distance = math.hypot(
                    detection_center[0] - track_center[0],
                    detection_center[1] - track_center[1],
                )

                overlap = box_iou(track_box, detection_box)

                # Moving drone footage can shift objects considerably.
                # Accept either spatial proximity or modest overlap.
                if distance <= max(TRACK_MAX_DISTANCE, scale) or overlap >= TRACK_IOU_MATCH:
                    # Lower score is better.
                    score = distance - (overlap * 150.0)
                    candidates.append(
                        (score, track_id, detection_index)
                    )

        used_tracks = set()
        used_detections = set()

        for _, track_id, detection_index in sorted(candidates):
            if track_id in used_tracks:
                continue

            if detection_index in used_detections:
                continue

            detection = detections[detection_index]
            box = detection["box"]
            center = self.center(box)
            hits = self.tracks[track_id].get("hits", 0) + 1

            self.tracks[track_id].update({
                "box": box,
                "center": center,
                "confidence": detection["confidence"],
                "missed": 0,
                "hits": hits,
            })

            detection["track_id"] = track_id
            detection["confirmed"] = self._is_confirmed(
                hits,
                detection["confidence"],
            )

            used_tracks.add(track_id)
            used_detections.add(detection_index)

        # New detections receive new IDs.
        for detection_index, detection in enumerate(detections):
            if detection_index in used_detections:
                continue

            box = detection["box"]
            track_id = self.next_id
            self.next_id += 1

            self.tracks[track_id] = {
                "box": box,
                "center": self.center(box),
                "confidence": detection["confidence"],
                "missed": 0,
                "hits": 1,
            }

            detection["track_id"] = track_id
            detection["confirmed"] = self._is_confirmed(
                1,
                detection["confidence"],
            )

        self._remove_old_tracks()

        return detections

    def _remove_old_tracks(self):
        for track_id in list(self.tracks.keys()):
            if self.tracks[track_id]["missed"] > TRACK_MAX_MISSED:
                del self.tracks[track_id]


TRACKER = PersonTracker()


def reset_tracker():
    TRACKER.reset()


# ============================================================
# API DETECTION FORMAT
# ============================================================

def detections_to_api(detections):
    output = []

    for index, detection in enumerate(detections):
        x1, y1, x2, y2 = detection["box"]
        confidence = float(detection["confidence"])
        track_id = detection.get("track_id")

        if track_id is not None:
            person_id = f"P{int(track_id):02d}"
        else:
            person_id = f"P{index + 1:02d}"

        output.append({
            "id": person_id,
            "class": "victim",
            "confidence": round(confidence * 100.0, 1),
            "risk": get_risk(confidence),
            "bbox": {
                "x": int(x1),
                "y": int(y1),
                "width": int(max(0, x2 - x1)),
                "height": int(max(0, y2 - y1)),
            },
        })

    return output


# ============================================================
# FRAME DETECTION
# ============================================================

def detect_frame(model, frame, tracking=True):
    if frame is None or frame.size == 0:
        return None, []

    sliced_detections = sliced_detect(model, frame)

    if tracking:
        sliced_detections = TRACKER.update(sliced_detections)
        # Temporal confirmation: only report tracks observed on enough
        # frames (or with strong confidence). One-frame flickers on
        # debris/water are suppressed here, never faked into victims.
        sliced_detections = [
            detection
            for detection in sliced_detections
            if detection.get("confirmed", True)
        ]

    return None, detections_to_api(sliced_detections)


# ============================================================
# DRAW OVERLAY
# ============================================================

def draw_overlay(frame, detections):
    if frame is None:
        return frame

    for detection in detections:
        bbox = detection["bbox"]

        x = int(bbox["x"])
        y = int(bbox["y"])
        width = int(bbox["width"])
        height = int(bbox["height"])

        confidence = float(detection["confidence"])
        risk = detection["risk"]
        person_id = detection["id"]

        if risk == "HIGH":
            color = (40, 51, 239)
        elif risk == "MEDIUM":
            color = (0, 165, 255)
        else:
            color = (34, 197, 94)

        x2 = x + width
        y2 = y + height

        cv2.rectangle(
            frame,
            (x, y),
            (x2, y2),
            color,
            2,
        )

        label = f"{person_id} | {confidence:.0f}% | {risk}"

        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.55
        thickness = 2

        text_size, _ = cv2.getTextSize(
            label,
            font,
            font_scale,
            thickness,
        )

        text_width = text_size[0]
        text_height = text_size[1]

        label_y = max(y, text_height + 8)

        cv2.rectangle(
            frame,
            (x, label_y - text_height - 8),
            (x + text_width + 10, label_y),
            color,
            -1,
        )

        cv2.putText(
            frame,
            label,
            (x + 5, label_y - 5),
            font,
            font_scale,
            (255, 255, 255),
            thickness,
            cv2.LINE_AA,
        )

    # Watermark
    cv2.putText(
        frame,
        "HAWKVISION AI | DRONE INTELLIGENCE",
        (20, 35),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

    # Live indicator
    cv2.circle(
        frame,
        (25, 65),
        7,
        (0, 0, 255),
        -1,
    )

    cv2.putText(
        frame,
        "LIVE AI DETECTION",
        (40, 71),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

    # Person count
    cv2.putText(
        frame,
        f"PERSONS: {len(detections)}",
        (20, 105),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

    return frame


# ============================================================
# RECORDED VIDEO ANALYSIS
# ============================================================

def analyze_video(model, video_path):
    if not os.path.exists(video_path):
        raise FileNotFoundError(
            f"Video not found: {video_path}"
        )

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise RuntimeError("Could not open drone video")

    reset_tracker()

    total_frames = 0
    processed_frames = 0
    detected_ids = set()
    confidence_values = []
    max_confidence = 0.0

    while True:
        success, frame = cap.read()

        if not success:
            break

        total_frames += 1

        # Process every second frame for offline analysis.
        if total_frames % 2 != 0:
            continue

        processed_frames += 1

        try:
            _, detections = detect_frame(
                model,
                frame,
                tracking=True,
            )
        except Exception as error:
            print(
                f"[YOLO ERROR] {error}",
                file=sys.stderr,
                flush=True,
            )
            continue

        for detection in detections:
            detected_ids.add(detection["id"])

            confidence = float(detection["confidence"])
            confidence_values.append(confidence)
            max_confidence = max(max_confidence, confidence)

    cap.release()

    high_priority = 0
    medium_priority = 0
    low_priority = 0

    for confidence in confidence_values:
        risk = get_risk(confidence / 100.0)

        if risk == "HIGH":
            high_priority += 1
        elif risk == "MEDIUM":
            medium_priority += 1
        else:
            low_priority += 1

    average_confidence = 0.0

    if confidence_values:
        average_confidence = (
            sum(confidence_values) / len(confidence_values)
        )

    return {
        "success": True,
        "model": "YOLO26m",
        "mode": "recorded",
        "detectionMethod": "3x3 sliced inference",
        "totalFrames": total_frames,
        "processedFrames": processed_frames,
        "victimsDetected": len(detected_ids),
        "totalTracks": len(detected_ids),
        "highPriority": high_priority,
        "mediumPriority": medium_priority,
        "lowPriority": low_priority,
        "maxConfidence": round(max_confidence, 1),
        "averageConfidence": round(average_confidence, 1),
    }


# ============================================================
# LIVE JSON STREAM
# ============================================================

def live_stream(model, source):
    """Stream person detections with a video-synchronized timeline."""
    print(
        f"[HAWKVISION] Opening live source: {source}",
        file=sys.stderr,
        flush=True,
    )

    is_recorded_file = os.path.isfile(source)
    cap = cv2.VideoCapture(source)

    try:
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    except Exception:
        pass

    if not cap.isOpened():
        emit({
            "type": "error",
            "error": "Unable to open drone video/stream",
            "source": source,
        })
        return

    reset_tracker()

    fps = float(cap.get(cv2.CAP_PROP_FPS) or 0.0)
    if fps <= 1.0 or fps > 240.0:
        fps = 30.0

    frame_number = 0
    last_processed_time = -LIVE_SAMPLE_INTERVAL
    wall_start = time.monotonic()

    emit({
        "type": "connected",
        "mode": "live",
        "source": "recorded_video" if is_recorded_file else "drone_camera",
        "detectionMethod": "3x3 sliced inference",
        "fps": fps,
    })

    while True:
        success, frame = cap.read()

        if not success:
            if is_recorded_file:
                final_time = max(0.0, frame_number / fps)
                emit({
                    "type": "detection",
                    "mode": "live",
                    "frame": frame_number,
                    "timestamp": final_time,
                    "videoTime": final_time,
                    "victims": [],
                    "counts": {"total": 0, "high": 0, "medium": 0, "low": 0},
                })
                emit({"type": "complete", "mode": "recorded_video"})
                break

            time.sleep(0.05)
            continue

        frame_number += 1
        video_time = (frame_number - 1) / fps

        # Recorded footage is sampled by VIDEO TIME, not wall-clock time.
        if is_recorded_file and (video_time - last_processed_time) < LIVE_SAMPLE_INTERVAL:
            continue

        last_processed_time = video_time

        try:
            _, detections = detect_frame(model, frame, tracking=True)

            high = sum(1 for d in detections if d["risk"] == "HIGH")
            medium = sum(1 for d in detections if d["risk"] == "MEDIUM")
            low = sum(1 for d in detections if d["risk"] == "LOW")

            emit({
                "type": "detection",
                "mode": "live",
                "frame": frame_number,
                "timestamp": video_time if is_recorded_file else (time.monotonic() - wall_start),
                "videoTime": video_time if is_recorded_file else None,
                "victims": detections,
                "counts": {
                    "total": len(detections),
                    "high": high,
                    "medium": medium,
                    "low": low,
                },
            })

        except Exception as error:
            print(f"[YOLO ERROR] {error}", file=sys.stderr, flush=True)
            emit({"type": "error", "error": str(error)})
            if is_recorded_file:
                time.sleep(0.05)

    cap.release()


# ============================================================
# MJPEG STREAM
# ============================================================

def mjpeg_stream(model, source):
    print(
        f"[HAWKVISION] Opening MJPEG source: {source}",
        file=sys.stderr,
        flush=True,
    )

    cap = cv2.VideoCapture(source)

    try:
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    except Exception:
        pass

    if not cap.isOpened():
        print(
            "Unable to connect to drone stream",
            file=sys.stderr,
            flush=True,
        )
        return

    reset_tracker()

    while True:
        success, frame = cap.read()

        if not success:
            time.sleep(0.05)
            continue

        try:
            _, detections = detect_frame(
                model,
                frame,
                tracking=True,
            )

            frame = draw_overlay(
                frame,
                detections,
            )

            success, encoded = cv2.imencode(
                ".jpg",
                frame,
                [
                    int(cv2.IMWRITE_JPEG_QUALITY),
                    82,
                ],
            )

            if not success:
                continue

            jpg = encoded.tobytes()

            sys.stdout.buffer.write(b"--frame\r\n")
            sys.stdout.buffer.write(b"Content-Type: image/jpeg\r\n")
            sys.stdout.buffer.write(
                f"Content-Length: {len(jpg)}\r\n\r\n".encode()
            )
            sys.stdout.buffer.write(jpg)
            sys.stdout.buffer.write(b"\r\n")
            sys.stdout.buffer.flush()

        except Exception as error:
            print(
                f"[MJPEG YOLO ERROR] {error}",
                file=sys.stderr,
                flush=True,
            )
            time.sleep(0.01)

    cap.release()


# ============================================================
# MAIN
# ============================================================

def main():
    # Expected:
    # python droneDetection.py <model> <source> <mode>
    # mode = analyze | stream | mjpeg

    if len(sys.argv) < 4:
        print(
            "Usage: python droneDetection.py <model> <source> <mode>",
            file=sys.stderr,
        )
        sys.exit(1)

    model_path = sys.argv[1]
    source = sys.argv[2]
    mode = sys.argv[3].lower().strip()

    try:
        model = load_model(model_path)

        if mode == "analyze":
            result = analyze_video(model, source)
            print(json.dumps(result), flush=True)

        elif mode == "stream":
            live_stream(model, source)

        elif mode == "mjpeg":
            mjpeg_stream(model, source)

        else:
            raise ValueError(
                f"Unknown mode: {mode}"
            )

    except Exception as error:
        print(
            f"[HAWKVISION ERROR] {error}",
            file=sys.stderr,
            flush=True,
        )

        if mode == "analyze":
            print(
                json.dumps({
                    "success": False,
                    "error": str(error),
                }),
                flush=True,
            )
        else:
            emit({
                "type": "error",
                "error": str(error),
            })

        sys.exit(1)


if __name__ == "__main__":
    main()

