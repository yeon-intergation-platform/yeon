"use client";
import { useState } from "react";
import {
  YeonButton,
  YeonField,
  YeonSurface,
  YeonView,
  YeonText,
  YeonSpriteFrame,
  joinClassNames,
} from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
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
  return (
    <YeonSpriteFrame
      displayHeight={height}
      frameCols={frameCols}
      frameCount={frameCount}
      frameHeight={frameHeight}
      frameIndex={frameIndex}
      frameWidth={frameWidth}
      source={sprite}
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
    <YeonSurface className="rounded-xl p-4">
      {/* Header */}
      <YeonView className="mb-3 flex items-center justify-between">
        <YeonView className={SHARED_FEATURE_CLASS.inlineItemsCenterGap2}>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.panelTextEmphasis}
          >
            {character.label.ko}
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="text-[11px] text-[#aaa]"
          >
            {character.id}
          </YeonText>
          {isModified && (
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="rounded bg-[#fafafa] px-1.5 py-0.5 text-[10px] font-medium text-[#111]"
            >
              수정됨
            </YeonText>
          )}
        </YeonView>
        {isModified && (
          <YeonButton
            type="button"
            onClick={() => onSequenceChange(null)}
            variant="ghost"
            size="sm"
            className="px-2 py-1 text-[11px]"
          >
            초기화
          </YeonButton>
        )}
      </YeonView>

      {/* 프레임 선택 영역 */}
      <YeonView className="mb-1 flex items-center gap-2">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[11px] font-medium text-[#666]"
        >
          프레임 선택
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[10px] text-[#aaa]"
        >
          클릭해서 활성/비활성 전환, 드래그로 순서 변경
        </YeonText>
      </YeonView>
      <YeonView className="mb-3 flex flex-wrap items-end gap-3">
        {/* 프리뷰 */}
        <YeonView className="flex h-[calc(80px+8px)] w-[64px] shrink-0 items-end justify-center rounded-lg bg-[#fafafa]">
          <CharacterSprite
            character={character}
            maxHeight={76}
            sequenceOverride={spriteOverride}
          />
        </YeonView>
        {/* 프레임 슬롯: 비활성 포함 전체 순서대로 표시 */}
        <YeonView className="flex flex-wrap gap-2">
          {slots.map((slot, seqPos) => {
            const { frameIdx, enabled } = slot;
            const isDragging = dragSrcPos === seqPos;
            const isDropTarget =
              dragOverPos === seqPos && dragSrcPos !== seqPos;
            return (
              <YeonButton
                key={`slot-${seqPos}`}
                type="button"
                draggable
                onClick={() => toggleFrame(frameIdx)}
                onDragStart={() => handleDragStart(seqPos)}
                onDragOver={(e) => handleDragOver(e, seqPos)}
                onDrop={() => handleDrop(seqPos)}
                onDragEnd={handleDragEnd}
                variant="ghost"
                size="sm"
                className="relative cursor-grab rounded-none p-0"
                title={
                  enabled
                    ? `${seqPos + 1}번째 — 클릭해서 비활성화, 드래그로 순서 변경`
                    : `${seqPos + 1}번째 (비활성) — 클릭해서 활성화, 드래그로 순서 변경`
                }
              >
                <YeonView
                  className={joinClassNames(
                    "outline outline-2 outline-offset-2",
                    isDragging
                      ? "opacity-40"
                      : enabled
                        ? "opacity-100"
                        : "opacity-30",
                    isDropTarget || enabled
                      ? "outline-[#111]"
                      : "outline-[#e5e5e5]"
                  )}
                >
                  <SpriteThumbnail
                    character={character}
                    frameIndex={frameIdx}
                    height={PICK_H}
                  />
                </YeonView>
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className={joinClassNames(
                    "absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-bold text-white",
                    enabled ? "bg-[#111]" : "bg-[#aaa]"
                  )}
                >
                  {enabled ? seqPos + 1 : "×"}
                </YeonText>
              </YeonButton>
            );
          })}
        </YeonView>
      </YeonView>
    </YeonSurface>
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
    <YeonView as="main" className="min-h-screen bg-[#fafafa] px-6 py-8">
      <YeonView className="mx-auto max-w-4xl">
        <YeonView className="mb-5 flex items-start justify-between">
          <YeonView>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="text-[20px] font-bold text-[#111]"
            >
              캐릭터 프레임 시퀀스
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={`mt-1 ${SHARED_FEATURE_CLASS.text12Soft}`}
            >
              프레임 클릭해서 활성/비활성 전환, 드래그로 순서 변경 → 해당 캐릭터
              JSON의{" "}
              <YeonText
                as="code"
                variant="unstyled"
                tone="inherit"
                className="rounded bg-[#fafafa] px-1 text-[11px]"
              >
                frameSequence
              </YeonText>
              에 적용
            </YeonText>
          </YeonView>
          {modifiedCount > 0 && (
            <YeonButton
              type="button"
              onClick={resetAll}
              variant="secondary"
              size="sm"
              className="shrink-0 rounded-lg px-3 py-1.5 text-[12px]"
            >
              전체 초기화 ({modifiedCount})
            </YeonButton>
          )}
        </YeonView>

        <YeonField
          type="text"
          placeholder="캐릭터 검색 (id / 이름)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-5 rounded-lg px-3 py-2 text-[13px]"
        />

        {isLoading && (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[12px] text-[#aaa]"
          >
            서버에서 프레임 데이터 로딩 중...
          </YeonText>
        )}
        <YeonView className="flex flex-col gap-4">
          {filtered.map((char) => (
            <CharacterFrameCard
              key={char.id}
              character={char}
              override={store[char.id]}
              onSequenceChange={(seq) => setSequence(char.id, seq)}
            />
          ))}
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
