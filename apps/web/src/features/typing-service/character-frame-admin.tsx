"use client";

import { useState } from "react";
import type { CharacterDef } from "./characters";
import { TYPING_CHARACTERS } from "./characters";
import { CharacterSprite } from "./character-sprite";
import { useFrameSequenceStore } from "./use-frame-sequence-store";

const THUMB_HEIGHT = 80;

function FrameThumbnail({
  character,
  frameIndex,
  seqPosition,
  onClick,
}: {
  character: CharacterDef;
  frameIndex: number;
  seqPosition: number | null;
  onClick: () => void;
}) {
  const { sprite, frameWidth, frameHeight, frameCount, frameCols } = character;
  const scale = THUMB_HEIGHT / frameHeight;
  const thumbW = Math.round(frameWidth * scale);
  const sheetRows = Math.max(1, Math.ceil(frameCount / frameCols));
  const col = frameIndex % frameCols;
  const row = Math.floor(frameIndex / frameCols);
  const selected = seqPosition !== null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center"
    >
      <div
        style={{
          width: thumbW,
          height: THUMB_HEIGHT,
          backgroundImage: `url('${sprite}')`,
          backgroundSize: `${thumbW * frameCols}px ${THUMB_HEIGHT * sheetRows}px`,
          backgroundPosition: `-${col * thumbW}px -${row * THUMB_HEIGHT}px`,
          imageRendering: "pixelated",
          outline: selected ? "2px solid #111" : "2px solid #e5e5e5",
          outlineOffset: "2px",
        }}
      />
      {selected && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#111] text-[9px] font-bold text-white">
          {seqPosition! + 1}
        </span>
      )}
      <span className="mt-1 text-[10px] text-[#999]">{frameIndex}</span>
    </button>
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

      {/* Preview + Frame grid */}
      <div className="mb-3 flex flex-wrap items-end gap-4">
        <div className="flex h-[100px] w-[72px] shrink-0 items-end justify-center rounded-lg bg-[#f5f5f5]">
          <CharacterSprite
            character={character}
            maxHeight={96}
            sequenceOverride={override}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: character.frameCount }, (_, i) => {
            const pos = sequence.indexOf(i);
            return (
              <FrameThumbnail
                key={i}
                character={character}
                frameIndex={i}
                seqPosition={pos !== -1 ? pos : null}
                onClick={() => toggleFrame(i)}
              />
            );
          })}
        </div>
      </div>

      {/* Sequence order row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-[#aaa]">순서:</span>
        {sequence.map((frameIdx, i) => (
          <div
            key={i}
            className="flex items-center gap-0.5 rounded border border-[#e5e5e5] px-1.5 py-0.5"
          >
            <span className="min-w-[12px] text-center text-[12px] font-medium text-[#111]">
              {frameIdx}
            </span>
            <button
              type="button"
              onClick={() => moveLeft(i)}
              disabled={i === 0}
              className="px-0.5 text-[10px] text-[#bbb] disabled:opacity-30 hover:text-[#555]"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={() => moveRight(i)}
              disabled={i === sequence.length - 1}
              className="px-0.5 text-[10px] text-[#bbb] disabled:opacity-30 hover:text-[#555]"
            >
              ▶
            </button>
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="px-0.5 text-[10px] text-[#bbb] hover:text-[#d00]"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={copyToClipboard}
          className="ml-1 rounded border border-[#e5e5e5] px-2 py-0.5 text-[10px] text-[#aaa] hover:border-[#aaa] hover:text-[#555]"
          title="JSON 배열로 클립보드에 복사"
        >
          복사 →&nbsp;JSON
        </button>
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
              프레임 썸네일 클릭으로 시퀀스 추가/제거, ◀▶로 순서 변경. 설정은
              localStorage에 저장됩니다. 확정되면 &ldquo;복사 → JSON&rdquo;으로
              복사 후 해당 캐릭터 JSON 파일의{" "}
              <code className="rounded bg-[#f5f5f5] px-1 text-[11px]">
                frameSequence
              </code>
              에 붙여넣으세요.
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
