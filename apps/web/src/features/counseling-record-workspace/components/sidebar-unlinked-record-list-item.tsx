"use client";

import type { MouseEventHandler } from "react";
import type { RecordItem } from "@/features/counseling-record-workspace/lib/types";

interface UnlinkedRecordListItemProps {
  record: RecordItem;
  isSelected: boolean;
  isActive: boolean;
  onMouseDown: MouseEventHandler<HTMLButtonElement>;
  onMouseEnter: MouseEventHandler<HTMLButtonElement>;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onContextMenu: MouseEventHandler<HTMLButtonElement>;
}

function fmtMonthDay(iso: string): string {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}-${day}`;
}

export function UnlinkedRecordListItem({
  record,
  isSelected,
  isActive,
  onMouseDown,
  onMouseEnter,
  onClick,
  onContextMenu,
}: UnlinkedRecordListItemProps) {
  return (
    <button
      className={`w-full flex items-center gap-2 px-2 py-[7px] rounded-md text-left text-xs transition-colors cursor-pointer font-[inherit] border-none ${
        isSelected
          ? "bg-accent-dim border border-accent-border text-text"
          : isActive
            ? "bg-surface-3 border border-border-light text-text"
            : "bg-transparent text-text-dim hover:text-text hover:bg-surface-3"
      }`}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <span className="text-[10px] text-text-dim flex-shrink-0 w-9 tabular-nums">
        {fmtMonthDay(record.createdAt)}
      </span>
      <span className="truncate">{record.title}</span>
      {record.status === "processing" && (
        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-text-secondary animate-pulse" />
      )}
    </button>
  );
}
