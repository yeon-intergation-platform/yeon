"use client";

import { useState } from "react";

import { MarkdownContent } from "./markdown-content";

interface MarkdownEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  minRows?: number;
  placeholder?: string;
}

export function MarkdownEditor({
  label,
  value,
  onChange,
  maxLength = 2000,
  minRows = 6,
  placeholder,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-[#111]">{label}</span>
        <div className="flex items-center gap-2 text-[12px] text-[#888]">
          <span>
            {value.length}/{maxLength}
          </span>
          <div className="rounded-lg bg-[#f3f3f3] p-0.5 font-semibold">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`rounded-md px-2 py-1 ${mode === "edit" ? "bg-white text-[#111]" : "text-[#666]"}`}
            >
              작성
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`rounded-md px-2 py-1 ${mode === "preview" ? "bg-white text-[#111]" : "text-[#666]"}`}
            >
              미리보기
            </button>
          </div>
        </div>
      </div>
      {mode === "edit" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={maxLength}
          rows={minRows}
          placeholder={placeholder}
          className="min-h-[130px] resize-y rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 font-mono text-[14px] leading-6 text-[#111] outline-none focus:border-[#111]"
        />
      ) : (
        <div className="min-h-[130px] rounded-xl border border-[#e5e5e5] bg-white px-3 py-2">
          {value.trim() ? (
            <MarkdownContent>{value}</MarkdownContent>
          ) : (
            <p className="text-[14px] text-[#aaa]">미리볼 내용이 없습니다.</p>
          )}
        </div>
      )}
    </label>
  );
}
