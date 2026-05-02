"use client";

import { useState } from "react";
import type { CharacterDef } from "./characters";
import { TYPING_CHARACTERS } from "./characters";
import { CharacterSprite } from "./character-sprite";
import { useFrameSequenceStore } from "./use-frame-sequence-store";

const PICK_H = 80; // 프레임 선택 영역 썸네일 높이
const SEQ_H = 52; // 재생 순서 영역 썸네일 높이

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

function CharacterFrameCard({
  character,
  override,
  onSequenceChange,
}: {
  character: CharacterDef;
  override: number[] | undefined;
  onSequenceChange: (seq: number[] | null) => void;
}) {
  const defaultSeq =
    character.frameSequence ??
    Array.from({ length: character.frameCount }, (_, i) => i);
  const sequence = override ?? defaultSeq;
  const isModified = !!override;

  function toggleFrame(idx: number) {
    const pos = sequence.indexOf(idx);
    const next =
      pos === -1 ? [...sequence, idx] : sequence.filter((_, i) => i !== pos);
    const isDefault = JSON.stringify(next) === JSON.stringify(defaultSeq);
    onSequenceChange(isDefault || next.length === 0 ? null : next);
  }

  function moveLeft(i: number) {
    if (i === 0) return;
    const next = [...sequence];
    [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
    onSequenceChange(next);
  }

  function moveRight(i: number) {
    if (i === sequence.length - 1) return;
    const next = [...sequence];
    [next[i + 1], next[i]] = [next[i]!, next[i + 1]!];
    onSequenceChange(next);
  }

  function removeAt(i: number) {
    const next = sequence.filter((_, idx) => idx !== i);
    onSequenceChange(next.length > 0 ? next : null);
  }

  function copyToClipboard() {
    navigator.clipboard?.writeText(JSON.stringify(sequence)).catch(() => {});
  }

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-[#111]">
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
        <span className="text-[10px] text-[#bbb]">클릭해서 추가/제거</span>
      </div>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        {/* 프리뷰 */}
        <div className="flex h-[calc(80px+8px)] w-[64px] shrink-0 items-end justify-center rounded-lg bg-[#f5f5f5]">
          <CharacterSprite
            character={character}
            maxHeight={76}
            sequenceOverride={override}
          />
        </div>
        {/* 프레임 썸네일 */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: character.frameCount }, (_, i) => {
            const pos = sequence.indexOf(i);
            const inSeq = pos !== -1;
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleFrame(i)}
                className="relative"
                title={
                  inSeq
                    ? `시퀀스 ${pos + 1}번째 — 클릭해서 제거`
                    : `클릭해서 추가`
                }
              >
                <div
                  style={{
                    opacity: inSeq ? 1 : 0.35,
                    outline: inSeq ? "2px solid #111" : "2px solid #e5e5e5",
                    outlineOffset: "2px",
                  }}
                >
                  <SpriteThumbnail
                    character={character}
                    frameIndex={i}
                    height={PICK_H}
                  />
                </div>
                {inSeq && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#111] text-[10px] font-bold text-white">
                    {pos + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 재생 순서 영역 */}
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[11px] font-medium text-[#555]">재생 순서</span>
        <span className="text-[10px] text-[#bbb]">
          ◀▶ 로 순서 변경, × 로 제거
        </span>
        <button
          type="button"
          onClick={copyToClipboard}
          className="ml-auto rounded border border-[#e5e5e5] px-2 py-0.5 text-[10px] text-[#aaa] hover:border-[#aaa] hover:text-[#555]"
          title="JSON 배열로 클립보드에 복사"
        >
          복사 → JSON
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sequence.map((frameIdx, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <SpriteThumbnail
              character={character}
              frameIndex={frameIdx}
              height={SEQ_H}
            />
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => moveLeft(i)}
                disabled={i === 0}
                className="rounded px-1 py-0.5 text-[11px] text-[#bbb] disabled:opacity-25 hover:bg-[#f5f5f5] hover:text-[#555]"
              >
                ◀
              </button>
              <span className="min-w-[14px] text-center text-[10px] text-[#aaa]">
                {frameIdx}
              </span>
              <button
                type="button"
                onClick={() => moveRight(i)}
                disabled={i === sequence.length - 1}
                className="rounded px-1 py-0.5 text-[11px] text-[#bbb] disabled:opacity-25 hover:bg-[#f5f5f5] hover:text-[#555]"
              >
                ▶
              </button>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="rounded px-1 py-0.5 text-[11px] text-[#bbb] hover:bg-[#fff0f0] hover:text-[#d00]"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CharacterFrameAdmin() {
  const { store, setSequence, resetAll } = useFrameSequenceStore();
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
            <p className="mt-1 text-[12px] text-[#888]">
              상단에서 프레임을 클릭해 추가/제거 → 하단 순서 영역에서 ◀▶으로
              조정 → <strong>복사 → JSON</strong> 후 해당 캐릭터 JSON의{" "}
              <code className="rounded bg-[#f5f5f5] px-1 text-[11px]">
                frameSequence
              </code>
              에 붙여넣기
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
