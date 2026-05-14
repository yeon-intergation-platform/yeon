"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Tool = "brush" | "eraser" | "picker";

type SheetConfig = {
  sourceX: number;
  sourceY: number;
  sourceCellWidth: number;
  sourceCellHeight: number;
  sourceColumns: number;
  frameCount: number;
  outputFrameWidth: number;
  outputFrameHeight: number;
  baselineY: number;
  centerX: number;
  fps: number;
};

const DEFAULT_CONFIG: SheetConfig = {
  sourceX: 0,
  sourceY: 0,
  sourceCellWidth: 64,
  sourceCellHeight: 64,
  sourceColumns: 16,
  frameCount: 16,
  outputFrameWidth: 64,
  outputFrameHeight: 64,
  baselineY: 56,
  centerX: 32,
  fps: 12,
};

const SAMPLE_IMAGE = "/sprite-editor/walk-cycle-draft.png";
const ZOOM = 8;
const CHECKER_SIZE = 8;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function drawCheckerboard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size = CHECKER_SIZE
) {
  ctx.clearRect(0, 0, width, height);
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      ctx.fillStyle = (x / size + y / size) % 2 === 0 ? "#f1f5f9" : "#ffffff";
      ctx.fillRect(x, y, size, size);
    }
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG 변환에 실패했습니다."));
    }, "image/png");
  });
}

function NumericField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-[13px] font-medium text-slate-950 outline-none focus:border-slate-500"
      />
    </label>
  );
}

export function SpriteFrameEditor() {
  const [config, setConfig] = useState<SheetConfig>(DEFAULT_CONFIG);
  const [sourceName, setSourceName] = useState("walk-cycle-draft.png");
  const [sourceSize, setSourceSize] = useState({ width: 0, height: 0 });
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [tool, setTool] = useState<Tool>("brush");
  const [brushColor, setBrushColor] = useState("#2f6f3e");
  const [brushSize, setBrushSize] = useState(1);
  const [showGuides, setShowGuides] = useState(true);
  const [onionSkin, setOnionSkin] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [previewTick, setPreviewTick] = useState(0);
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState("샘플 이미지를 불러오는 중입니다.");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceViewRef = useRef<HTMLCanvasElement | null>(null);
  const editorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const undoStackRef = useRef<ImageData[]>([]);
  const drawingRef = useRef(false);

  const activeFrameCount = clamp(config.frameCount, 1, 64);
  const selectedFrameSafe = clamp(selectedFrame, 0, activeFrameCount - 1);

  const extractedSheetSize = useMemo(
    () => ({
      width: config.outputFrameWidth * activeFrameCount,
      height: config.outputFrameHeight,
    }),
    [activeFrameCount, config.outputFrameHeight, config.outputFrameWidth]
  );

  const setConfigField = useCallback(
    <K extends keyof SheetConfig>(key: K, value: number) => {
      setConfig((prev) => ({
        ...prev,
        [key]: Number.isFinite(value) ? value : prev[key],
      }));
    },
    []
  );

  const ensureFrames = useCallback(() => {
    const next: HTMLCanvasElement[] = [];
    for (let index = 0; index < activeFrameCount; index += 1) {
      const existing = framesRef.current[index];
      if (
        existing &&
        existing.width === config.outputFrameWidth &&
        existing.height === config.outputFrameHeight
      ) {
        next.push(existing);
      } else {
        next.push(
          makeCanvas(config.outputFrameWidth, config.outputFrameHeight)
        );
      }
    }
    framesRef.current = next;
  }, [activeFrameCount, config.outputFrameHeight, config.outputFrameWidth]);

  const redrawSourceView = useCallback(() => {
    const source = sourceCanvasRef.current;
    const view = sourceViewRef.current;
    if (!source || !view) return;
    const maxWidth = 980;
    const scale = Math.min(1, maxWidth / source.width);
    view.width = Math.max(1, Math.round(source.width * scale));
    view.height = Math.max(1, Math.round(source.height * scale));
    const ctx = view.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    drawCheckerboard(ctx, view.width, view.height, 10);
    ctx.drawImage(source, 0, 0, view.width, view.height);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1;
    for (let index = 0; index < activeFrameCount; index += 1) {
      const col = index % Math.max(1, config.sourceColumns);
      const row = Math.floor(index / Math.max(1, config.sourceColumns));
      const x = (config.sourceX + col * config.sourceCellWidth) * scale;
      const y = (config.sourceY + row * config.sourceCellHeight) * scale;
      ctx.strokeRect(
        Math.round(x) + 0.5,
        Math.round(y) + 0.5,
        Math.round(config.sourceCellWidth * scale),
        Math.round(config.sourceCellHeight * scale)
      );
    }
  }, [activeFrameCount, config]);

  const redrawEditor = useCallback(() => {
    ensureFrames();
    const editor = editorCanvasRef.current;
    if (!editor) return;
    editor.width = config.outputFrameWidth * ZOOM;
    editor.height = config.outputFrameHeight * ZOOM;
    const ctx = editor.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    drawCheckerboard(ctx, editor.width, editor.height, ZOOM * 2);

    if (onionSkin) {
      const prevFrame =
        framesRef.current[
          (selectedFrameSafe - 1 + activeFrameCount) % activeFrameCount
        ];
      const nextFrame =
        framesRef.current[(selectedFrameSafe + 1) % activeFrameCount];
      ctx.globalAlpha = 0.22;
      if (prevFrame)
        ctx.drawImage(prevFrame, 0, 0, editor.width, editor.height);
      ctx.globalAlpha = 0.16;
      if (nextFrame)
        ctx.drawImage(nextFrame, 0, 0, editor.width, editor.height);
      ctx.globalAlpha = 1;
    }

    const frame = framesRef.current[selectedFrameSafe];
    if (frame) ctx.drawImage(frame, 0, 0, editor.width, editor.height);

    if (showGuides) {
      ctx.save();
      ctx.strokeStyle = "rgba(14, 165, 233, 0.8)";
      ctx.lineWidth = 1;
      const centerX = Math.round(config.centerX * ZOOM) + 0.5;
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, editor.height);
      ctx.stroke();
      ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
      const baselineY = Math.round(config.baselineY * ZOOM) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, baselineY);
      ctx.lineTo(editor.width, baselineY);
      ctx.stroke();
      ctx.strokeStyle = "rgba(15, 23, 42, 0.18)";
      for (let x = 0; x <= editor.width; x += ZOOM) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, editor.height);
        ctx.stroke();
      }
      for (let y = 0; y <= editor.height; y += ZOOM) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(editor.width, y + 0.5);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [
    activeFrameCount,
    config.baselineY,
    config.centerX,
    config.outputFrameHeight,
    config.outputFrameWidth,
    ensureFrames,
    onionSkin,
    selectedFrameSafe,
    showGuides,
  ]);

  const redrawPreview = useCallback(() => {
    ensureFrames();
    const preview = previewCanvasRef.current;
    if (!preview) return;
    preview.width = config.outputFrameWidth * 4;
    preview.height = config.outputFrameHeight * 4;
    const ctx = preview.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    drawCheckerboard(ctx, preview.width, preview.height, 16);
    const frame = framesRef.current[previewTick % activeFrameCount];
    if (frame) ctx.drawImage(frame, 0, 0, preview.width, preview.height);
    if (showGuides) {
      ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
      ctx.beginPath();
      ctx.moveTo(0, config.baselineY * 4 + 0.5);
      ctx.lineTo(preview.width, config.baselineY * 4 + 0.5);
      ctx.stroke();
    }
  }, [
    activeFrameCount,
    config.baselineY,
    config.outputFrameHeight,
    config.outputFrameWidth,
    ensureFrames,
    previewTick,
    showGuides,
  ]);

  const loadImageUrl = useCallback((url: string, name: string) => {
    return new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => {
        const canvas = makeCanvas(image.naturalWidth, image.naturalHeight);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve();
          return;
        }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, 0, 0);
        sourceCanvasRef.current = canvas;
        setSourceName(name);
        setSourceSize({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
        setMessage(
          "원본을 불러왔습니다. 입력 셀/오프셋을 맞춘 뒤 '프레임 추출'을 누르세요."
        );
        setRevision((value) => value + 1);
        resolve();
      };
      image.onerror = () => {
        setMessage("이미지를 불러오지 못했습니다.");
        resolve();
      };
      image.src = url;
    });
  }, []);

  const extractFrames = useCallback(() => {
    const source = sourceCanvasRef.current;
    if (!source) {
      setMessage("먼저 이미지를 업로드하거나 샘플을 불러오세요.");
      return;
    }
    ensureFrames();
    framesRef.current.forEach((frame, index) => {
      const ctx = frame.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, frame.width, frame.height);
      ctx.imageSmoothingEnabled = false;
      const col = index % Math.max(1, config.sourceColumns);
      const row = Math.floor(index / Math.max(1, config.sourceColumns));
      ctx.drawImage(
        source,
        config.sourceX + col * config.sourceCellWidth,
        config.sourceY + row * config.sourceCellHeight,
        config.sourceCellWidth,
        config.sourceCellHeight,
        0,
        0,
        config.outputFrameWidth,
        config.outputFrameHeight
      );
    });
    undoStackRef.current = [];
    setSelectedFrame(0);
    setMessage(
      `${activeFrameCount}개 프레임을 추출했습니다. 확대 캔버스에서 바로 수정할 수 있습니다.`
    );
    setRevision((value) => value + 1);
  }, [activeFrameCount, config, ensureFrames]);

  const clearSelectedFrame = useCallback(() => {
    ensureFrames();
    const frame = framesRef.current[selectedFrameSafe];
    const ctx = frame?.getContext("2d");
    if (!frame || !ctx) return;
    undoStackRef.current.push(
      ctx.getImageData(0, 0, frame.width, frame.height)
    );
    ctx.clearRect(0, 0, frame.width, frame.height);
    setRevision((value) => value + 1);
  }, [ensureFrames, selectedFrameSafe]);

  const undoSelectedFrame = useCallback(() => {
    ensureFrames();
    const previous = undoStackRef.current.pop();
    const frame = framesRef.current[selectedFrameSafe];
    const ctx = frame?.getContext("2d");
    if (!previous || !ctx) return;
    ctx.putImageData(previous, 0, 0);
    setRevision((value) => value + 1);
  }, [ensureFrames, selectedFrameSafe]);

  const paintAt = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      ensureFrames();
      const editor = editorCanvasRef.current;
      const frame = framesRef.current[selectedFrameSafe];
      const ctx = frame?.getContext("2d", { willReadFrequently: true });
      if (!editor || !frame || !ctx) return;
      const rect = editor.getBoundingClientRect();
      const x = clamp(
        Math.floor(((event.clientX - rect.left) / rect.width) * frame.width),
        0,
        frame.width - 1
      );
      const y = clamp(
        Math.floor(((event.clientY - rect.top) / rect.height) * frame.height),
        0,
        frame.height - 1
      );

      if (tool === "picker") {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = `#${[pixel[0], pixel[1], pixel[2]].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
        setBrushColor(hex);
        setTool("brush");
        return;
      }

      const radius = Math.max(1, brushSize);
      if (tool === "eraser") {
        ctx.clearRect(x, y, radius, radius);
      } else {
        ctx.fillStyle = brushColor;
        ctx.fillRect(x, y, radius, radius);
      }
      setRevision((value) => value + 1);
    },
    [brushColor, brushSize, ensureFrames, selectedFrameSafe, tool]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      ensureFrames();
      const frame = framesRef.current[selectedFrameSafe];
      const ctx = frame?.getContext("2d");
      if (frame && ctx && tool !== "picker") {
        undoStackRef.current.push(
          ctx.getImageData(0, 0, frame.width, frame.height)
        );
        if (undoStackRef.current.length > 30) undoStackRef.current.shift();
      }
      drawingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      paintAt(event);
    },
    [ensureFrames, paintAt, selectedFrameSafe, tool]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current || tool === "picker") return;
      paintAt(event);
    },
    [paintAt, tool]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      drawingRef.current = false;
      event.currentTarget.releasePointerCapture(event.pointerId);
    },
    []
  );

  const exportSheet = useCallback(async () => {
    ensureFrames();
    const sheet = makeCanvas(
      extractedSheetSize.width,
      extractedSheetSize.height
    );
    const ctx = sheet.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    framesRef.current.forEach((frame, index) => {
      ctx.drawImage(frame, index * config.outputFrameWidth, 0);
    });
    const blob = await canvasToBlob(sheet);
    downloadBlob(blob, "beginner_hero_walk_16x64x64.png");
    setMessage("PNG 스프라이트시트를 다운로드했습니다.");
  }, [
    config.outputFrameWidth,
    ensureFrames,
    extractedSheetSize.height,
    extractedSheetSize.width,
  ]);

  const exportMeta = useCallback(() => {
    const meta = {
      id: "beginner_hero_walk",
      source: sourceName,
      frameWidth: config.outputFrameWidth,
      frameHeight: config.outputFrameHeight,
      frameCount: activeFrameCount,
      columns: activeFrameCount,
      fps: config.fps,
      anchor: { x: config.centerX, y: config.baselineY },
      hitbox: { x: 20, y: 14, width: 24, height: 42 },
      animation: {
        key: "walk",
        frames: [...Array(activeFrameCount).keys()],
        loop: true,
      },
    };
    downloadBlob(
      new Blob([JSON.stringify(meta, null, 2)], { type: "application/json" }),
      "beginner_hero_walk.meta.json"
    );
    setMessage("JSON 메타 파일을 다운로드했습니다.");
  }, [
    activeFrameCount,
    config.baselineY,
    config.centerX,
    config.fps,
    config.outputFrameHeight,
    config.outputFrameWidth,
    sourceName,
  ]);

  useEffect(() => {
    void loadImageUrl(SAMPLE_IMAGE, "walk-cycle-draft.png");
  }, [loadImageUrl]);

  useEffect(() => {
    redrawSourceView();
    redrawEditor();
    redrawPreview();
  }, [redrawEditor, redrawPreview, redrawSourceView, revision]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(
      () => {
        setPreviewTick((tick) => (tick + 1) % activeFrameCount);
      },
      Math.max(40, Math.round(1000 / Math.max(1, config.fps)))
    );
    return () => window.clearInterval(id);
  }, [activeFrameCount, config.fps, isPlaying]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      void loadImageUrl(url, file.name).finally(() => URL.revokeObjectURL(url));
    },
    [loadImageUrl]
  );

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-6 text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                Sprite production tool
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
                16프레임 걷기 스프라이트 편집기
              </h1>
              <p className="mt-2 max-w-3xl text-[13px] leading-6 text-slate-300">
                GPT 이미지나 업로드한 PNG를 입력 셀로 잘라 64x64 프레임으로
                추출하고, 발 기준선/몸 중심선을 보면서 직접 픽셀을 수정한 뒤
                Phaser용 PNG/JSON으로 내보냅니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl bg-white px-4 py-2 text-[13px] font-bold text-slate-950 hover:bg-emerald-100"
              >
                PNG 업로드
              </button>
              <button
                type="button"
                onClick={extractFrames}
                className="rounded-xl bg-emerald-400 px-4 py-2 text-[13px] font-black text-emerald-950 hover:bg-emerald-300"
              >
                프레임 추출
              </button>
              <button
                type="button"
                onClick={exportSheet}
                className="rounded-xl border border-white/15 px-4 py-2 text-[13px] font-bold text-white hover:bg-white/10"
              >
                PNG 내보내기
              </button>
              <button
                type="button"
                onClick={exportMeta}
                className="rounded-xl border border-white/15 px-4 py-2 text-[13px] font-bold text-white hover:bg-white/10"
              >
                JSON 내보내기
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/webp,image/jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
        </header>

        <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <aside className="flex flex-col gap-4">
            <div className="rounded-3xl border border-white/10 bg-white p-4 text-slate-950">
              <h2 className="text-[15px] font-black">입력/출력 규격</h2>
              <p className="mt-1 text-[12px] text-slate-500">
                원본이 정확한 시트가 아니어도 오프셋/입력 셀 크기를 조정해 64x64
                결과로 재샘플링합니다.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <NumericField
                  label="원본 X"
                  value={config.sourceX}
                  min={0}
                  onChange={(v) => setConfigField("sourceX", v)}
                />
                <NumericField
                  label="원본 Y"
                  value={config.sourceY}
                  min={0}
                  onChange={(v) => setConfigField("sourceY", v)}
                />
                <NumericField
                  label="입력 셀 W"
                  value={config.sourceCellWidth}
                  min={1}
                  onChange={(v) => setConfigField("sourceCellWidth", v)}
                />
                <NumericField
                  label="입력 셀 H"
                  value={config.sourceCellHeight}
                  min={1}
                  onChange={(v) => setConfigField("sourceCellHeight", v)}
                />
                <NumericField
                  label="원본 열 수"
                  value={config.sourceColumns}
                  min={1}
                  onChange={(v) => setConfigField("sourceColumns", v)}
                />
                <NumericField
                  label="프레임 수"
                  value={config.frameCount}
                  min={1}
                  max={64}
                  onChange={(v) => setConfigField("frameCount", v)}
                />
                <NumericField
                  label="출력 W"
                  value={config.outputFrameWidth}
                  min={8}
                  onChange={(v) => setConfigField("outputFrameWidth", v)}
                />
                <NumericField
                  label="출력 H"
                  value={config.outputFrameHeight}
                  min={8}
                  onChange={(v) => setConfigField("outputFrameHeight", v)}
                />
                <NumericField
                  label="중심 X"
                  value={config.centerX}
                  min={0}
                  onChange={(v) => setConfigField("centerX", v)}
                />
                <NumericField
                  label="발 기준 Y"
                  value={config.baselineY}
                  min={0}
                  onChange={(v) => setConfigField("baselineY", v)}
                />
                <NumericField
                  label="FPS"
                  value={config.fps}
                  min={1}
                  max={30}
                  onChange={(v) => setConfigField("fps", v)}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white p-4 text-slate-950">
              <h2 className="text-[15px] font-black">편집 도구</h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(["brush", "eraser", "picker"] as Tool[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTool(item)}
                    className={`rounded-xl px-3 py-2 text-[12px] font-bold ${tool === item ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    {item === "brush"
                      ? "브러시"
                      : item === "eraser"
                        ? "지우개"
                        : "스포이드"}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-[1fr_96px] gap-3">
                <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500">
                  색상
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white p-1"
                  />
                </label>
                <NumericField
                  label="브러시 px"
                  value={brushSize}
                  min={1}
                  max={8}
                  onChange={setBrushSize}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={undoSelectedFrame}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-[12px] font-bold text-slate-700"
                >
                  실행취소
                </button>
                <button
                  type="button"
                  onClick={clearSelectedFrame}
                  className="rounded-xl bg-rose-50 px-3 py-2 text-[12px] font-bold text-rose-700"
                >
                  선택 프레임 비우기
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-2 text-[12px] font-semibold text-slate-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showGuides}
                    onChange={(e) => setShowGuides(e.target.checked)}
                  />{" "}
                  기준선/그리드 표시
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={onionSkin}
                    onChange={(e) => setOnionSkin(e.target.checked)}
                  />{" "}
                  이전/다음 프레임 양파껍질
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isPlaying}
                    onChange={(e) => setIsPlaying(e.target.checked)}
                  />{" "}
                  애니메이션 재생
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-[12px] leading-6 text-emerald-50">
              <b className="text-emerald-200">현재 원본</b>: {sourceName}
              <br />
              <b className="text-emerald-200">원본 크기</b>: {sourceSize.width}×
              {sourceSize.height}
              <br />
              <b className="text-emerald-200">출력 시트</b>:{" "}
              {extractedSheetSize.width}×{extractedSheetSize.height}
              <br />
              <span className="text-emerald-100">{message}</span>
            </div>
          </aside>

          <div className="flex flex-col gap-5">
            <section className="rounded-3xl border border-white/10 bg-white p-4 text-slate-950">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-black">원본 절단 영역</h2>
                  <p className="text-[12px] text-slate-500">
                    빨간 박스가 추출될 입력 프레임입니다.
                  </p>
                </div>
              </div>
              <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-3">
                <canvas
                  ref={sourceViewRef}
                  className="max-w-full [image-rendering:pixelated]"
                />
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1fr_300px]">
              <div className="rounded-3xl border border-white/10 bg-white p-4 text-slate-950">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[15px] font-black">프레임 직접 편집</h2>
                    <p className="text-[12px] text-slate-500">
                      선택 프레임 {selectedFrameSafe + 1}/{activeFrameCount}.
                      빨간선은 발 기준선, 파란선은 몸 중심선입니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: activeFrameCount }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedFrame(index)}
                        className={`h-8 w-8 rounded-lg text-[11px] font-black ${selectedFrameSafe === index ? "bg-emerald-400 text-emerald-950" : "bg-slate-100 text-slate-500"}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-3">
                  <canvas
                    ref={editorCanvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="cursor-crosshair touch-none [image-rendering:pixelated]"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white p-4 text-slate-950">
                <h2 className="text-[15px] font-black">재생 검수</h2>
                <p className="mt-1 text-[12px] text-slate-500">
                  발이 미끄러지는지, 머리 높이가 튀는지 확인하세요.
                </p>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-100 p-3">
                  <canvas
                    ref={previewCanvasRef}
                    className="w-full [image-rendering:pixelated]"
                  />
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-[12px] leading-6 text-slate-600">
                  <b>검수 기준</b>
                  <br />
                  1. 접지 발은 y={config.baselineY} 선에 붙어야 함<br />
                  2. 몸 중심은 x={config.centerX} 근처 유지
                  <br />
                  3. 16→1 프레임 루프가 튀지 않아야 함<br />
                  4. 내보낸 PNG는 Phaser에서 frameWidth=
                  {config.outputFrameWidth}, frameHeight=
                  {config.outputFrameHeight}로 로드
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
