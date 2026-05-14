"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type FrameStatus = "unchecked" | "pass" | "needs-fix";
type FrameFilter = "all" | FrameStatus;

type FrameItem = {
  id: string;
  name: string;
  url: string;
  status: FrameStatus;
  note: string;
  revisionPrompt: string;
};

type GuideConfig = {
  fps: number;
  frameWidth: number;
  frameHeight: number;
  centerX: number;
  baselineY: number;
  boundingBoxX: number;
  boundingBoxY: number;
  boundingBoxWidth: number;
  boundingBoxHeight: number;
};

const SAMPLE_SHEET = "/sprite-editor/walk-cycle-draft.png";
const CHECKER_SIZE = 16;
const DEFAULT_GUIDE: GuideConfig = {
  fps: 12,
  frameWidth: 64,
  frameHeight: 64,
  centerX: 32,
  baselineY: 56,
  boundingBoxX: 18,
  boundingBoxY: 8,
  boundingBoxWidth: 28,
  boundingBoxHeight: 48,
};

const STATUS_LABEL: Record<FrameStatus, string> = {
  unchecked: "미검수",
  pass: "통과",
  "needs-fix": "수정 필요",
};

const STATUS_CLASS: Record<FrameStatus, string> = {
  unchecked: "border-slate-200 bg-slate-50 text-slate-500",
  pass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "needs-fix": "border-rose-200 bg-rose-50 text-rose-700",
};

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
      ctx.fillStyle = (x / size + y / size) % 2 === 0 ? "#e2e8f0" : "#f8fafc";
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
    <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-[13px] font-semibold text-slate-950 outline-none focus:border-slate-500"
      />
    </label>
  );
}

function frameId() {
  return `frame-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function statusSummary(frames: FrameItem[]) {
  return frames.reduce(
    (acc, frame) => {
      acc[frame.status] += 1;
      return acc;
    },
    { unchecked: 0, pass: 0, "needs-fix": 0 } satisfies Record<
      FrameStatus,
      number
    >
  );
}

async function imageUrlToCanvas(url: string, width: number, height: number) {
  const image = new Image();
  image.src = url;
  await image.decode();
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;
  const scale = Math.min(
    width / image.naturalWidth,
    height / image.naturalHeight
  );
  const drawWidth = Math.round(image.naturalWidth * scale);
  const drawHeight = Math.round(image.naturalHeight * scale);
  const x = Math.round((width - drawWidth) / 2);
  const y = Math.round((height - drawHeight) / 2);
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
  return canvas;
}

async function loadSampleSheetFrames(config: GuideConfig) {
  const image = new Image();
  image.src = SAMPLE_SHEET;
  await image.decode();

  const columns = 4;
  const sourceWidth = Math.floor(image.naturalWidth / 4);
  const sourceHeight = Math.floor(image.naturalHeight / 4);
  const frames: FrameItem[] = [];

  for (let index = 0; index < 16; index += 1) {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const canvas = makeCanvas(config.frameWidth, config.frameHeight);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        image,
        col * sourceWidth,
        row * sourceHeight,
        sourceWidth,
        sourceHeight,
        0,
        0,
        config.frameWidth,
        config.frameHeight
      );
    }
    frames.push({
      id: frameId(),
      name: `sample-${String(index + 1).padStart(2, "0")}.png`,
      url: canvas.toDataURL("image/png"),
      status: "unchecked",
      note: "",
      revisionPrompt: "",
    });
  }

  return frames;
}

function buildAiPrompt({
  frames,
  currentFrame,
  currentIndex,
  config,
}: {
  frames: FrameItem[];
  currentFrame: FrameItem | null;
  currentIndex: number;
  config: GuideConfig;
}) {
  if (!currentFrame) {
    return "";
  }

  const previousName = frames[currentIndex - 1]?.name ?? "없음";
  const nextName = frames[currentIndex + 1]?.name ?? "없음";
  const issueNote =
    currentFrame.note.trim() || "검수자가 표시한 문제를 기준으로 수정";

  return `이 이미지는 2D 횡스크롤 웹 RPG용 AI 생성 스프라이트 애니메이션의 ${currentIndex + 1}번 프레임이다.

목표:
- 이 프레임만 다시 생성/수정한다.
- 캐릭터 디자인, 색감, 장비, 방향, 실루엣은 나머지 프레임과 일관되게 유지한다.
- 이전 프레임(${previousName})과 다음 프레임(${nextName}) 사이에서 자연스럽게 이어져야 한다.

기술 기준:
- 투명 배경 PNG
- 출력 프레임 크기: ${config.frameWidth}x${config.frameHeight}px
- 캐릭터는 오른쪽을 바라본다.
- 몸 중심선은 x=${config.centerX} 근처를 유지한다.
- 바닥/발 기준선은 y=${config.baselineY}에 맞춘다.
- 캐릭터 바운딩 박스는 대략 x=${config.boundingBoxX}, y=${config.boundingBoxY}, w=${config.boundingBoxWidth}, h=${config.boundingBoxHeight} 안에 들어와야 한다.
- 프레임 전체 크기, 캐릭터 키, 머리 크기, 무기/의상 디테일이 다른 프레임과 흔들리면 안 된다.

수정해야 할 문제:
${issueNote}

검수 포인트:
- 프레임 간 캐릭터 크기 흔들림 제거
- 기준 위치 흔들림 제거
- 포즈 연결 부자연스러움 수정
- 스타일/색감 불일치 수정
- 장비/의상 디테일 누락 복구
- 애니메이션 재생 시 튀는 느낌 제거

원본을 그대로 복사하지 말고, 같은 캐릭터의 같은 동작 시퀀스 안에서 이 프레임만 자연스럽게 보정해라.`;
}

export function SpriteFrameEditor() {
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FrameFilter>("all");
  const [config, setConfig] = useState<GuideConfig>(DEFAULT_GUIDE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [showOnionSkin, setShowOnionSkin] = useState(true);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [message, setMessage] = useState(
    "AI가 만든 프레임 이미지를 여러 장 업로드하세요."
  );
  const [copied, setCopied] = useState(false);

  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const initialSampleLoadedRef = useRef(false);

  const selectedIndex = Math.max(
    0,
    frames.findIndex((frame) => frame.id === selectedFrameId)
  );
  const selectedFrame = frames[selectedIndex] ?? null;
  const visibleFrames = useMemo(
    () => frames.filter((frame) => filter === "all" || frame.status === filter),
    [filter, frames]
  );
  const summary = useMemo(() => statusSummary(frames), [frames]);
  const aiPrompt = useMemo(
    () =>
      buildAiPrompt({
        frames,
        currentFrame: selectedFrame,
        currentIndex: selectedIndex,
        config,
      }),
    [config, frames, selectedFrame, selectedIndex]
  );

  const selectIndex = useCallback(
    (index: number) => {
      if (frames.length === 0) return;
      const nextIndex = clamp(index, 0, frames.length - 1);
      setSelectedFrameId(frames[nextIndex]?.id ?? null);
    },
    [frames]
  );

  const updateSelectedFrame = useCallback(
    (patch: Partial<FrameItem>) => {
      if (!selectedFrame) return;
      setFrames((prev) =>
        prev.map((frame) =>
          frame.id === selectedFrame.id ? { ...frame, ...patch } : frame
        )
      );
    },
    [selectedFrame]
  );

  const setConfigField = useCallback(
    <K extends keyof GuideConfig>(key: K, value: number) => {
      setConfig((prev) => ({
        ...prev,
        [key]: Number.isFinite(value) ? value : prev[key],
      }));
    },
    []
  );

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const next = Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        )
        .map((file) => ({
          id: frameId(),
          name: file.name,
          url: URL.createObjectURL(file),
          status: "unchecked" as FrameStatus,
          note: "",
          revisionPrompt: "",
        }));

      setFrames((prev) => {
        const merged = [...prev, ...next];
        if (!selectedFrameId && merged[0]) setSelectedFrameId(merged[0].id);
        return merged;
      });
      setMessage(
        `${next.length}개 프레임을 추가했습니다. 순서와 재생 튐을 확인하세요.`
      );
    },
    [selectedFrameId]
  );

  const handleReplace = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file || !selectedFrame) return;
      const url = URL.createObjectURL(file);
      updateSelectedFrame({
        name: file.name,
        url,
        status: "unchecked",
        revisionPrompt: "",
      });
      setMessage(
        `${selectedIndex + 1}번 프레임을 교체했습니다. 다시 재생 검수하세요.`
      );
    },
    [selectedFrame, selectedIndex, updateSelectedFrame]
  );

  const moveSelected = useCallback(
    (direction: -1 | 1) => {
      if (!selectedFrame) return;
      setFrames((prev) => {
        const index = prev.findIndex((frame) => frame.id === selectedFrame.id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= prev.length) return prev;
        const next = [...prev];
        const [moved] = next.splice(index, 1);
        next.splice(target, 0, moved!);
        return next;
      });
    },
    [selectedFrame]
  );

  const removeSelected = useCallback(() => {
    if (!selectedFrame) return;
    setFrames((prev) => {
      const index = prev.findIndex((frame) => frame.id === selectedFrame.id);
      const next = prev.filter((frame) => frame.id !== selectedFrame.id);
      setSelectedFrameId(next[Math.min(index, next.length - 1)]?.id ?? null);
      return next;
    });
  }, [selectedFrame]);

  const drawPreview = useCallback(async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !selectedFrame) return;
    const scale = 6;
    canvas.width = config.frameWidth * scale;
    canvas.height = config.frameHeight * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    drawCheckerboard(ctx, canvas.width, canvas.height, 24);

    if (showOnionSkin && frames.length > 1) {
      const prev = frames[(selectedIndex - 1 + frames.length) % frames.length];
      const next = frames[(selectedIndex + 1) % frames.length];
      ctx.globalAlpha = 0.22;
      if (prev) {
        const prevImage = await imageUrlToCanvas(
          prev.url,
          config.frameWidth,
          config.frameHeight
        );
        ctx.drawImage(prevImage, 0, 0, canvas.width, canvas.height);
      }
      ctx.globalAlpha = 0.16;
      if (next) {
        const nextImage = await imageUrlToCanvas(
          next.url,
          config.frameWidth,
          config.frameHeight
        );
        ctx.drawImage(nextImage, 0, 0, canvas.width, canvas.height);
      }
      ctx.globalAlpha = 1;
    }

    const current = await imageUrlToCanvas(
      selectedFrame.url,
      config.frameWidth,
      config.frameHeight
    );
    ctx.drawImage(current, 0, 0, canvas.width, canvas.height);

    if (showGuides) {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(14, 165, 233, 0.95)";
      ctx.beginPath();
      ctx.moveTo(config.centerX * scale + 0.5, 0);
      ctx.lineTo(config.centerX * scale + 0.5, canvas.height);
      ctx.stroke();
      ctx.strokeStyle = "rgba(239, 68, 68, 0.95)";
      ctx.beginPath();
      ctx.moveTo(0, config.baselineY * scale + 0.5);
      ctx.lineTo(canvas.width, config.baselineY * scale + 0.5);
      ctx.stroke();
      if (showBoundingBox) {
        ctx.strokeStyle = "rgba(250, 204, 21, 0.95)";
        ctx.strokeRect(
          config.boundingBoxX * scale + 0.5,
          config.boundingBoxY * scale + 0.5,
          config.boundingBoxWidth * scale,
          config.boundingBoxHeight * scale
        );
      }
      ctx.restore();
    }
  }, [
    config,
    frames,
    selectedFrame,
    selectedIndex,
    showBoundingBox,
    showGuides,
    showOnionSkin,
  ]);

  const exportSheet = useCallback(async () => {
    if (frames.length === 0) return;
    const sheet = makeCanvas(
      config.frameWidth * frames.length,
      config.frameHeight
    );
    const ctx = sheet.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    for (let index = 0; index < frames.length; index += 1) {
      const frame = frames[index]!;
      const canvas = await imageUrlToCanvas(
        frame.url,
        config.frameWidth,
        config.frameHeight
      );
      ctx.drawImage(canvas, index * config.frameWidth, 0);
    }
    downloadBlob(
      await canvasToBlob(sheet),
      "ai_sprite_frames_approved_sheet.png"
    );
  }, [config.frameHeight, config.frameWidth, frames]);

  const exportManifest = useCallback(() => {
    const manifest = {
      type: "ai-sprite-qa-manifest",
      frameWidth: config.frameWidth,
      frameHeight: config.frameHeight,
      fps: config.fps,
      centerX: config.centerX,
      baselineY: config.baselineY,
      boundingBox: {
        x: config.boundingBoxX,
        y: config.boundingBoxY,
        width: config.boundingBoxWidth,
        height: config.boundingBoxHeight,
      },
      frames: frames.map((frame, index) => ({
        index: index + 1,
        name: frame.name,
        status: frame.status,
        note: frame.note,
        revisionPrompt: frame.revisionPrompt,
      })),
    };
    downloadBlob(
      new Blob([JSON.stringify(manifest, null, 2)], {
        type: "application/json",
      }),
      "ai_sprite_frames_qa_manifest.json"
    );
  }, [config, frames]);

  const copyPrompt = useCallback(async () => {
    const prompt = selectedFrame?.revisionPrompt || aiPrompt;
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }, [aiPrompt, selectedFrame?.revisionPrompt]);

  const loadSample = useCallback(async () => {
    const sampleFrames = await loadSampleSheetFrames(config);
    setFrames(sampleFrames);
    setSelectedFrameId(sampleFrames[0]?.id ?? null);
    setMessage(
      "샘플 시트를 16개 QA 프레임으로 분해했습니다. 실제 작업에서는 AI가 만든 프레임 이미지들을 여러 장 업로드하세요."
    );
  }, [config]);

  useEffect(() => {
    if (initialSampleLoadedRef.current) return;
    initialSampleLoadedRef.current = true;
    void loadSample();
  }, [loadSample]);

  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;
    const id = window.setInterval(
      () => {
        setSelectedFrameId((currentId) => {
          const currentIndex = Math.max(
            0,
            frames.findIndex((frame) => frame.id === currentId)
          );
          return frames[(currentIndex + 1) % frames.length]?.id ?? null;
        });
      },
      Math.max(40, Math.round(1000 / Math.max(1, config.fps)))
    );
    return () => window.clearInterval(id);
  }, [config.fps, frames, isPlaying]);

  useEffect(() => {
    void drawPreview();
  }, [drawPreview]);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-5 text-slate-50">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
        <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.24em] text-cyan-300">
                AI sprite QA pipeline
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
                AI 생성 스프라이트 재생 검수·수정 요청 도구
              </h1>
              <p className="mt-2 max-w-4xl text-[13px] leading-6 text-slate-300">
                사람이 픽셀을 찍는 그림판이 아니라, AI가 만든 프레임들을
                순서대로 재생하고 흔들리는 프레임을 표시한 뒤 Codex/image-gen에
                다시 줄 수정 프롬프트를 만드는 내부 QA 도구입니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="rounded-xl bg-white px-4 py-2 text-[13px] font-black text-slate-950 hover:bg-cyan-100"
              >
                프레임 다중 업로드
              </button>
              <button
                type="button"
                onClick={loadSample}
                className="rounded-xl border border-white/15 px-4 py-2 text-[13px] font-bold text-white hover:bg-white/10"
              >
                샘플 다시 불러오기
              </button>
              <button
                type="button"
                onClick={exportSheet}
                className="rounded-xl border border-white/15 px-4 py-2 text-[13px] font-bold text-white hover:bg-white/10"
              >
                스프라이트시트 export
              </button>
              <button
                type="button"
                onClick={exportManifest}
                className="rounded-xl border border-white/15 px-4 py-2 text-[13px] font-bold text-white hover:bg-white/10"
              >
                QA JSON export
              </button>
            </div>
          </div>
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => void handleUpload(event.target.files)}
          />
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void handleReplace(event.target.files)}
          />
        </header>

        <section className="grid min-h-[720px] gap-4 xl:grid-cols-[280px_1fr_360px]">
          <aside className="flex min-h-0 flex-col rounded-3xl border border-white/10 bg-white p-4 text-slate-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-black">프레임 목록</h2>
                <p className="mt-1 text-[12px] text-slate-500">
                  문제 프레임을 빠르게 찾고 순서를 조정합니다.
                </p>
              </div>
              <span className="rounded-full bg-slate-950 px-2 py-1 text-[11px] font-black text-white">
                {frames.length}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
              <div className="rounded-xl bg-slate-50 p-2 text-slate-500">
                미검수 {summary.unchecked}
              </div>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                통과 {summary.pass}
              </div>
              <div className="rounded-xl bg-rose-50 p-2 text-rose-700">
                수정 {summary["needs-fix"]}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["all", "unchecked", "pass", "needs-fix"] as FrameFilter[]).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`rounded-xl px-3 py-2 text-[12px] font-bold ${filter === item ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500"}`}
                  >
                    {item === "all" ? "전체" : STATUS_LABEL[item]}
                  </button>
                )
              )}
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-auto pr-1">
              <div className="flex flex-col gap-2">
                {visibleFrames.map((frame) => {
                  const index = frames.findIndex(
                    (item) => item.id === frame.id
                  );
                  const selected = frame.id === selectedFrame?.id;
                  return (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => setSelectedFrameId(frame.id)}
                      className={`flex items-center gap-3 rounded-2xl border p-2 text-left transition ${selected ? "border-cyan-400 bg-cyan-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <img
                          src={frame.url}
                          alt=""
                          className="max-h-12 max-w-12 [image-rendering:pixelated]"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-black">
                            #{index + 1}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_CLASS[frame.status]}`}
                          >
                            {STATUS_LABEL[frame.status]}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[11px] text-slate-500">
                          {frame.name}
                        </p>
                        {frame.note && (
                          <p className="mt-1 truncate text-[11px] text-rose-600">
                            {frame.note}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col gap-4">
            <div className="flex flex-1 flex-col rounded-3xl border border-white/10 bg-white p-4 text-slate-950">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-black">재생 검수 프리뷰</h2>
                  <p className="mt-1 text-[12px] text-slate-500">
                    기준선/중심선/onion skin으로 프레임 간 흔들림을 확인합니다.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[12px] font-bold text-slate-600">
                  <label className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={showGuides}
                      onChange={(event) => setShowGuides(event.target.checked)}
                    />{" "}
                    기준선
                  </label>
                  <label className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={showOnionSkin}
                      onChange={(event) =>
                        setShowOnionSkin(event.target.checked)
                      }
                    />{" "}
                    onion
                  </label>
                  <label className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={showBoundingBox}
                      onChange={(event) =>
                        setShowBoundingBox(event.target.checked)
                      }
                    />{" "}
                    bbox
                  </label>
                </div>
              </div>

              <div className="flex flex-1 items-center justify-center overflow-auto rounded-3xl border border-slate-200 bg-slate-100 p-4">
                {selectedFrame ? (
                  <canvas
                    ref={previewCanvasRef}
                    className="max-h-full max-w-full rounded-2xl [image-rendering:pixelated]"
                  />
                ) : (
                  <p className="text-[13px] text-slate-500">
                    프레임을 업로드하세요.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white p-4 text-slate-950">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((value) => !value)}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-[13px] font-black text-white"
                >
                  {isPlaying ? "정지" : "재생"}
                </button>
                <button
                  type="button"
                  onClick={() => selectIndex(selectedIndex - 1)}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-[13px] font-bold text-slate-700"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => selectIndex(selectedIndex + 1)}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-[13px] font-bold text-slate-700"
                >
                  다음
                </button>
                <div className="ml-0 flex items-center gap-2 md:ml-4">
                  <span className="text-[12px] font-bold text-slate-500">
                    FPS
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={config.fps}
                    onChange={(event) =>
                      setConfigField("fps", Number(event.target.value))
                    }
                  />
                  <span className="w-8 text-[12px] font-black text-slate-950">
                    {config.fps}
                  </span>
                </div>
                <span className="ml-auto text-[12px] font-semibold text-slate-500">
                  현재 {selectedFrame ? selectedIndex + 1 : 0}/{frames.length}
                </span>
              </div>
              <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
                {frames.map((frame, index) => (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => setSelectedFrameId(frame.id)}
                    className={`h-3 min-w-8 rounded-full ${index === selectedIndex ? "bg-cyan-500" : frame.status === "pass" ? "bg-emerald-400" : frame.status === "needs-fix" ? "bg-rose-400" : "bg-slate-300"}`}
                    title={`${index + 1}: ${STATUS_LABEL[frame.status]}`}
                  />
                ))}
              </div>
            </div>
          </section>

          <aside className="flex min-h-0 flex-col gap-4 rounded-3xl border border-white/10 bg-white p-4 text-slate-950">
            <div>
              <h2 className="text-[15px] font-black">현재 프레임 QA</h2>
              <p className="mt-1 text-[12px] text-slate-500">
                문제를 기록하고 AI 수정 요청 프롬프트를 만듭니다.
              </p>
            </div>

            {selectedFrame ? (
              <>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[12px] font-black text-slate-950">
                    #{selectedIndex + 1} {selectedFrame.name}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {(["unchecked", "pass", "needs-fix"] as FrameStatus[]).map(
                      (status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateSelectedFrame({ status })}
                          className={`rounded-xl border px-2 py-2 text-[11px] font-black ${selectedFrame.status === status ? STATUS_CLASS[status] : "border-slate-200 bg-white text-slate-500"}`}
                        >
                          {STATUS_LABEL[status]}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <label className="flex flex-col gap-2 text-[12px] font-bold text-slate-600">
                  검수 메모
                  <textarea
                    value={selectedFrame.note}
                    onChange={(event) =>
                      updateSelectedFrame({ note: event.target.value })
                    }
                    placeholder="예: 7번 프레임에서 오른발이 기준선 위로 뜸, 머리 크기가 1~6번보다 큼, 초록 스카프 누락"
                    className="min-h-28 resize-none rounded-2xl border border-slate-200 bg-white p-3 text-[13px] font-medium leading-6 text-slate-950 outline-none focus:border-slate-500"
                  />
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => moveSelected(-1)}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-[12px] font-bold text-slate-700"
                  >
                    앞으로
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSelected(1)}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-[12px] font-bold text-slate-700"
                  >
                    뒤로
                  </button>
                  <button
                    type="button"
                    onClick={removeSelected}
                    className="rounded-xl bg-rose-50 px-3 py-2 text-[12px] font-bold text-rose-700"
                  >
                    삭제
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => replaceInputRef.current?.click()}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-[13px] font-black text-cyan-950 hover:bg-cyan-400"
                >
                  수정된 프레임으로 교체
                </button>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-[13px] font-black">
                      AI 수정 요청 프롬프트
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedFrame({ revisionPrompt: aiPrompt })
                        }
                        className="rounded-lg bg-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700"
                      >
                        템플릿 생성
                      </button>
                      <button
                        type="button"
                        onClick={() => void copyPrompt()}
                        className="rounded-lg bg-slate-950 px-3 py-1.5 text-[11px] font-bold text-white"
                      >
                        {copied ? "복사됨" : "복사"}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={selectedFrame.revisionPrompt || aiPrompt}
                    onChange={(event) =>
                      updateSelectedFrame({
                        revisionPrompt: event.target.value,
                      })
                    }
                    className="h-64 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-[12px] leading-5 text-slate-700 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <NumericField
                    label="중심 X"
                    value={config.centerX}
                    min={0}
                    onChange={(value) => setConfigField("centerX", value)}
                  />
                  <NumericField
                    label="바닥 Y"
                    value={config.baselineY}
                    min={0}
                    onChange={(value) => setConfigField("baselineY", value)}
                  />
                  <NumericField
                    label="프레임 W"
                    value={config.frameWidth}
                    min={16}
                    onChange={(value) => setConfigField("frameWidth", value)}
                  />
                  <NumericField
                    label="프레임 H"
                    value={config.frameHeight}
                    min={16}
                    onChange={(value) => setConfigField("frameHeight", value)}
                  />
                  <NumericField
                    label="BBox X"
                    value={config.boundingBoxX}
                    min={0}
                    onChange={(value) => setConfigField("boundingBoxX", value)}
                  />
                  <NumericField
                    label="BBox Y"
                    value={config.boundingBoxY}
                    min={0}
                    onChange={(value) => setConfigField("boundingBoxY", value)}
                  />
                  <NumericField
                    label="BBox W"
                    value={config.boundingBoxWidth}
                    min={1}
                    onChange={(value) =>
                      setConfigField("boundingBoxWidth", value)
                    }
                  />
                  <NumericField
                    label="BBox H"
                    value={config.boundingBoxHeight}
                    min={1}
                    onChange={(value) =>
                      setConfigField("boundingBoxHeight", value)
                    }
                  />
                </div>
              </>
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-[13px] text-slate-500">
                프레임을 업로드하면 상태/메모/AI 수정 프롬프트를 만들 수
                있습니다.
              </p>
            )}
          </aside>
        </section>

        <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-[12px] leading-6 text-cyan-50">
          {message}
        </p>
      </div>
    </main>
  );
}
