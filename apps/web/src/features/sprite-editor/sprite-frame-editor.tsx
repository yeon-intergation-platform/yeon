"use client";
import {
  YeonBadge,
  YeonButton,
  YeonCanvas,
  type YeonCanvasHandle,
  YeonCheckbox,
  YeonField,
  YeonImage,
  YeonLabel,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import {
  clearYeonInterval,
  copyYeonClipboardText,
  createYeonAnchorElement,
  createYeonBlob,
  createYeonCanvasElement,
  createYeonImageElement,
  createYeonObjectUrl,
  getYeonNow,
  getYeonRandom,
  isYeonInputElement,
  revokeYeonObjectUrl,
  scheduleYeonInterval,
  scheduleYeonTimeout,
  type YeonBlob,
  type YeonCanvasElement,
  type YeonCanvasRenderingContext2D,
  type YeonFile,
  type YeonImageElement,
  type YeonInputElement,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type FrameStatus = "unchecked" | "pass" | "needs-fix";
type FrameFilter = "all" | FrameStatus;

type FrameItem = {
  id: string;
  name: string;
  url: string;
  status: FrameStatus;
  note: string;
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

const SAMPLE_GUIDE_SHEET = "/sprite-editor/slime-bounce-guide-sample.png";
const GUIDE_FRAME_COUNT = 8;
const GUIDE_GUTTER_WIDTH = 4;
const GUIDE_GUTTER_COLOR = "#111";
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
  unchecked: "border-[#e5e5e5] bg-[#fafafa] text-[#666]",
  pass: "border-[#111] bg-white text-[#111]",
  "needs-fix": "border-[#e5e5e5] bg-white text-[#111]",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function makeCanvas(width: number, height: number) {
  const canvas = createYeonCanvasElement();
  if (!canvas) {
    throw new Error("캔버스 런타임을 사용할 수 없습니다.");
  }

  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function drawCheckerboard(
  ctx: YeonCanvasRenderingContext2D,
  width: number,
  height: number,
  size = CHECKER_SIZE
) {
  ctx.clearRect(0, 0, width, height);
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      ctx.fillStyle = (x / size + y / size) % 2 === 0 ? "#e5e5e5" : "#fafafa";
      ctx.fillRect(x, y, size, size);
    }
  }
}

function createRequiredObjectUrl(blob: YeonBlob | YeonFile) {
  const url = createYeonObjectUrl(blob);
  if (!url) {
    throw new Error("파일 URL을 만들 수 없습니다.");
  }
  return url;
}

function downloadBlob(blob: YeonBlob, filename: string) {
  const url = createRequiredObjectUrl(blob);
  const link = createYeonAnchorElement();
  if (!link) {
    revokeYeonObjectUrl(url);
    throw new Error("다운로드 런타임을 사용할 수 없습니다.");
  }

  link.href = url;
  link.download = filename;
  link.click();
  revokeYeonObjectUrl(url);
}

function canvasToBlob(canvas: YeonCanvasElement) {
  return new Promise<YeonBlob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG 변환에 실패했습니다."));
    }, "image/png");
  });
}

async function loadImage(url: string) {
  const image = createYeonImageElement();
  if (!image) {
    throw new Error("이미지 런타임을 사용할 수 없습니다.");
  }

  image.src = url;
  await image.decode();
  return image;
}

async function fileToImage(file: YeonFile) {
  const url = createRequiredObjectUrl(file);
  try {
    return await loadImage(url);
  } finally {
    revokeYeonObjectUrl(url);
  }
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
    <YeonLabel className="flex flex-col gap-1 text-[11px] font-bold text-[#666]">
      <YeonText as="span" variant="caption" className="font-bold text-[#666]">
        {label}
      </YeonText>
      <YeonField
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-9 rounded-xl px-2 text-[13px] font-semibold"
      />
    </YeonLabel>
  );
}

function frameId() {
  return `frame-${getYeonNow().toString(36)}-${getYeonRandom().toString(36).slice(2)}`;
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
  const image = await loadImage(url);
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

function makeFrameItemFromCanvas(
  canvas: YeonCanvasElement,
  index: number,
  namePrefix: string
): FrameItem {
  return {
    id: frameId(),
    name: `${namePrefix}-${String(index + 1).padStart(2, "0")}.png`,
    url: canvas.toDataURL("image/png"),
    status: "unchecked",
    note: "",
  };
}

function extractGuideSheetFramesFromImage(
  image: YeonImageElement,
  config: GuideConfig,
  namePrefix: string,
  frameCount = GUIDE_FRAME_COUNT
) {
  const expectedWidth =
    frameCount * config.frameWidth + (frameCount - 1) * GUIDE_GUTTER_WIDTH;

  if (
    image.naturalWidth !== expectedWidth ||
    image.naturalHeight !== config.frameHeight
  ) {
    throw new Error(
      `가이드 시트 크기는 ${expectedWidth}x${config.frameHeight}px 이어야 합니다. 현재: ${image.naturalWidth}x${image.naturalHeight}px`
    );
  }

  return Array.from({ length: frameCount }, (_, index) => {
    const canvas = makeCanvas(config.frameWidth, config.frameHeight);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        image,
        index * (config.frameWidth + GUIDE_GUTTER_WIDTH),
        0,
        config.frameWidth,
        config.frameHeight,
        0,
        0,
        config.frameWidth,
        config.frameHeight
      );
    }
    return makeFrameItemFromCanvas(canvas, index, namePrefix);
  });
}

async function extractGuideSheetFrames(file: YeonFile, config: GuideConfig) {
  const image = await fileToImage(file);
  return extractGuideSheetFramesFromImage(image, config, "guide-frame");
}

async function loadSampleSheetFrames(config: GuideConfig) {
  const image = await loadImage(SAMPLE_GUIDE_SHEET);
  return extractGuideSheetFramesFromImage(image, config, "slime-bounce");
}

function buildCodexHandoffReport({
  frames,
  config,
}: {
  frames: FrameItem[];
  config: GuideConfig;
}) {
  const needsFixFrames = frames
    .map((frame, index) => ({ frame, index }))
    .filter(({ frame }) => frame.status === "needs-fix");

  if (needsFixFrames.length === 0) {
    return "수정 필요로 표시된 프레임이 없습니다. 재생 검수 후 문제가 있는 프레임을 수정 필요로 표시하고 메모를 남기세요.";
  }

  return [
    "AI 스프라이트 프레임 QA 리포트",
    `총 프레임: ${frames.length}`,
    `출력 기준: ${config.frameWidth}x${config.frameHeight}px, ${config.fps}fps`,
    `중심선 x=${config.centerX}, 바닥선 y=${config.baselineY}`,
    `기준 BBox x=${config.boundingBoxX}, y=${config.boundingBoxY}, w=${config.boundingBoxWidth}, h=${config.boundingBoxHeight}`,
    "",
    "수정 필요 프레임:",
    ...needsFixFrames.map(({ frame, index }) => {
      const previousName = frames[index - 1]?.name ?? "없음";
      const nextName = frames[index + 1]?.name ?? "없음";
      const note = frame.note.trim() || "검수 메모 없음";
      return `- #${index + 1} ${frame.name} | 이전=${previousName} | 다음=${nextName} | 문제=${note}`;
    }),
    "",
    "이 리포트는 사이트가 이미지를 다시 생성하기 위한 기능이 아니라, Codex 채팅에 별도로 첨부할 검수 데이터입니다.",
  ].join("\n");
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

  const uploadInputRef = useRef<YeonInputElement | null>(null);
  const guideSheetInputRef = useRef<YeonInputElement | null>(null);
  const replaceInputRef = useRef<YeonInputElement | null>(null);
  const previewCanvasRef = useRef<YeonCanvasHandle | null>(null);
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
  const codexHandoffReport = useMemo(
    () => buildCodexHandoffReport({ frames, config }),
    [config, frames]
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
          url: createRequiredObjectUrl(file),
          status: "unchecked" as FrameStatus,
          note: "",
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
      const url = createRequiredObjectUrl(file);
      updateSelectedFrame({
        name: file.name,
        url,
        status: "unchecked",
      });
      setMessage(
        `${selectedIndex + 1}번 프레임을 교체했습니다. 다시 재생 검수하세요.`
      );
    },
    [selectedFrame, selectedIndex, updateSelectedFrame]
  );

  const handleGuideSheetImport = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      try {
        const guideFrames = await extractGuideSheetFrames(file, config);
        setFrames(guideFrames);
        setSelectedFrameId(guideFrames[0]?.id ?? null);
        setMessage(
          `${file.name}에서 guide gutter를 제거하고 ${guideFrames.length}개 64x64 프레임을 추출했습니다.`
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "가이드 시트 import에 실패했습니다."
        );
      } finally {
        if (guideSheetInputRef.current) {
          guideSheetInputRef.current.value = "";
        }
      }
    },
    [config]
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
      ctx.strokeStyle = "rgba(17, 17, 17, 0.95)";
      ctx.beginPath();
      ctx.moveTo(config.centerX * scale + 0.5, 0);
      ctx.lineTo(config.centerX * scale + 0.5, canvas.height);
      ctx.stroke();
      ctx.strokeStyle = "rgba(102, 102, 102, 0.95)";
      ctx.beginPath();
      ctx.moveTo(0, config.baselineY * scale + 0.5);
      ctx.lineTo(canvas.width, config.baselineY * scale + 0.5);
      ctx.stroke();
      if (showBoundingBox) {
        ctx.strokeStyle = "rgba(170, 170, 170, 0.95)";
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

  const exportGuideTemplate = useCallback(async () => {
    const width =
      GUIDE_FRAME_COUNT * config.frameWidth +
      (GUIDE_FRAME_COUNT - 1) * GUIDE_GUTTER_WIDTH;
    const template = makeCanvas(width, config.frameHeight);
    const ctx = template.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, template.width, template.height);
    ctx.fillStyle = GUIDE_GUTTER_COLOR;

    for (let index = 1; index < GUIDE_FRAME_COUNT; index += 1) {
      ctx.fillRect(
        index * config.frameWidth + (index - 1) * GUIDE_GUTTER_WIDTH,
        0,
        GUIDE_GUTTER_WIDTH,
        config.frameHeight
      );
    }

    downloadBlob(
      await canvasToBlob(template),
      "ai_sprite_8x64_guide_gutter_template.png"
    );
  }, [config.frameHeight, config.frameWidth]);

  const exportManifest = useCallback(() => {
    const manifest = {
      type: "ai-sprite-qa-manifest",
      frameWidth: config.frameWidth,
      frameHeight: config.frameHeight,
      guideSheet: {
        frameCount: GUIDE_FRAME_COUNT,
        gutterWidth: GUIDE_GUTTER_WIDTH,
        gutterColor: GUIDE_GUTTER_COLOR,
        width:
          GUIDE_FRAME_COUNT * config.frameWidth +
          (GUIDE_FRAME_COUNT - 1) * GUIDE_GUTTER_WIDTH,
        height: config.frameHeight,
      },
      fps: config.fps,
      centerX: config.centerX,
      baselineY: config.baselineY,
      boundingBox: {
        x: config.boundingBoxX,
        y: config.boundingBoxY,
        width: config.boundingBoxWidth,
        height: config.boundingBoxHeight,
      },
      revisionQueue: frames
        .map((frame, index) => ({
          index: index + 1,
          name: frame.name,
          status: frame.status,
          note: frame.note,
          previousFrame: frames[index - 1]?.name ?? null,
          nextFrame: frames[index + 1]?.name ?? null,
        }))
        .filter((frame) => frame.status === "needs-fix"),
      frames: frames.map((frame, index) => ({
        index: index + 1,
        name: frame.name,
        status: frame.status,
        note: frame.note,
      })),
    };
    downloadBlob(
      createYeonBlob([JSON.stringify(manifest, null, 2)], {
        type: "application/json",
      }),
      "ai_sprite_frames_qa_manifest.json"
    );
  }, [config, frames]);

  const copyCodexReport = useCallback(async () => {
    if (!codexHandoffReport) return;
    const copiedToClipboard = await copyYeonClipboardText(codexHandoffReport);
    if (!copiedToClipboard) {
      setMessage("클립보드에 리포트를 복사하지 못했습니다.");
      return;
    }

    setCopied(true);
    const timer = scheduleYeonTimeout(() => setCopied(false), 1200);
    if (!timer) setCopied(false);
  }, [codexHandoffReport]);

  const loadSample = useCallback(async () => {
    const sampleFrames = await loadSampleSheetFrames(config);
    setFrames(sampleFrames);
    setSelectedFrameId(sampleFrames[0]?.id ?? null);
    setMessage(
      "guide gutter 슬라임 샘플 시트를 8개 QA 프레임으로 분해했습니다. 재생해서 튀는 프레임을 검수하세요."
    );
  }, [config]);

  useEffect(() => {
    if (initialSampleLoadedRef.current) return;
    initialSampleLoadedRef.current = true;
    void loadSample();
  }, [loadSample]);

  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;
    const id = scheduleYeonInterval(
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
    return () => clearYeonInterval(id);
  }, [config.fps, frames, isPlaying]);

  useEffect(() => {
    void drawPreview();
  }, [drawPreview]);

  return (
    <YeonView as="main" className="min-h-screen bg-white px-5 py-5 text-[#111]">
      <YeonView className="mx-auto flex max-w-[1500px] flex-col gap-4">
        <YeonSurface
          as="header"
          className="rounded-3xl p-5 shadow-[0_18px_45px_rgba(17,17,17,0.08)]"
        >
          <YeonView className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <YeonView>
              <YeonText
                variant="caption"
                className="font-black uppercase tracking-[0.24em] text-[#666]"
              >
                AI sprite QA pipeline
              </YeonText>
              <YeonText as="h1" variant="subtitle" className="mt-2">
                AI 생성 스프라이트 재생 검수·수정 큐 도구
              </YeonText>
              <YeonText className="mt-2 max-w-4xl text-[13px] leading-6 text-[#666]">
                사람이 픽셀을 찍는 그림판이 아니라, AI가 만든 프레임들을
                순서대로 재생하고 흔들리는 프레임을 표시한 뒤 Codex에게 따로
                요청할 수정 큐 리포트를 정리하는 내부 QA 도구입니다. 현재 샘플은
                64x64 프레임 8개와 4px guide gutter를 기준으로 맞춘 슬라임
                바운스 스프라이트입니다.
              </YeonText>
            </YeonView>
            <YeonView className="flex flex-wrap gap-2">
              <YeonButton
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                variant="primary"
              >
                프레임 다중 업로드
              </YeonButton>
              <YeonButton
                type="button"
                onClick={() => guideSheetInputRef.current?.click()}
                variant="secondary"
              >
                guide sheet import
              </YeonButton>
              <YeonButton
                type="button"
                onClick={() => void exportGuideTemplate()}
                variant="secondary"
              >
                guide template export
              </YeonButton>
              <YeonButton
                type="button"
                onClick={loadSample}
                variant="secondary"
              >
                샘플 다시 불러오기
              </YeonButton>
              <YeonButton
                type="button"
                onClick={exportSheet}
                variant="secondary"
              >
                스프라이트시트 export
              </YeonButton>
              <YeonButton
                type="button"
                onClick={exportManifest}
                variant="secondary"
              >
                수정 큐 JSON export
              </YeonButton>
            </YeonView>
          </YeonView>
          <YeonField
            ref={(node) => {
              uploadInputRef.current = isYeonInputElement(node) ? node : null;
            }}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => void handleUpload(event.target.files)}
          />
          <YeonField
            ref={(node) => {
              guideSheetInputRef.current = isYeonInputElement(node)
                ? node
                : null;
            }}
            type="file"
            accept="image/png,image/*"
            className="hidden"
            onChange={(event) =>
              void handleGuideSheetImport(event.target.files)
            }
          />
          <YeonField
            ref={(node) => {
              replaceInputRef.current = isYeonInputElement(node) ? node : null;
            }}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void handleReplace(event.target.files)}
          />
        </YeonSurface>

        <YeonView
          as="section"
          className="grid min-h-[720px] gap-4 xl:grid-cols-[280px_1fr_360px]"
        >
          <YeonSurface as="aside" className="flex min-h-0 flex-col p-4">
            <YeonView className="flex items-start justify-between gap-3">
              <YeonView>
                <YeonText as="h2" variant="label">
                  프레임 목록
                </YeonText>
                <YeonText variant="caption" className="mt-1 text-[#666]">
                  문제 프레임을 빠르게 찾고 순서를 조정합니다.
                </YeonText>
              </YeonView>
              <YeonBadge variant="accent">{frames.length}</YeonBadge>
            </YeonView>

            <YeonView className="mt-3 grid grid-cols-3 gap-2 text-center">
              <YeonSurface variant="panel" className="p-2">
                <YeonText variant="caption" className="font-bold text-[#666]">
                  미검수 {summary.unchecked}
                </YeonText>
              </YeonSurface>
              <YeonSurface variant="panel" className="p-2">
                <YeonText variant="caption" className="font-bold text-[#111]">
                  통과 {summary.pass}
                </YeonText>
              </YeonSurface>
              <YeonSurface variant="panel" className="p-2">
                <YeonText variant="caption" className="font-bold text-[#111]">
                  수정 {summary["needs-fix"]}
                </YeonText>
              </YeonSurface>
            </YeonView>

            <YeonView className="mt-3 grid grid-cols-2 gap-2">
              {(["all", "unchecked", "pass", "needs-fix"] as FrameFilter[]).map(
                (item) => (
                  <YeonButton
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={
                      filter === item
                        ? "bg-[#111] text-white"
                        : "bg-[#fafafa] text-[#666]"
                    }
                    variant={filter === item ? "primary" : "secondary"}
                  >
                    {item === "all" ? "전체" : STATUS_LABEL[item]}
                  </YeonButton>
                )
              )}
            </YeonView>

            <YeonView className="mt-3 min-h-0 flex-1 overflow-auto pr-1">
              <YeonView className="flex flex-col gap-2">
                {visibleFrames.map((frame) => {
                  const index = frames.findIndex(
                    (item) => item.id === frame.id
                  );
                  const selected = frame.id === selectedFrame?.id;
                  return (
                    <YeonButton
                      key={frame.id}
                      type="button"
                      onClick={() => setSelectedFrameId(frame.id)}
                      variant="secondary"
                      className={
                        selected
                          ? "justify-start border-[#111] bg-[#fafafa] p-2 text-left"
                          : "justify-start border-[#e5e5e5] bg-white p-2 text-left hover:bg-[#fafafa]"
                      }
                    >
                      <YeonView className="flex w-full items-center gap-3">
                        <YeonView className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#e5e5e5] bg-[#fafafa]">
                          <YeonImage
                            src={frame.url}
                            alt=""
                            className="max-h-12 max-w-12 [image-rendering:pixelated]"
                          />
                        </YeonView>
                        <YeonView className="min-w-0 flex-1">
                          <YeonView className="flex items-center gap-2">
                            <YeonText
                              as="span"
                              variant="caption"
                              className="font-black text-[#111]"
                            >
                              #{index + 1}
                            </YeonText>
                            <YeonBadge
                              variant="neutral"
                              className={`border px-2 py-0.5 text-[10px] ${STATUS_CLASS[frame.status]}`}
                            >
                              {STATUS_LABEL[frame.status]}
                            </YeonBadge>
                          </YeonView>
                          <YeonText
                            variant="caption"
                            className="mt-1 truncate text-[#666]"
                          >
                            {frame.name}
                          </YeonText>
                          {frame.note ? (
                            <YeonText
                              variant="caption"
                              className="mt-1 truncate text-[#111]"
                            >
                              {frame.note}
                            </YeonText>
                          ) : null}
                        </YeonView>
                      </YeonView>
                    </YeonButton>
                  );
                })}
              </YeonView>
            </YeonView>
          </YeonSurface>

          <YeonView as="section" className="flex min-h-0 flex-col gap-4">
            <YeonSurface className="flex flex-1 flex-col p-4">
              <YeonView className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <YeonView>
                  <YeonText as="h2" variant="label">
                    재생 검수 프리뷰
                  </YeonText>
                  <YeonText variant="caption" className="mt-1 text-[#666]">
                    기준선/중심선/onion skin으로 프레임 간 흔들림을 확인합니다.
                  </YeonText>
                </YeonView>
                <YeonView className="flex flex-wrap gap-2">
                  <YeonLabel className="flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-[12px] font-bold text-[#666]">
                    <YeonCheckbox
                      checked={showGuides}
                      onChange={(event) => setShowGuides(event.target.checked)}
                    />
                    기준선
                  </YeonLabel>
                  <YeonLabel className="flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-[12px] font-bold text-[#666]">
                    <YeonCheckbox
                      checked={showOnionSkin}
                      onChange={(event) =>
                        setShowOnionSkin(event.target.checked)
                      }
                    />
                    onion
                  </YeonLabel>
                  <YeonLabel className="flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-[12px] font-bold text-[#666]">
                    <YeonCheckbox
                      checked={showBoundingBox}
                      onChange={(event) =>
                        setShowBoundingBox(event.target.checked)
                      }
                    />
                    bbox
                  </YeonLabel>
                </YeonView>
              </YeonView>

              <YeonView className="flex flex-1 items-center justify-center overflow-auto rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-4">
                {selectedFrame ? (
                  <YeonCanvas
                    ref={previewCanvasRef}
                    className="max-h-full max-w-full rounded-2xl [image-rendering:pixelated]"
                  />
                ) : (
                  <YeonText variant="caption" className="text-[#666]">
                    프레임을 업로드하세요.
                  </YeonText>
                )}
              </YeonView>
            </YeonSurface>

            <YeonSurface className="p-4">
              <YeonView className="flex flex-wrap items-center gap-2">
                <YeonButton
                  type="button"
                  onClick={() => setIsPlaying((value) => !value)}
                  variant="primary"
                >
                  {isPlaying ? "정지" : "재생"}
                </YeonButton>
                <YeonButton
                  type="button"
                  onClick={() => selectIndex(selectedIndex - 1)}
                  variant="secondary"
                >
                  이전
                </YeonButton>
                <YeonButton
                  type="button"
                  onClick={() => selectIndex(selectedIndex + 1)}
                  variant="secondary"
                >
                  다음
                </YeonButton>
                <YeonView className="ml-0 flex items-center gap-2 md:ml-4">
                  <YeonText variant="caption" className="font-bold text-[#666]">
                    FPS
                  </YeonText>
                  <YeonField
                    type="range"
                    min={1}
                    max={30}
                    value={config.fps}
                    onChange={(event) =>
                      setConfigField("fps", Number(event.target.value))
                    }
                    className="h-9 w-32 p-0"
                  />
                  <YeonText
                    as="span"
                    variant="caption"
                    className="w-8 font-black text-[#111]"
                  >
                    {config.fps}
                  </YeonText>
                </YeonView>
                <YeonText
                  as="span"
                  variant="caption"
                  className="ml-auto font-semibold text-[#666]"
                >
                  현재 {selectedFrame ? selectedIndex + 1 : 0}/{frames.length}
                </YeonText>
              </YeonView>
              <YeonView className="mt-3 flex gap-1 overflow-x-auto pb-1">
                {frames.map((frame, index) => (
                  <YeonButton
                    key={frame.id}
                    type="button"
                    onClick={() => setSelectedFrameId(frame.id)}
                    className={`h-3 min-h-0 min-w-8 rounded-full border-none p-0 ${
                      index === selectedIndex
                        ? "bg-[#111]"
                        : frame.status === "pass"
                          ? "bg-[#666]"
                          : frame.status === "needs-fix"
                            ? "bg-[#aaa]"
                            : "bg-[#e5e5e5]"
                    }`}
                    title={`${index + 1}: ${STATUS_LABEL[frame.status]}`}
                    variant="ghost"
                  />
                ))}
              </YeonView>
            </YeonSurface>
          </YeonView>

          <YeonSurface as="aside" className="flex min-h-0 flex-col gap-4 p-4">
            <YeonView>
              <YeonText as="h2" variant="label">
                현재 프레임 QA
              </YeonText>
              <YeonText variant="caption" className="mt-1 text-[#666]">
                문제를 기록하고 Codex에게 넘길 수정 큐를 정리합니다.
              </YeonText>
            </YeonView>

            {selectedFrame ? (
              <>
                <YeonSurface variant="panel" className="p-3">
                  <YeonText
                    variant="caption"
                    className="font-black text-[#111]"
                  >
                    #{selectedIndex + 1} {selectedFrame.name}
                  </YeonText>
                  <YeonView className="mt-3 grid grid-cols-3 gap-2">
                    {(["unchecked", "pass", "needs-fix"] as FrameStatus[]).map(
                      (status) => (
                        <YeonButton
                          key={status}
                          type="button"
                          onClick={() => updateSelectedFrame({ status })}
                          className={
                            selectedFrame.status === status
                              ? STATUS_CLASS[status]
                              : "border-[#e5e5e5] bg-white text-[#666]"
                          }
                          size="sm"
                          variant="secondary"
                        >
                          {STATUS_LABEL[status]}
                        </YeonButton>
                      )
                    )}
                  </YeonView>
                </YeonSurface>

                <YeonLabel className="flex flex-col gap-2 text-[12px] font-bold text-[#666]">
                  검수 메모
                  <YeonField
                    as="textarea"
                    value={selectedFrame.note}
                    onChange={(event) =>
                      updateSelectedFrame({ note: event.target.value })
                    }
                    placeholder="예: 7번 프레임에서 오른발이 기준선 위로 뜸, 머리 크기가 1~6번보다 큼, 스카프 누락"
                    className="min-h-28 resize-none rounded-2xl p-3 text-[13px] font-medium leading-6"
                  />
                </YeonLabel>

                <YeonView className="grid grid-cols-3 gap-2">
                  <YeonButton
                    type="button"
                    onClick={() => moveSelected(-1)}
                    size="sm"
                    variant="secondary"
                  >
                    앞으로
                  </YeonButton>
                  <YeonButton
                    type="button"
                    onClick={() => moveSelected(1)}
                    size="sm"
                    variant="secondary"
                  >
                    뒤로
                  </YeonButton>
                  <YeonButton
                    type="button"
                    onClick={removeSelected}
                    size="sm"
                    variant="danger"
                  >
                    삭제
                  </YeonButton>
                </YeonView>

                <YeonButton
                  type="button"
                  onClick={() => replaceInputRef.current?.click()}
                  variant="primary"
                >
                  수정된 프레임으로 교체
                </YeonButton>

                <YeonSurface variant="panel" className="p-3">
                  <YeonView className="mb-2 flex items-center justify-between gap-2">
                    <YeonText as="h3" variant="label">
                      Codex 수정 큐 리포트
                    </YeonText>
                    <YeonButton
                      type="button"
                      onClick={() => void copyCodexReport()}
                      size="sm"
                      variant="primary"
                    >
                      {copied ? "복사됨" : "리포트 복사"}
                    </YeonButton>
                  </YeonView>
                  <YeonText variant="caption" className="mb-2 text-[#666]">
                    이 사이트는 외부 이미지 API를 호출하지 않습니다. 프레임
                    수정은 Codex 채팅에서 별도로 요청하고, 여기서는 수정 필요
                    프레임과 검수 메모만 정리합니다.
                  </YeonText>
                  <YeonField
                    as="textarea"
                    readOnly
                    value={codexHandoffReport}
                    className="h-56 resize-none rounded-xl p-3 text-[12px] leading-5 text-[#666]"
                  />
                </YeonSurface>

                <YeonView className="grid grid-cols-2 gap-2">
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
                </YeonView>
              </>
            ) : (
              <YeonSurface variant="empty" className="p-4 text-left">
                <YeonText variant="caption" className="text-[#666]">
                  프레임을 업로드하면 상태/메모/Codex 수정 큐를 정리할 수
                  있습니다.
                </YeonText>
              </YeonSurface>
            )}
          </YeonSurface>
        </YeonView>

        <YeonSurface variant="panel" className="px-4 py-3">
          <YeonText variant="caption" className="text-[#666]">
            {message}
          </YeonText>
        </YeonSurface>
      </YeonView>
    </YeonView>
  );
}
