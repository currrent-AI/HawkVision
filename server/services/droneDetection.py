import sys
import json
import os
import time
import cv2

from ultralytics import YOLO


# ============================================================
# HAWKVISION AI
# DRONE PERSON / POTENTIAL VICTIM DETECTION
#
# Model:
#   YOLO26m
#
# Tracking:
#   BoT-SORT
#
# Important:
#   YOLO detects PERSON objects.
#   In flood/disaster footage these are treated as
#   potential victims by HawkVision.
# ============================================================


# ============================================================
# CONFIGURATION
# ============================================================

CONFIDENCE_THRESHOLD = 0.15
IOU_THRESHOLD = 0.50
IMAGE_SIZE = 1280
MAX_DETECTIONS = 100

# COCO person class
PERSON_CLASS_ID = 0


# ============================================================
# JSON OUTPUT
# ============================================================

def emit(data):
    """
    Machine-readable JSON output.

    stdout must remain clean in stream mode.
    Logs go to stderr.
    """

    print(
        json.dumps(data),
        flush=True
    )


# ============================================================
# RISK / PRIORITY
# ============================================================

def get_risk(confidence):
    """
    Convert detection confidence into HawkVision
    priority level.

    This is NOT a medical assessment.
    It is a confidence-based demo priority.
    """

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

        class_name = str(
            model.names[class_id]
        ).lower().strip()

        return class_name in (
            "person",
            "victim",
            "human"
        )

    except Exception:

        return int(class_id) == PERSON_CLASS_ID


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
        flush=True
    )

    model = YOLO(model_path)

    print(
        "[HAWKVISION] YOLO model loaded successfully",
        file=sys.stderr,
        flush=True
    )

    try:

        print(
            f"[HAWKVISION] Model classes: {model.names}",
            file=sys.stderr,
            flush=True
        )

    except Exception:
        pass

    return model


# ============================================================
# FRAME DETECTION
# ============================================================

def detect_frame(model, frame, tracking=True):

    if frame is None or frame.size == 0:

        return None, []

    # --------------------------------------------------------
    # YOLO TRACKING
    # --------------------------------------------------------

    if tracking:

        results = model.track(

            frame,

            persist=True,

            conf=CONFIDENCE_THRESHOLD,

            iou=IOU_THRESHOLD,

            imgsz=IMAGE_SIZE,

            max_det=MAX_DETECTIONS,

            tracker="botsort.yaml",

            verbose=False
        )

    # --------------------------------------------------------
    # NORMAL YOLO DETECTION
    # --------------------------------------------------------

    else:

        results = model.predict(

            frame,

            conf=CONFIDENCE_THRESHOLD,

            iou=IOU_THRESHOLD,

            imgsz=IMAGE_SIZE,

            max_det=MAX_DETECTIONS,

            verbose=False
        )

    if not results:

        return None, []

    result = results[0]

    if result.boxes is None:

        return result, []

    boxes = result.boxes

    detections = []

    # ========================================================
    # PROCESS DETECTIONS
    # ========================================================

    for i in range(len(boxes)):

        try:

            cls = int(
                boxes.cls[i].item()
            )

            confidence = float(
                boxes.conf[i].item()
            )

        except Exception as error:

            print(
                f"[YOLO DEBUG] Box parsing error: {error}",
                file=sys.stderr,
                flush=True
            )

            continue

        # ----------------------------------------------------
        # CLASS NAME
        # ----------------------------------------------------

        try:

            class_name = str(
                model.names[cls]
            )

        except Exception:

            class_name = "unknown"

        # ----------------------------------------------------
        # DEBUG
        # ----------------------------------------------------

        print(
            f"[YOLO DEBUG] "
            f"class={class_name} "
            f"id={cls} "
            f"confidence={confidence:.3f}",
            file=sys.stderr,
            flush=True
        )

        # ----------------------------------------------------
        # ONLY PERSON
        # ----------------------------------------------------

        if not is_person_class(
            model,
            cls
        ):

            continue

        # ----------------------------------------------------
        # BOUNDING BOX
        # ----------------------------------------------------

        try:

            xyxy = (
                boxes.xyxy[i]
                .cpu()
                .numpy()
                .astype(int)
            )

            x1 = int(xyxy[0])
            y1 = int(xyxy[1])
            x2 = int(xyxy[2])
            y2 = int(xyxy[3])

        except Exception as error:

            print(
                f"[YOLO DEBUG] "
                f"Bounding box error: {error}",
                file=sys.stderr,
                flush=True
            )

            continue

        # ----------------------------------------------------
        # TRACK ID
        # ----------------------------------------------------

        track_id = None

        if boxes.id is not None:

            try:

                track_id = int(
                    boxes.id[i].item()
                )

            except Exception:

                track_id = None

        # ----------------------------------------------------
        # PERSON ID
        # ----------------------------------------------------

        if track_id is not None:

            person_id = (
                f"P{track_id:02d}"
            )

        else:

            person_id = (
                f"P{i + 1:02d}"
            )

        # ----------------------------------------------------
        # RISK
        # ----------------------------------------------------

        risk = get_risk(
            confidence
        )

        # ----------------------------------------------------
        # DETECTION
        # ----------------------------------------------------

        detections.append({

            "id": person_id,

            "class": "victim",

            "confidence": round(
                confidence * 100,
                1
            ),

            "risk": risk,

            "bbox": {

                "x": x1,

                "y": y1,

                "width": max(
                    0,
                    x2 - x1
                ),

                "height": max(
                    0,
                    y2 - y1
                )
            }
        })

    return result, detections


# ============================================================
# DRAW OVERLAY
# ============================================================

def draw_overlay(frame, detections):

    if frame is None:

        return frame

    # ========================================================
    # DETECTION BOXES
    # ========================================================

    for detection in detections:

        bbox = detection["bbox"]

        x = bbox["x"]
        y = bbox["y"]

        width = bbox["width"]
        height = bbox["height"]

        confidence = detection["confidence"]

        risk = detection["risk"]

        person_id = detection["id"]

        # ----------------------------------------------------
        # RISK COLOR
        # ----------------------------------------------------

        if risk == "HIGH":

            color = (40, 51, 239)

        elif risk == "MEDIUM":

            color = (0, 165, 255)

        else:

            color = (34, 197, 94)

        # ----------------------------------------------------
        # BOX
        # ----------------------------------------------------

        cv2.rectangle(

            frame,

            (x, y),

            (
                x + width,
                y + height
            ),

            color,

            2
        )

        # ----------------------------------------------------
        # LABEL
        # ----------------------------------------------------

        label = (
            f"{person_id} | "
            f"{confidence:.0f}% | "
            f"{risk}"
        )

        font = cv2.FONT_HERSHEY_SIMPLEX

        font_scale = 0.55

        thickness = 2

        (
            text_size,
            _,
        ) = cv2.getTextSize(

            label,

            font,

            font_scale,

            thickness
        )

        text_width = text_size[0]
        text_height = text_size[1]

        label_y = max(
            y,
            text_height + 8
        )

        # ----------------------------------------------------
        # LABEL BACKGROUND
        # ----------------------------------------------------

        cv2.rectangle(

            frame,

            (
                x,
                label_y - text_height - 8
            ),

            (
                x + text_width + 10,
                label_y
            ),

            color,

            -1
        )

        # ----------------------------------------------------
        # LABEL TEXT
        # ----------------------------------------------------

        cv2.putText(

            frame,

            label,

            (
                x + 5,
                label_y - 5
            ),

            font,

            font_scale,

            (255, 255, 255),

            thickness,

            cv2.LINE_AA
        )

    # ========================================================
    # WATERMARK
    # ========================================================

    cv2.putText(

        frame,

        "HAWKVISION AI | DRONE INTELLIGENCE",

        (20, 35),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.65,

        (255, 255, 255),

        2,

        cv2.LINE_AA
    )

    # ========================================================
    # LIVE INDICATOR
    # ========================================================

    cv2.circle(

        frame,

        (25, 65),

        7,

        (0, 0, 255),

        -1
    )

    cv2.putText(

        frame,

        "LIVE AI DETECTION",

        (40, 71),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.55,

        (255, 255, 255),

        2,

        cv2.LINE_AA
    )

    # ========================================================
    # PERSON COUNT
    # ========================================================

    cv2.putText(

        frame,

        f"PERSONS: {len(detections)}",

        (20, 105),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.6,

        (255, 255, 255),

        2,

        cv2.LINE_AA
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

    cap = cv2.VideoCapture(
        video_path
    )

    if not cap.isOpened():

        raise RuntimeError(
            "Could not open drone video"
        )

    total_frames = 0
    processed_frames = 0

    detected_ids = set()

    max_confidence = 0.0

    confidence_values = []

    # ========================================================
    # VIDEO LOOP
    # ========================================================

    while True:

        success, frame = cap.read()

        if not success:
            break

        total_frames += 1

        # Process every second frame.
        # This keeps offline analysis practical.
        if total_frames % 2 != 0:
            continue

        processed_frames += 1

        try:

            _, detections = detect_frame(

                model,

                frame,

                tracking=True
            )

        except Exception as error:

            print(
                f"[YOLO ERROR] {error}",
                file=sys.stderr,
                flush=True
            )

            continue

        for detection in detections:

            detected_ids.add(
                detection["id"]
            )

            confidence = (
                detection["confidence"]
            )

            confidence_values.append(
                confidence
            )

            max_confidence = max(
                max_confidence,
                confidence
            )

    cap.release()

    # ========================================================
    # SUMMARY
    # ========================================================

    high_priority = 0
    medium_priority = 0
    low_priority = 0

    for confidence in confidence_values:

        risk = get_risk(
            confidence / 100
        )

        if risk == "HIGH":

            high_priority += 1

        elif risk == "MEDIUM":

            medium_priority += 1

        else:

            low_priority += 1

    average_confidence = 0

    if confidence_values:

        average_confidence = (
            sum(confidence_values)
            / len(confidence_values)
        )

    return {

        "success": True,

        "model": "YOLO26m",

        "mode": "recorded",

        "totalFrames": total_frames,

        "processedFrames": processed_frames,

        "victimsDetected": len(
            detected_ids
        ),

        "totalTracks": len(
            detected_ids
        ),

        "highPriority": high_priority,

        "mediumPriority": medium_priority,

        "lowPriority": low_priority,

        "maxConfidence": round(
            max_confidence,
            1
        ),

        "averageConfidence": round(
            average_confidence,
            1
        )
    }


# ============================================================
# LIVE JSON STREAM
# ============================================================

def live_stream(model, source):

    print(
        f"[HAWKVISION] Opening live source: {source}",
        file=sys.stderr,
        flush=True
    )

    cap = cv2.VideoCapture(
        source
    )

    # Try to minimize stream latency.
    try:

        cap.set(
            cv2.CAP_PROP_BUFFERSIZE,
            1
        )

    except Exception:
        pass

    if not cap.isOpened():

        emit({

            "type": "error",

            "error":
                "Unable to connect to drone camera stream",

            "source": source
        })

        return

    # ========================================================
    # CONNECTED
    # ========================================================

    emit({

        "type": "connected",

        "mode": "live",

        "source": "drone_camera"
    })

    frame_number = 0

    # ========================================================
    # LIVE LOOP
    # ========================================================

    while True:

        success, frame = cap.read()

        if not success:

            time.sleep(0.05)

            continue

        frame_number += 1

        try:

            _, detections = detect_frame(

                model,

                frame,

                tracking=True
            )

            high = 0
            medium = 0
            low = 0

            for detection in detections:

                risk = detection["risk"]

                if risk == "HIGH":

                    high += 1

                elif risk == "MEDIUM":

                    medium += 1

                else:

                    low += 1

            # =================================================
            # SEND REAL DETECTIONS
            # =================================================

            emit({

                "type": "detection",

                "mode": "live",

                "frame": frame_number,

                "timestamp": time.time(),

                "victims": detections,

                "counts": {

                    "total": len(
                        detections
                    ),

                    "high": high,

                    "medium": medium,

                    "low": low
                }
            })

        except Exception as error:

            print(
                f"[YOLO ERROR] {error}",
                file=sys.stderr,
                flush=True
            )

            emit({

                "type": "error",

                "error": str(error)
            })

            time.sleep(0.05)

    cap.release()


# ============================================================
# MJPEG STREAM
# ============================================================

def mjpeg_stream(model, source):

    print(
        f"[HAWKVISION] Opening MJPEG source: {source}",
        file=sys.stderr,
        flush=True
    )

    cap = cv2.VideoCapture(
        source
    )

    try:

        cap.set(
            cv2.CAP_PROP_BUFFERSIZE,
            1
        )

    except Exception:
        pass

    if not cap.isOpened():

        print(
            "Unable to connect to drone stream",
            file=sys.stderr,
            flush=True
        )

        return

    # ========================================================
    # FRAME LOOP
    # ========================================================

    while True:

        success, frame = cap.read()

        if not success:

            time.sleep(0.05)

            continue

        try:

            _, detections = detect_frame(

                model,

                frame,

                tracking=True
            )

            # ------------------------------------------------
            # DRAW AI
            # ------------------------------------------------

            frame = draw_overlay(

                frame,

                detections
            )

            # ------------------------------------------------
            # JPEG
            # ------------------------------------------------

            success, encoded = cv2.imencode(

                ".jpg",

                frame,

                [
                    int(
                        cv2.IMWRITE_JPEG_QUALITY
                    ),
                    80
                ]
            )

            if not success:
                continue

            jpg = encoded.tobytes()

            # ------------------------------------------------
            # MJPEG
            # ------------------------------------------------

            sys.stdout.buffer.write(
                b"--frame\r\n"
            )

            sys.stdout.buffer.write(
                b"Content-Type: image/jpeg\r\n"
            )

            sys.stdout.buffer.write(

                f"Content-Length: {len(jpg)}\r\n\r\n"
                .encode()
            )

            sys.stdout.buffer.write(
                jpg
            )

            sys.stdout.buffer.write(
                b"\r\n"
            )

            sys.stdout.buffer.flush()

        except Exception as error:

            print(
                f"[MJPEG YOLO ERROR] {error}",
                file=sys.stderr,
                flush=True
            )

            time.sleep(0.01)

    cap.release()


# ============================================================
# MAIN
# ============================================================

def main():

    # Expected:
    #
    # python droneDetection.py <model> <source> <mode>
    #
    # mode:
    #   analyze
    #   stream
    #   mjpeg

    if len(sys.argv) < 4:

        print(

            "Usage: "
            "python droneDetection.py "
            "<model> <source> <mode>",

            file=sys.stderr
        )

        sys.exit(1)

    model_path = sys.argv[1]

    source = sys.argv[2]

    mode = sys.argv[3]

    try:

        # ====================================================
        # LOAD YOLO26m
        # ====================================================

        model = load_model(
            model_path
        )

        # ====================================================
        # ANALYZE
        # ====================================================

        if mode == "analyze":

            result = analyze_video(

                model,

                source
            )

            print(
                json.dumps(result),
                flush=True
            )

        # ====================================================
        # LIVE JSON
        # ====================================================

        elif mode == "stream":

            live_stream(

                model,

                source
            )

        # ====================================================
        # LIVE MJPEG
        # ====================================================

        elif mode == "mjpeg":

            mjpeg_stream(

                model,

                source
            )

        else:

            raise ValueError(
                f"Unknown mode: {mode}"
            )

    except Exception as error:

        print(
            f"[HAWKVISION ERROR] {error}",
            file=sys.stderr,
            flush=True
        )

        if mode == "analyze":

            print(

                json.dumps({

                    "success": False,

                    "error": str(error)
                }),

                flush=True
            )

        else:

            emit({

                "type": "error",

                "error": str(error)
            })

        sys.exit(1)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()