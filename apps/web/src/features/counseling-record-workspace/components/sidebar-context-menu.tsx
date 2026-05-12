"use client";

import type { RefObject } from "react";

export interface SidebarContextMenuAction {
  key: string;
  label: string;
  destructive?: boolean;
  action: () => Promise<void> | void;
}

interface SidebarContextMenuProps {
  menuRef: RefObject<HTMLDivElement | null>;
  x: number;
  y: number;
  primaryId: string;
  deletingPrimaryId: string | null;
  actions: SidebarContextMenuAction[];
}

function getActionIcon(actionKey: string) {
  if (actionKey === "delete") return "🗑";
  if (
    actionKey === "open-space" ||
    actionKey === "open-member" ||
    actionKey === "open-record"
  ) {
    return "📂";
  }
  if (
    actionKey === "goto-student-management" ||
    actionKey === "open-member-management"
  ) {
    return "👥";
  }
  if (actionKey.includes("export")) return "📄";
  return "•";
}

export function SidebarContextMenu({
  menuRef,
  x,
  y,
  primaryId,
  deletingPrimaryId,
  actions,
}: SidebarContextMenuProps) {
  return (
    <div
      ref={menuRef}
      className="fixed min-w-[168px] rounded-md border border-border-light bg-surface-3 py-1 shadow-[0_12px_32px_rgba(0,0,0,0.42)] z-[120]"
      style={{ left: x, top: y }}
    >
      {actions.map((action, index) => {
        const isDeleting =
          action.key === "delete" && deletingPrimaryId === primaryId;

        return (
          <button
            key={action.key}
            type="button"
            className={`flex w-full items-center gap-2 px-3 py-2 bg-transparent border-none text-left text-[12px] font-medium cursor-pointer hover:bg-surface-4 disabled:opacity-50 ${
              action.destructive ? "text-red" : "text-text"
            } ${index > 0 && action.destructive ? "border-t border-border" : ""}`}
            onClick={() => void action.action()}
            disabled={isDeleting}
          >
            <span>{getActionIcon(action.key)}</span>
            {isDeleting ? "삭제 중..." : action.label}
          </button>
        );
      })}
    </div>
  );
}
