import { Download, FileClock, Upload } from "lucide-react";
import {
  SPACE_FULL_TEST_DATA,
  SPACE_LITE_TEST_DATA,
} from "@/lib/test-data-downloads";

type CloudImportEntryHeaderProps = {
  localDraftCount: number;
  onOpenSavedDrafts: () => void;
  onOpenFilePicker: () => void;
};

export function CloudImportEntryHeader({
  localDraftCount,
  onOpenSavedDrafts,
  onOpenFilePicker,
}: CloudImportEntryHeaderProps) {
  return (
    <div className="border-b border-border bg-surface-2/30 px-4 py-4 sm:px-5">
      <div className="relative overflow-hidden rounded-2xl border border-border-light bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(232,99,10,0.055))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-5 sm:py-5">
        <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(232,99,10,0.28),transparent)]" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-dim">
                새 파일 가져오기
              </p>
              <h2 className="m-0 mt-2 text-[18px] font-semibold tracking-[-0.02em] text-text">
                파일 업로드로 스페이스 초안 시작하기
              </h2>
              <p className="m-0 mt-2 max-w-[760px] text-[13px] leading-6 text-text-secondary">
                내 컴퓨터의 엑셀, CSV, PDF, 이미지 파일을 바로 올리거나 아래
                클라우드 드라이브에서 이어서 가져올 수 있습니다. 저장한 작업도
                같은 흐름에서 다시 열어 검토할 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 self-start rounded-full border border-border bg-surface/75 px-3 py-2 text-[11px] font-medium text-text-secondary transition-colors hover:border-border-light hover:bg-surface hover:text-text"
              onClick={onOpenSavedDrafts}
            >
              <FileClock size={12} />
              저장 작업
              {localDraftCount > 0 ? (
                <span className="rounded-full border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-secondary">
                  {localDraftCount}
                </span>
              ) : null}
            </button>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/80 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-dim">
              <span className="rounded-full border border-border bg-surface/70 px-2.5 py-1">
                로컬 업로드 우선
              </span>
              <span>지원 형식: 엑셀, CSV, PDF, 이미지</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-accent-border bg-accent px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(232,99,10,0.18)] transition-[background-color,box-shadow] duration-150 hover:bg-[var(--accent-hover)] hover:shadow-[0_14px_28px_rgba(232,99,10,0.22)]"
                onClick={onOpenFilePicker}
                type="button"
                title="내 컴퓨터에서 파일 선택"
              >
                <Upload size={16} />
                <span>내 컴퓨터에서 파일 선택</span>
              </button>
              <a
                href={SPACE_LITE_TEST_DATA.href}
                download={SPACE_LITE_TEST_DATA.downloadName}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-light bg-surface px-4 py-2.5 text-[13px] font-semibold text-text transition-colors hover:border-accent-border hover:bg-surface-3 hover:text-text"
              >
                <Download size={16} />
                {SPACE_LITE_TEST_DATA.label}
              </a>
              <a
                href={SPACE_FULL_TEST_DATA.href}
                download={SPACE_FULL_TEST_DATA.downloadName}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-light bg-surface px-4 py-2.5 text-[13px] font-semibold text-text transition-colors hover:border-accent-border hover:bg-surface-3 hover:text-text"
              >
                <Download size={16} />
                {SPACE_FULL_TEST_DATA.label}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
