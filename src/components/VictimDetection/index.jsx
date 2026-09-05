import {
  Upload,
  Image as ImageIcon,
  Users,
  AlertTriangle,
  CheckCircle,
  X,
  ScanLine,
  MapPin,
  Clock3,
  ShieldCheck,
  Maximize2,
} from "lucide-react";
import { useState, useRef } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function VictimDetection() {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [selectedIndex, setSelectedIndex] = useState(null);

  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const viewportRef = useRef(null);

  // ---------------------------------------------
  // IMAGE UPLOAD
  // ---------------------------------------------
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setDetected(false);
    setResult(null);
    setSelectedIndex(null);

    // Basic validation
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    setSelectedFile(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  // ---------------------------------------------
  // IMAGE LOAD
  // ---------------------------------------------
  const handleImageLoad = (event) => {
    setImageDimensions({
      width: event.target.naturalWidth,
      height: event.target.naturalHeight,
    });
  };

  // ---------------------------------------------
  // AI SCAN
  // ---------------------------------------------
  const handleScan = async () => {
    if (!selectedFile) return;

    setScanning(true);
    setDetected(false);
    setResult(null);
    setSelectedIndex(null);
    setError("");

    try {
      const formData = new FormData();

      formData.append("image", selectedFile);

      const response = await fetch(
        `${API_BASE_URL}/api/victims/detect`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Victim detection failed."
        );
      }

      setResult(data.data);
      setDetected(true);
    } catch (err) {
      console.error("Victim detection error:", err);

      setError(
        err.message ||
          "Unable to connect with HawkVision AI backend."
      );
    } finally {
      setScanning(false);
    }
  };

  // ---------------------------------------------
  // REMOVE IMAGE
  // ---------------------------------------------
  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setSelectedFile(null);
    setDetected(false);
    setScanning(false);
    setResult(null);
    setSelectedIndex(null);
    setError("");

    setImageDimensions({
      width: 0,
      height: 0,
    });
  };

  // ---------------------------------------------
  // PERSON SELECTION
  // ---------------------------------------------
  const handleSelectPerson = (index) => {
    setSelectedIndex(index);
  };

  // ---------------------------------------------
  // RESET / SHOW ALL
  // ---------------------------------------------
  const handleResetView = () => {
    setSelectedIndex(null);
  };

  // ---------------------------------------------
  // RISK CALCULATION
  // ---------------------------------------------
  const detections = result?.detections || [];

  const riskSummary = result?.riskSummary;

  const highRisk =
    riskSummary?.highRisk ??
    detections.filter(
      (item) => Number(item.confidence) >= 0.75
    ).length;

  const mediumRisk =
    riskSummary?.mediumRisk ??
    detections.filter(
      (item) =>
        Number(item.confidence) >= 0.5 &&
        Number(item.confidence) < 0.75
    ).length;

  const lowRisk =
    riskSummary?.lowRisk ??
    detections.filter(
      (item) => Number(item.confidence) < 0.5
    ).length;

  const totalVictims =
    result?.totalVictims ?? detections.length;

  const averageConfidence =
    detections.length > 0
      ? Math.round(
          (detections.reduce(
            (sum, item) =>
              sum + Number(item.confidence || 0),
            0
          ) /
            detections.length) *
            100
        )
      : 0;

  // ---------------------------------------------
  // BOUNDING BOX POSITION
  // ---------------------------------------------
  const getBoxStyle = (bbox) => {
    if (
      !bbox ||
      !imageDimensions.width ||
      !imageDimensions.height
    ) {
      return {};
    }

    return {
      left: `${(Number(bbox.x1) / imageDimensions.width) * 100}%`,
      top: `${(Number(bbox.y1) / imageDimensions.height) * 100}%`,
      width: `${
        ((Number(bbox.x2) - Number(bbox.x1)) /
          imageDimensions.width) *
        100
      }%`,
      height: `${
        ((Number(bbox.y2) - Number(bbox.y1)) /
          imageDimensions.height) *
        100
      }%`,
    };
  };

  // ---------------------------------------------
  // RISK COLORS
  // ---------------------------------------------
  const getRiskColor = (confidence) => {
    const value = Number(confidence);

    if (value >= 0.75) {
      return {
        border: "border-[#EF3340]",
        bg: "bg-[#EF3340]",
        text: "text-white",
      };
    }

    if (value >= 0.5) {
      return {
        border: "border-[#F59E0B]",
        bg: "bg-[#F59E0B]",
        text: "text-[#111827]",
      };
    }

    return {
      border: "border-[#22C55E]",
      bg: "bg-[#22C55E]",
      text: "text-[#052E16]",
    };
  };

  // ---------------------------------------------
  // PRIORITY
  // ---------------------------------------------
  const getPriorityLabel = (confidence) => {
    const value = Number(confidence);

    if (value >= 0.75) {
      return {
        label: "HIGH",
        color: "text-[#EF3340]",
        bg: "bg-[#EF3340]/10",
        border: "border-[#EF3340]/20",
      };
    }

    if (value >= 0.5) {
      return {
        label: "MEDIUM",
        color: "text-[#F59E0B]",
        bg: "bg-[#F59E0B]/10",
        border: "border-[#F59E0B]/20",
      };
    }

    return {
      label: "LOW",
      color: "text-[#22C55E]",
      bg: "bg-[#22C55E]/10",
      border: "border-[#22C55E]/20",
    };
  };

  const formatPersonId = (index) =>
    `P${String(index + 1).padStart(2, "0")}`;

  // ---------------------------------------------
  // ZOOM / FOCUS ON SELECTED PERSON
  //
  // IMPORTANT:
  // This calculation does NOT use getBoundingClientRect()
  // of the transformed image.
  //
  // It calculates the original image display size from:
  // - natural image width/height
  // - current viewport width/height
  //
  // Therefore it works for:
  // - Landscape images
  // - Portrait / vertical images
  // - Square images
  // ---------------------------------------------
  const getZoomStyle = () => {
    if (
      selectedIndex === null ||
      !detections[selectedIndex] ||
      !imageDimensions.width ||
      !imageDimensions.height ||
      !viewportRef.current
    ) {
      return {
        transform: "translate3d(0px, 0px, 0px) scale(1)",
        transformOrigin: "0 0",
      };
    }

    const bbox = detections[selectedIndex].bbox;

    if (!bbox) {
      return {
        transform: "translate3d(0px, 0px, 0px) scale(1)",
        transformOrigin: "0 0",
      };
    }

    const viewport = viewportRef.current;

    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;

    if (!viewportWidth || !viewportHeight) {
      return {
        transform: "translate3d(0px, 0px, 0px) scale(1)",
        transformOrigin: "0 0",
      };
    }

    const naturalWidth = Number(imageDimensions.width);
    const naturalHeight = Number(imageDimensions.height);

    // ---------------------------------------------
    // ORIGINAL IMAGE FIT SCALE
    //
    // Same basic behavior as object-contain:
    // image fits inside viewport without distortion.
    // ---------------------------------------------
    const fitScale = Math.min(
      viewportWidth / naturalWidth,
      viewportHeight / naturalHeight
    );

    const baseWidth = naturalWidth * fitScale;
    const baseHeight = naturalHeight * fitScale;

    // ---------------------------------------------
    // IMAGE POSITION BEFORE ZOOM
    //
    // The viewport uses flex items-center justify-center,
    // so the image is centered.
    // ---------------------------------------------
    const baseLeft =
      (viewportWidth - baseWidth) / 2;

    const baseTop =
      (viewportHeight - baseHeight) / 2;

    // ---------------------------------------------
    // SELECTED PERSON CENTER
    // ---------------------------------------------
    const x1 = Number(bbox.x1);
    const y1 = Number(bbox.y1);
    const x2 = Number(bbox.x2);
    const y2 = Number(bbox.y2);

    const personCenterX = (x1 + x2) / 2;
    const personCenterY = (y1 + y2) / 2;

    // Convert natural image coordinates
    // to displayed image coordinates.
    const personX =
      personCenterX * fitScale;

    const personY =
      personCenterY * fitScale;

    // ---------------------------------------------
    // PERSON BOX SIZE
    // ---------------------------------------------
    const personWidth = Math.max(
      x2 - x1,
      1
    );

    const personHeight = Math.max(
      y2 - y1,
      1
    );

    // ---------------------------------------------
    // ZOOM LEVEL
    //
    // Larger persons don't need extreme zoom.
    // Smaller aerial victims get stronger zoom.
    //
    // Minimum: 1.8x
    // Maximum: 4x
    // ---------------------------------------------
    const zoomX =
      (naturalWidth * 0.55) /
      personWidth;

    const zoomY =
      (naturalHeight * 0.55) /
      personHeight;

    let zoom = Math.min(
      zoomX,
      zoomY
    );

    zoom = Math.max(
      zoom,
      1.8
    );

    zoom = Math.min(
      zoom,
      4
    );

    // ---------------------------------------------
    // MAKE SURE ZOOMED IMAGE CAN COVER VIEWPORT
    // ---------------------------------------------
    const minimumCoverZoom = Math.max(
      viewportWidth / baseWidth,
      viewportHeight / baseHeight
    );

    zoom = Math.max(
      zoom,
      minimumCoverZoom
    );

    // Prevent excessive zoom.
    zoom = Math.min(zoom, 4);

    // ---------------------------------------------
    // MOVE SELECTED PERSON TO VIEWPORT CENTER
    //
    // The wrapper is centered initially.
    // transform-origin = 0 0.
    // ---------------------------------------------
    let translateX =
      viewportWidth / 2 -
      baseLeft -
      personX * zoom;

    let translateY =
      viewportHeight / 2 -
      baseTop -
      personY * zoom;

    // ---------------------------------------------
    // ZOOMED IMAGE DIMENSIONS
    // ---------------------------------------------
    const zoomedWidth =
      baseWidth * zoom;

    const zoomedHeight =
      baseHeight * zoom;

    // ---------------------------------------------
    // CLAMP HORIZONTAL POSITION
    //
    // Keep the zoomed image inside the viewport.
    // This prevents the image from completely
    // disappearing into the black background.
    // ---------------------------------------------
    const minTranslateX =
      viewportWidth -
      baseLeft -
      zoomedWidth;

    const maxTranslateX =
      -baseLeft;

    if (zoomedWidth >= viewportWidth) {
      translateX = Math.min(
        Math.max(
          translateX,
          minTranslateX
        ),
        maxTranslateX
      );
    } else {
      translateX =
        (viewportWidth - baseWidth) / 2 -
        baseLeft;
    }

    // ---------------------------------------------
    // CLAMP VERTICAL POSITION
    // ---------------------------------------------
    const minTranslateY =
      viewportHeight -
      baseTop -
      zoomedHeight;

    const maxTranslateY =
      -baseTop;

    if (zoomedHeight >= viewportHeight) {
      translateY = Math.min(
        Math.max(
          translateY,
          minTranslateY
        ),
        maxTranslateY
      );
    } else {
      translateY =
        (viewportHeight - baseHeight) / 2 -
        baseTop;
    }

    return {
      transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${zoom})`,
      transformOrigin: "0 0",
    };
  };

  const selectedDetection =
    selectedIndex !== null
      ? detections[selectedIndex]
      : null;

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#EF3340]">
            AI VICTIM DETECTION
          </p>

          <h1 className="text-3xl font-bold text-[#F1F5F9] mt-2">
            Victim Detection
          </h1>

          <p className="text-sm text-[#8FA4C7] mt-2 max-w-2xl">
            Upload disaster imagery and let HawkVision AI
            identify people requiring immediate rescue
            assistance.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">

          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />

          <span className="text-xs font-medium text-[#86EFAC]">
            AI SYSTEM ONLINE
          </span>

        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/30">

          <AlertTriangle
            size={18}
            className="text-[#EF3340] mt-0.5 shrink-0"
          />

          <div>
            <p className="text-sm font-semibold text-[#FCA5A5]">
              Detection Error
            </p>

            <p className="text-xs text-[#CBD5E1] mt-1">
              {error}
            </p>
          </div>

        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* IMAGE PANEL */}
        <div className="xl:col-span-2 bg-[#111C31] border border-[#1D304D] rounded-2xl p-6">

          {/* PANEL HEADER */}
          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">

                <ImageIcon
                  size={20}
                  className="text-[#3B82F6]"
                />

              </div>

              <div>
                <h2 className="font-semibold text-[#F1F5F9]">
                  Disaster Imagery
                </h2>

                <p className="text-xs text-[#64748B] mt-1">
                  Computer vision analysis
                </p>
              </div>

            </div>

            <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-wide bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/20">
              YOLO AI
            </span>

          </div>

          {/* IMAGE AREA */}
          <div
            ref={viewportRef}
            className="relative h-[420px] rounded-xl border border-dashed border-[#1D304D] bg-[#080F1E] overflow-hidden flex items-center justify-center"
          >

            {preview ? (
              <>

                {/* IMAGE + DETECTION OVERLAY */}
                <div
                  className="relative max-w-full max-h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={getZoomStyle()}
                >

                  <img
                    src={preview}
                    alt="Uploaded disaster"
                    onLoad={handleImageLoad}
                    className="max-w-full max-h-[420px] object-contain block"
                  />

                  {/* REAL YOLO BOXES */}
                  {detected &&
                    !scanning &&
                    detections.map(
                      (detection, index) => {
                        const colors =
                          getRiskColor(
                            detection.confidence
                          );

                        const isSelected =
                          selectedIndex === index;

                        const isDimmed =
                          selectedIndex !== null &&
                          selectedIndex !== index;

                        return (
                          <div
                            key={index}
                            role="button"
                            tabIndex={0}
                            aria-label={`Select ${formatPersonId(index)}`}
                            onClick={() =>
                              handleSelectPerson(
                                index
                              )
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key ===
                                  "Enter" ||
                                event.key === " "
                              ) {
                                event.preventDefault();

                                handleSelectPerson(
                                  index
                                );
                              }
                            }}
                            className={`
                              absolute border-2 ${colors.border} rounded-md
                              cursor-pointer transition-all duration-300
                              ${
                                isSelected
                                  ? "ring-2 ring-white/50 shadow-[0_0_20px_rgba(239,51,64,0.45)] z-20"
                                  : ""
                              }
                              ${
                                isDimmed
                                  ? "opacity-30"
                                  : "opacity-100"
                              }
                            `}
                            style={getBoxStyle(
                              detection.bbox
                            )}
                          >

                            {/* COMPACT MARKER */}
                            <span
                              className={`
                                absolute -top-[18px] -left-[6px]
                                min-w-[28px] h-[18px]
                                flex items-center justify-center
                                px-1.5 ${colors.bg} ${colors.text}
                                text-[10px] font-bold rounded-md
                                border border-white/10
                                shadow-md
                                transition-transform duration-300
                                ${
                                  isSelected
                                    ? "scale-110 z-30"
                                    : ""
                                }
                              `}
                            >
                              {formatPersonId(index)}
                            </span>

                          </div>
                        );
                      }
                    )}

                  {/* SCANNING OVERLAY */}
                  {scanning && (
                    <div className="absolute inset-0 bg-[#080D1A]/40">

                      <div className="absolute left-0 right-0 h-[2px] bg-[#22C55E] shadow-[0_0_15px_#22C55E] animate-[scan_1.8s_linear_infinite]" />

                      <div className="absolute inset-0 flex items-center justify-center">

                        <div className="px-5 py-3 rounded-xl bg-[#080D1A]/90 border border-[#22C55E]/30 backdrop-blur-sm">

                          <div className="flex items-center gap-3">

                            <ScanLine
                              size={20}
                              className="text-[#22C55E] animate-pulse"
                            />

                            <div>

                              <p className="text-sm font-semibold text-white">
                                AI Scanning...
                              </p>

                              <p className="text-[11px] text-[#8FA4C7]">
                                YOLO is detecting human presence
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                </div>

                {/* REAL DETECTION STATUS */}
                {detected && !scanning && (
                  <div className="absolute top-4 left-4 px-3 py-2 rounded-lg bg-[#080D1A]/85 border border-[#EF3340]/30 backdrop-blur-sm">

                    <div className="flex items-center gap-2">

                      <span className="w-2 h-2 rounded-full bg-[#EF3340] animate-pulse" />

                      <span className="text-[11px] font-semibold text-white">
                        {totalVictims}{" "}
                        {totalVictims === 1
                          ? "PERSON"
                          : "PERSONS"}{" "}
                        DETECTED
                      </span>

                    </div>

                  </div>
                )}

                {/* FLOATING INFO CARD */}
                {selectedDetection && (
                  <div className="absolute top-4 right-4 px-4 py-3 rounded-xl bg-[#111C31]/95 border border-[#1D304D] backdrop-blur-sm shadow-xl z-30 min-w-[150px]">

                    <p className="text-[10px] text-[#8FA4C7] uppercase tracking-wider">
                      Person ID
                    </p>

                    <p className="text-lg font-bold text-[#F1F5F9]">
                      {formatPersonId(
                        selectedIndex
                      )}
                    </p>

                    <div className="mt-2 space-y-1">

                      <div className="flex items-center justify-between text-xs">

                        <span className="text-[#8FA4C7]">
                          Confidence
                        </span>

                        <span className="font-semibold text-[#F1F5F9]">
                          {Math.round(
                            Number(
                              selectedDetection.confidence
                            ) * 100
                          )}
                          %
                        </span>

                      </div>

                      <div className="flex items-center justify-between text-xs">

                        <span className="text-[#8FA4C7]">
                          Priority
                        </span>

                        <span
                          className={`font-semibold ${
                            getPriorityLabel(
                              selectedDetection.confidence
                            ).color
                          }`}
                        >
                          {
                            getPriorityLabel(
                              selectedDetection.confidence
                            ).label
                          }
                        </span>

                      </div>

                    </div>

                  </div>
                )}

                {/* RESET VIEW CONTROL */}
                {detected && !scanning && (
                  <button
                    type="button"
                    onClick={handleResetView}
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111C31]/90 border border-[#1D304D] hover:bg-[#16233A] hover:border-[#3B82F6]/40 transition backdrop-blur-sm z-30"
                  >

                    <Maximize2
                      size={14}
                      className="text-[#3B82F6]"
                    />

                    <span className="text-xs font-medium text-[#F1F5F9]">
                      Show All
                    </span>

                  </button>
                )}

                {/* REMOVE BUTTON */}
                {!scanning && (
                  <button
                    type="button"
                    onClick={removeImage}
                    aria-label="Remove image"
                    className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-[#080D1A]/80 border border-[#1D304D] flex items-center justify-center hover:bg-[#EF3340]/20 hover:border-[#EF3340]/40 transition"
                  >

                    <X
                      size={17}
                      className="text-[#CBD5E1]"
                    />

                  </button>
                )}

              </>
            ) : (

              <label className="cursor-pointer flex flex-col items-center justify-center text-center">

                <div className="w-16 h-16 rounded-2xl bg-[#1D304D]/50 border border-[#1D304D] flex items-center justify-center mb-4">

                  <Upload
                    size={28}
                    className="text-[#8FA4C7]"
                  />

                </div>

                <p className="text-sm font-medium text-[#F1F5F9]">
                  Upload disaster image
                </p>

                <p className="text-xs text-[#64748B] mt-2">
                  JPG, PNG up to 10MB
                </p>

                <p className="text-[10px] text-[#475569] mt-4">
                  Supported for aerial, drone & ground imagery
                </p>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />

              </label>
            )}

          </div>

          {/* CONTROLS */}
          <div className="flex gap-3 mt-5">

            <label className="flex-1 cursor-pointer">

              <div className="w-full h-11 rounded-xl border border-[#1D304D] hover:bg-[#16233A] flex items-center justify-center gap-2 text-sm font-medium transition text-[#F1F5F9]">

                <Upload size={17} />

                Choose Image

              </div>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

            </label>

            <button
              type="button"
              onClick={handleScan}
              disabled={!selectedFile || scanning}
              className="flex-1 h-11 rounded-xl bg-[#EF3340] hover:bg-[#D92D3A] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition flex items-center justify-center gap-2"
            >

              <ScanLine size={17} />

              {scanning
                ? "Analyzing..."
                : "Analyze Image"}

            </button>

          </div>

        </div>

        {/* RESULTS PANEL */}
        <div className="bg-[#111C31] border border-[#1D304D] rounded-2xl p-6 flex flex-col">

          {/* HEADER */}
          <div className="flex items-center gap-3 mb-6">

            <div className="w-10 h-10 rounded-xl bg-[#EF3340]/10 flex items-center justify-center">

              <Users
                size={20}
                className="text-[#EF3340]"
              />

            </div>

            <div>

              <h2 className="font-semibold text-[#F1F5F9]">
                Detection Results
              </h2>

              <p className="text-xs text-[#64748B] mt-1">
                Live AI analysis output
              </p>

            </div>

          </div>

          {!detected ? (

            <div className="h-[300px] flex flex-col items-center justify-center text-center">

              <div className="w-16 h-16 rounded-2xl bg-[#080F1E] flex items-center justify-center mb-4">

                <Users
                  size={32}
                  className="text-[#1D304D]"
                />

              </div>

              <p className="text-sm text-[#8FA4C7]">
                No analysis available
              </p>

              <p className="text-xs text-[#64748B] mt-2 max-w-[220px] leading-relaxed">
                Upload an image and run AI analysis
                to view detected persons.
              </p>

            </div>

          ) : (

            <div className="space-y-4 flex-1 min-h-0 flex flex-col">

              {/* TOTAL PERSONS */}
              <div className="p-5 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/20">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs text-[#8FA4C7]">
                      TOTAL PERSONS
                    </p>

                    <p className="text-4xl font-bold text-[#EF3340] mt-1">
                      {totalVictims}
                    </p>

                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[#EF3340]/10 flex items-center justify-center">

                    <Users
                      size={25}
                      className="text-[#EF3340]"
                    />

                  </div>

                </div>

              </div>

              {/* HIGH RISK */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/20">

                <div className="w-9 h-9 rounded-lg bg-[#EF3340]/10 flex items-center justify-center">

                  <AlertTriangle
                    size={18}
                    className="text-[#EF3340]"
                  />

                </div>

                <div>

                  <p className="text-sm font-medium text-[#F8FAFC]">
                    {highRisk} high priority
                  </p>

                  <p className="text-xs text-[#64748B] mt-1">
                    Confidence ≥ 75%
                  </p>

                </div>

              </div>

              {/* MEDIUM / LOW */}
              <div className="grid grid-cols-2 gap-3">

                <div className="p-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20">

                  <p className="text-[10px] text-[#FBBF24]">
                    MEDIUM
                  </p>

                  <p className="text-2xl font-bold text-[#F59E0B] mt-1">
                    {mediumRisk}
                  </p>

                </div>

                <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">

                  <p className="text-[10px] text-[#86EFAC]">
                    LOW
                  </p>

                  <p className="text-2xl font-bold text-[#22C55E] mt-1">
                    {lowRisk}
                  </p>

                </div>

              </div>

              {/* CONFIDENCE */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">

                <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">

                  <ShieldCheck
                    size={18}
                    className="text-[#22C55E]"
                  />

                </div>

                <div>

                  <p className="text-sm font-medium text-[#F8FAFC]">
                    {averageConfidence}% confidence
                  </p>

                  <p className="text-xs text-[#64748B] mt-1">
                    Average AI detection confidence
                  </p>

                </div>

              </div>

              {/* DETECTED PERSONS LIST */}
              <div className="flex-1 min-h-0 flex flex-col">

                <p className="text-xs text-[#8FA4C7] uppercase tracking-wider mb-2">
                  Detected Persons
                </p>

                <div className="flex-1 overflow-y-auto pr-1 -mr-1 max-h-[260px]">

                  <div className="space-y-2">

                    {detections.map(
                      (detection, index) => {
                        const priority =
                          getPriorityLabel(
                            detection.confidence
                          );

                        const isSelected =
                          selectedIndex === index;

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              handleSelectPerson(
                                index
                              )
                            }
                            className={`
                              w-full flex items-center justify-between
                              px-3 py-2.5 rounded-xl border text-left
                              transition-all duration-200
                              ${
                                isSelected
                                  ? "bg-[#3B82F6]/15 border-[#3B82F6]/50"
                                  : "bg-[#080F1E] border-[#1D304D] hover:bg-[#16233A] hover:border-[#3B82F6]/30"
                              }
                            `}
                          >

                            <div className="flex items-center gap-3">

                              <span
                                className={`
                                  w-9 h-6 rounded-md flex items-center justify-center
                                  text-[10px] font-bold
                                  ${priority.bg}
                                  ${priority.color}
                                  ${priority.border}
                                `}
                              >
                                {formatPersonId(index)}
                              </span>

                              <span className="text-sm font-medium text-[#F1F5F9]">
                                {Math.round(
                                  Number(
                                    detection.confidence
                                  ) * 100
                                )}
                                %
                              </span>

                            </div>

                            <span
                              className={`
                                text-[10px] font-bold
                                px-2 py-1 rounded-md border
                                ${priority.bg}
                                ${priority.color}
                                ${priority.border}
                              `}
                            >
                              {priority.label}
                            </span>

                          </button>
                        );
                      }
                    )}

                  </div>

                </div>

              </div>

              {/* LOCATION */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#080F1E] border border-[#1D304D]">

                <MapPin
                  size={17}
                  className="text-[#3B82F6]"
                />

                <div>

                  <p className="text-[11px] text-[#64748B]">
                    DETECTION ZONE
                  </p>

                  <p className="text-xs text-[#CBD5E1] mt-1">
                    AI image analysis zone
                  </p>

                </div>

              </div>

              {/* STATUS */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#080F1E] border border-[#1D304D]">

                <Clock3
                  size={17}
                  className="text-[#8FA4C7]"
                />

                <div>

                  <p className="text-[11px] text-[#64748B]">
                    ANALYSIS STATUS
                  </p>

                  <p className="text-xs text-[#CBD5E1] mt-1">
                    AI detection completed
                  </p>

                </div>

                <CheckCircle
                  size={16}
                  className="ml-auto text-[#22C55E]"
                />

              </div>

            </div>

          )}

        </div>

      </div>

      {/* BOTTOM STATUS */}
      {detected && (
        <div className="bg-[#111C31] border border-[#1D304D] rounded-2xl p-4">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">

                <CheckCircle
                  size={18}
                  className="text-[#22C55E]"
                />

              </div>

              <div>

                <p className="text-sm font-medium text-[#F1F5F9]">
                  AI analysis completed successfully
                </p>

                <p className="text-xs text-[#64748B] mt-1">
                  Real YOLO detections are ready for
                  rescue coordination.
                </p>

              </div>

            </div>

            <span className="text-xs text-[#22C55E] font-medium">
              READY FOR RESPONSE
            </span>

          </div>

        </div>
      )}

      {/* SCAN ANIMATION */}
      <style>
        {`
          @keyframes scan {
            0% {
              top: 0%;
            }

            50% {
              top: 100%;
            }

            100% {
              top: 0%;
            }
          }
        `}
      </style>

    </div>
  );
}

export default VictimDetection;