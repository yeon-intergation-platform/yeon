"use client";

import { FileClock, RotateCcw, Trash2, X } from "lucide-react";

import {
  formatUpdatedAt,
  getDraftFileExtensionLabel,
  getDraftRowSummary,
  getDraftStatusBadgeClass,
  getDraftStatusLabel,
} from "../cloud-import-draft-display";
import type { useSavedImportDraftsModal } from "../hooks/use-saved-import-drafts-modal";

type CloudImportSavedDraftsModalState = ReturnType<
  typeof useSavedImportDraftsModal
>;

type CloudImportSavedDraftsModalProps = {
  modal: CloudImportSavedDraftsModalState;
};

export function CloudImportSavedDraftsModal({
  modal,
}: CloudImportSavedDraftsModalProps) {
  const isDraftsLoading = modal.isLoading;

  if (!modal.isOpen) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-40 flex items-start justify-center bg-[rgba(0,0,0,0.56)] p-4 md:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          modal.close();
        }
      }}
    >
      <div className="flex max-h-full w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-dim">
              저장된 가져오기 작업
            </p>
            <p className="m-0 mt-1 text-[12px] leading-relaxed text-text-secondary">
              최근 초안을 다시 열거나 필요 없는 작업을 정리할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="shrink-0 rounded-[6px] border border-border bg-transparent px-2.5 py-1 text-[12px] font-medium text-text-secondary transition-colors hover:bg-surface-3 hover:text-text disabled:cursor-wait disabled:opacity-70 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
              onClick={() => {
                void modal.refresh();
              }}
              disabled={modal.isRefreshPending}
            >
              {modal.shouldShowRefreshLoading ? "새로고침 중..." : "새로고침"}
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-transparent text-text-dim transition-colors hover:border-border hover:bg-surface-3 hover:text-text"
              onClick={() => modal.close()}
              aria-label="저장된 가져오기 작업 닫기"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto px-5 py-4">
          {isDraftsLoading ? (
            <div className="rounded-lg border border-border bg-surface px-3 py-3 text-[12px] text-text-dim">
              가져오기 작업을 불러오는 중...
            </div>
          ) : modal.errorMessage ? (
            <div className="rounded-lg border border-red/20 bg-red/10 px-3 py-3 text-[12px] text-red">
              {modal.errorMessage}
            </div>
          ) : modal.drafts.length > 0 ? (
            <div className="grid gap-3">
              {modal.drafts.map((draft) => {
                const isDeletingDraft = modal.deletingDraftIds.includes(
                  draft.id
                );
                const shouldShowDeletingDraftLoading =
                  modal.visibleDeletingDraftIds.includes(draft.id);

                return (
                  <div
                    key={draft.id}
                    className="relative overflow-hidden rounded-2xl border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(129,140,248,0.35),transparent)]" />
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent-border bg-accent-dim/70 text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                        <FileClock size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-start justify-between gap-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="m-0 min-w-0 flex-1 truncate text-[14px] font-semibold tracking-[-0.01em] text-text">
                                {draft.selectedFile.name}
                              </p>
                              <span className="hidden shrink-0 rounded-full border border-border bg-surface-2/80 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-text-dim sm:inline-flex">
                                {getDraftFileExtensionLabel(
                                  draft.selectedFile.name
                                )}
                              </span>
                            </div>
                            <p className="m-0 mt-1 text-[11px] text-text-dim">
                              최근 저장 {formatUpdatedAt(draft.updatedAt)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex min-h-7 shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.04em] ${getDraftStatusBadgeClass(draft.status)}`}
                          >
                            {getDraftStatusLabel(draft.status)}
                          </span>
                        </div>
                        <p className="m-0 mt-3 text-[12px] leading-relaxed text-text-secondary line-clamp-2">
                          {getDraftRowSummary(draft)}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(129,140,248,0.22)] transition-[opacity,box-shadow,background-color] duration-150 hover:bg-[var(--accent-hover)] hover:opacity-100 hover:shadow-[0_14px_28px_rgba(129,140,248,0.28)]"
                            onClick={() => {
                              void modal.openDraft(draft.id);
                            }}
                          >
                            <RotateCcw size={12} />
                            이어서 보기
                          </button>
                          <button
                            type="button"
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-border bg-surface-2/70 px-3.5 py-2 text-[12px] font-medium text-text-secondary transition-[background-color,border-color,color,opacity] duration-150 hover:border-border-light hover:bg-surface-3 hover:text-text disabled:cursor-wait disabled:opacity-70 disabled:hover:border-border disabled:hover:bg-surface-2/70 disabled:hover:text-text-secondary"
                            onClick={() => {
                              void modal.discardDraft(draft.id);
                            }}
                            disabled={isDeletingDraft}
                          >
                            <Trash2 size={12} />
                            {shouldShowDeletingDraftLoading
                              ? "삭제 중..."
                              : "삭제"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface px-3 py-3 text-[12px] text-text-dim">
              아직 저장된 가져오기 작업이 없습니다. 새 파일을 선택하거나
              클라우드에서 가져오기를 시작해 보세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
