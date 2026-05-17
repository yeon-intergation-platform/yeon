"use client";

import { useState } from "react";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import type { CharacterDef } from "./characters";
import { TYPING_CHARACTERS } from "./characters";
import { CharacterSprite } from "./character-sprite";
import type { FrameSlot } from "./use-frame-sequence-store";
import { useFrameSequenceStore } from "./use-frame-sequence-store";

const PICK_H = 80;

function SpriteThumbnail({
  character,
  frameIndex,
  height,
}: {
  character: CharacterDef;
  frameIndex: number;
  height: number;
}) {
  const { sprite, frameWidth, frameHeight, frameCount, frameCols } = character;
  const scale = height / frameHeight;
  const w = Math.round(frameWidth * scale);
  const sheetRows = Math.max(1, Math.ceil(frameCount / frameCols));
  const col = frameIndex % frameCols;
  const row = Math.floor(frameIndex / frameCols);
  return (
    <div
      style={{
        width: w,
        height,
        backgroundImage: `url('${sprite}')`,
        backgroundSize: `${w * frameCols}px ${height * sheetRows}px`,
        backgroundPosition: `-${col * w}px -${row * height}px`,
        imageRendering: "pixelated",
        flexShrink: 0,
      }}
    />
  );
}

function isDefaultSlots(
  slots: FrameSlot[],
  defaultSlots: FrameSlot[]
): boolean {
  return (
    slots.length === defaultSlots.length &&
    slots.every(
      (s, i) =>
        s.frameIdx === defaultSlots[i]!.frameIdx &&
        s.enabled === defaultSlots[i]!.enabled
    )
  );
}

function CharacterFrameCard({
  character,
  override,
  onSequenceChange,
}: {
  character: CharacterDef;
  override: FrameSlot[] | undefined;
  onSequenceChange: (seq: FrameSlot[] | null) => void;
}) {
  const defaultSeq =
    character.frameSequence ??
    Array.from({ length: character.frameCount }, (_, i) => i);
  const defaultSlots: FrameSlot[] = defaultSeq.map((fi) => ({
    frameIdx: fi,
    enabled: true,
  }));
  const slots: FrameSlot[] = override ?? defaultSlots;
  const isModified = !!override;

  const [dragSrcPos, setDragSrcPos] = useState<number | null>(null);
  const [dragOverPos, setDragOverPos] = useState<number | null>(null);

  function toggleFrame(frameIdx: number) {
    const next = slots.map((s) =>
      s.frameIdx === frameIdx ? { ...s, enabled: !s.enabled } : s
    );
    onSequenceChange(isDefaultSlots(next, defaultSlots) ? null : next);
  }

  function handleDragStart(pos: number) {
    setDragSrcPos(pos);
  }

  function handleDragOver(e: React.DragEvent, pos: number) {
    e.preventDefault();
    setDragOverPos(pos);
  }

  function handleDrop(pos: number) {
    if (dragSrcPos !== null && dragSrcPos !== pos) {
      const next = [...slots];
      const [moved] = next.splice(dragSrcPos, 1);
      next.splice(pos, 0, moved!);
      onSequenceChange(isDefaultSlots(next, defaultSlots) ? null : next);
    }
    setDragSrcPos(null);
    setDragOverPos(null);
  }

  function handleDragEnd() {
    setDragSrcPos(null);
    setDragOverPos(null);
  }

  // 애니메이션 프리뷰에는 활성 프레임만 전달 (비어있으면 undefined → 기본값 사용)
  const activeSpriteSeq = override
    ? override.filter((s) => s.enabled).map((s) => s.frameIdx)
    : undefined;
  const spriteOverride =
    activeSpriteSeq && activeSpriteSeq.length > 0 ? activeSpriteSeq : undefined;

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className={SHARED_FEATURE_CLASS.inlineItemsCenterGap2}>
          <span className={TYPING_SERVICE_COMMON_CLASS.panelTextEmphasis}>
            {character.label.ko}
          </span>
          <span className="text-[11px] text-[#bbb]">{character.id}</span>
          {isModified && (
            <span className="rounded bg-[#f0fdf4] px-1.5 py-0.5 text-[10px] font-medium text-[#16a34a]">
              수정됨
            </span>
          )}
        </div>
        {isModified && (
          <button
            type="button"
            onClick={() => onSequenceChange(null)}
            className="text-[11px] text-[#aaa] hover:text-[#555]"
          >
            초기화
          </button>
        )}
      </div>

      {/* 프레임 선택 영역 */}
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[11px] font-medium text-[#555]">프레임 선택</span>
        <span className="text-[10px] text-[#bbb]">
          클릭해서 활성/비활성 전환, 드래그로 순서 변경
        </span>
      </div>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        {/* 프리뷰 */}
        <div className="flex h-[calc(80px+8px)] w-[64px] shrink-0 items-end justify-center rounded-lg bg-[#f5f5f5]">
          <CharacterSprite
            character={character}
            maxHeight={76}
            sequenceOverride={spriteOverride}
          />
        </div>
        {/* 프레임 슬롯: 비활성 포함 전체 순서대로 표시 */}
        <div className="flex flex-wrap gap-2">
          {slots.map((slot, seqPos) => {
            const { frameIdx, enabled } = slot;
            const isDragging = dragSrcPos === seqPos;
            const isDropTarget =
              dragOverPos === seqPos && dragSrcPos !== seqPos;
            return (
              <button
                key={`slot-${seqPos}`}
                type="button"
                draggable
                onClick={() => toggleFrame(frameIdx)}
                onDragStart={() => handleDragStart(seqPos)}
                onDragOver={(e) => handleDragOver(e, seqPos)}
                onDrop={() => handleDrop(seqPos)}
                onDragEnd={handleDragEnd}
                className="relative"
                style={{ cursor: "grab" }}
                title={
                  enabled
                    ? `${seqPos + 1}번째 — 클릭해서 비활성화, 드래그로 순서 변경`
                    : `${seqPos + 1}번째 (비활성) — 클릭해서 활성화, 드래그로 순서 변경`
                }
              >
                <div
                  style={{
                    opacity: isDragging ? 0.4 : enabled ? 1 : 0.3,
                    outline: isDropTarget
                      ? "2px solid #e87310"
                      : enabled
                        ? "2px solid #111"
                        : "2px solid #e5e5e5",
                    outlineOffset: "2px",
                  }}
                >
                  <SpriteThumbnail
                    character={character}
                    frameIndex={frameIdx}
                    height={PICK_H}
                  />
                </div>
                <span
                  className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: enabled ? "#111" : "#bbb" }}
                >
                  {enabled ? seqPos + 1 : "×"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CharacterFrameAdmin() {
  const { store, setSequence, resetAll, isLoading } = useFrameSequenceStore();
  const [search, setSearch] = useState("");

  const filtered = search
    ? TYPING_CHARACTERS.filter(
        (c) =>
          c.id.includes(search.toLowerCase()) ||
          c.label.ko.includes(search) ||
          c.label.en.toLowerCase().includes(search.toLowerCase())
      )
    : TYPING_CHARACTERS;

  const modifiedCount = Object.keys(store).length;

  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-[#111]">
              캐릭터 프레임 시퀀스
            </h1>
            <p className={`mt-1 ${SHARED_FEATURE_CLASS.text12Soft}`}>
              프레임 클릭해서 활성/비활성 전환, 드래그로 순서 변경 → 해당 캐릭터
              JSON의{" "}
              <code className="rounded bg-[#f5f5f5] px-1 text-[11px]">
                frameSequence
              </code>
              에 적용
            </p>
          </div>
          {modifiedCount > 0 && (
            <button
              type="button"
              onClick={resetAll}
              className="shrink-0 rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-[12px] text-[#555] hover:border-[#aaa]"
            >
              전체 초기화 ({modifiedCount})
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="캐릭터 검색 (id / 이름)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-5 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] text-[#111] outline-none focus:border-[#999]"
        />

        {isLoading && (
          <p className="text-[12px] text-[#bbb]">
            서버에서 프레임 데이터 로딩 중...
          </p>
        )}
        <div className="flex flex-col gap-4">
          {filtered.map((char) => (
            <CharacterFrameCard
              key={char.id}
              character={char}
              override={store[char.id]}
              onSequenceChange={(seq) => setSequence(char.id, seq)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
