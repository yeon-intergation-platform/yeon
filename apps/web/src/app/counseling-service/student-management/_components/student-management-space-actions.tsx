"use client";

import type { RefObject } from "react";
import { Drawer as VaulDrawer } from "vaul";
import { Pencil, Users } from "lucide-react";

import type {
  SpaceContextMenuState,
  SpaceDialogTarget,
} from "@/features/student-management/types/space-sidebar-types";

interface StudentManagementMobileSpaceActionSheetProps {
  target: SpaceDialogTarget | null;
  onClose: () => void;
  onOpenSpaceSettings: (spaceId: string) => void;
  onRename: (target: SpaceDialogTarget) => void;
  onDelete: (target: SpaceDialogTarget) => void;
}

export function StudentManagementMobileSpaceActionSheet({
  target,
  onClose,
  onOpenSpaceSettings,
  onRename,
  onDelete,
}: StudentManagementMobileSpaceActionSheetProps) {
  return (
    <VaulDrawer.Root
      open={!!target}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 z-[350] bg-black/60 md:hidden" />
        <VaulDrawer.Content className="fixed inset-x-0 bottom-0 z-[360] rounded-t-[28px] border border-white/10 bg-[#12131a] px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-24px_80px_rgba(0,0,0,0.72)] outline-none md:hidden">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/15" />
          <div className="mb-4 rounded-2xl border border-white/8 bg-[#181a22] px-3 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-text-dim">
              space actions
            </div>
            <div className="mt-1 text-lg font-semibold text-text">
              {target?.spaceName ?? "스페이스 액션"}
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-2xl border border-white/8 bg-[#20232d] px-4 py-3 text-left text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:bg-[#262a36]"
              onClick={() => {
                if (!target) return;
                onOpenSpaceSettings(target.spaceId);
              }}
            >
              <Users size={16} />
              스페이스 설정
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-2xl border border-white/8 bg-[#20232d] px-4 py-3 text-left text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:bg-[#262a36]"
              onClick={() => {
                if (!target) return;
                onRename(target);
              }}
            >
              <Pencil size={16} />
              이름 변경
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-2xl border border-red/40 bg-[#3a1218] px-4 py-3 text-left text-sm font-semibold text-[#ffb4bf] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors hover:bg-[#47161d]"
              onClick={() => {
                if (!target) return;
                onDelete(target);
              }}
            >
              <span>🗑</span>
              스페이스 삭제
            </button>
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}

interface StudentManagementSpaceContextMenuProps {
  contextMenu: SpaceContextMenuState;
  contextMenuRef: RefObject<HTMLDivElement | null>;
  renamingSpaceId: string | null;
  deletingSpaceId: string | null;
  onRename: (target: SpaceDialogTarget) => void;
  onDelete: (target: SpaceDialogTarget) => void;
}

export function StudentManagementSpaceContextMenu({
  contextMenu,
  contextMenuRef,
  renamingSpaceId,
  deletingSpaceId,
  onRename,
  onDelete,
}: StudentManagementSpaceContextMenuProps) {
  if (!contextMenu) return null;

  return (
    <div
      ref={contextMenuRef}
      className="fixed min-w-[168px] rounded-md border border-border-light bg-surface-3 py-1 shadow-[0_12px_32px_rgba(0,0,0,0.42)] z-[320]"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 bg-transparent border-none text-left text-[12px] font-medium text-text cursor-pointer hover:bg-surface-4 disabled:opacity-50"
        onClick={() => {
          onRename({
            spaceId: contextMenu.spaceId,
            spaceName: contextMenu.spaceName,
          });
        }}
        disabled={renamingSpaceId === contextMenu.spaceId}
      >
        <Pencil size={12} />
        {renamingSpaceId === contextMenu.spaceId
          ? "이름 변경 중..."
          : "이름 변경"}
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 bg-transparent border-none text-left text-[12px] font-medium text-red cursor-pointer hover:bg-surface-4 disabled:opacity-50"
        onClick={() => {
          onDelete({
            spaceId: contextMenu.spaceId,
            spaceName: contextMenu.spaceName,
          });
        }}
        disabled={deletingSpaceId === contextMenu.spaceId}
      >
        <span>🗑</span>
        {deletingSpaceId === contextMenu.spaceId
          ? "삭제 중..."
          : "스페이스 삭제"}
      </button>
    </div>
  );
}

interface StudentManagementRenameSpaceDialogProps {
  target: SpaceDialogTarget | null;
  renameValue: string;
  renamingSpaceId: string | null;
  onChangeRenameValue: (value: string) => void;
  onClose: () => void;
  onConfirm: (spaceId: string, currentName: string) => void;
}

export function StudentManagementRenameSpaceDialog({
  target,
  renameValue,
  renamingSpaceId,
  onChangeRenameValue,
  onClose,
  onConfirm,
}: StudentManagementRenameSpaceDialogProps) {
  if (!target) return null;

  return (
    <div
      className="fixed inset-0 z-[330] flex items-center justify-center bg-[rgba(0,0,0,0.62)] p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !renamingSpaceId) {
          onClose();
        }
      }}
    >
      <div className="flex w-full max-w-[460px] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="border-b border-border px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-dim">
            스페이스 이름 변경
          </p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-text">
            이름을 다시 정리합니다
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
            수강생 목록과 상단 헤더에 바로 반영됩니다. 너무 긴 이름보다는 빠르게
            찾을 수 있는 기수/트랙 중심 이름이 좋습니다.
          </p>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="rounded-xl border border-border bg-surface-2/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-dim">
              현재 이름
            </p>
            <p className="mt-1 text-sm font-semibold text-text">
              {target.spaceName}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[12px] font-medium text-text-secondary">
              새 스페이스 이름
            </label>
            <input
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-text-dim focus:border-accent-border"
              placeholder="예: 풀스택 부트캠프 7기"
              value={renameValue}
              onChange={(event) => onChangeRenameValue(event.target.value)}
              autoFocus
              maxLength={100}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            className="rounded-lg border border-border bg-surface-3 px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-border-light hover:bg-surface-4 hover:text-text disabled:opacity-50"
            onClick={onClose}
            disabled={renamingSpaceId === target.spaceId}
          >
            취소
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onConfirm(target.spaceId, target.spaceName)}
            disabled={renamingSpaceId === target.spaceId || !renameValue.trim()}
          >
            <Pencil size={14} />
            {renamingSpaceId === target.spaceId ? "변경 중..." : "이름 변경"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface StudentManagementDeleteSpaceDialogProps {
  target: SpaceDialogTarget | null;
  deletingSpaceId: string | null;
  onClose: () => void;
  onConfirm: (spaceId: string) => void;
}

export function StudentManagementDeleteSpaceDialog({
  target,
  deletingSpaceId,
  onClose,
  onConfirm,
}: StudentManagementDeleteSpaceDialogProps) {
  if (!target) return null;

  return (
    <div
      className="fixed inset-0 z-[330] flex items-center justify-center bg-[rgba(0,0,0,0.62)] p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !deletingSpaceId) {
          onClose();
        }
      }}
    >
      <div className="flex w-full max-w-[460px] flex-col overflow-hidden rounded-2xl border border-red/20 bg-surface shadow-2xl">
        <div className="border-b border-border px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red/80">
            스페이스 삭제
          </p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-text">
            이 스페이스를 삭제할까요?
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
            <span className="font-semibold text-text">{target.spaceName}</span>
            과 연결된 수강생 데이터도 함께 삭제됩니다. 이 작업은 되돌릴 수
            없습니다.
          </p>
        </div>

        <div className="space-y-3 px-5 py-5">
          <div className="rounded-xl border border-red/20 bg-red/10 px-4 py-3 text-[13px] leading-relaxed text-red">
            운영 중인 스페이스라면 삭제 전에 CSV/엑셀 내보내기로 먼저 백업하는
            것을 권장합니다.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            className="rounded-lg border border-border bg-surface-3 px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-border-light hover:bg-surface-4 hover:text-text disabled:opacity-50"
            onClick={onClose}
            disabled={deletingSpaceId === target.spaceId}
          >
            취소
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-red px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onConfirm(target.spaceId)}
            disabled={deletingSpaceId === target.spaceId}
          >
            <span>🗑</span>
            {deletingSpaceId === target.spaceId ? "삭제 중..." : "삭제하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
