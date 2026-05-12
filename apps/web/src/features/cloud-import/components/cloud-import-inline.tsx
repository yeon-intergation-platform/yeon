"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  ArrowLeft,
  ChevronRight,
  CloudCog,
  Download,
  FileClock,
  LayoutGrid,
  List,
  Loader2,
  Upload,
} from "lucide-react";
import {
  CLOUD_PROVIDER_ORDER,
  DEFAULT_CLOUD_PROVIDER,
  getCloudProviderLabel,
} from "../cloud-provider-config";
import type { CloudProvider } from "../types";
import type { ImportCommitResult } from "../types";
import { useCloudImport } from "../hooks/use-cloud-import";
import { useLocalImport } from "../hooks/use-local-import";
import { useSavedImportDraftsModal } from "../hooks/use-saved-import-drafts-modal";
import { useCloudImportWorkspaceSplit } from "../hooks/use-cloud-import-workspace-split";
import { FilePreview } from "./file-preview";
import { FileGrid } from "./cloud-import-file-grid";
import { ImportRightPanel } from "./import-right-panel";
import { CloudImportSavedDraftsModal } from "./cloud-import-saved-drafts-modal";
import {
  SPACE_FULL_TEST_DATA,
  SPACE_LITE_TEST_DATA,
} from "@/lib/test-data-downloads";

interface CloudImportInlineProps {
  onClose: () => void;
  onImportComplete: (result: ImportCommitResult) => void;
  onDraftDiscarded?: () => void;
  expanded?: boolean;
  initialLocalDraftId?: string | null;
  onDraftIdChange?: (draftId: string | null) => void;
  hideEntryHeader?: boolean;
  onEntryControlsChange?: (controls: CloudImportEntryControls | null) => void;
  onWorkspaceModeChange?: (isWorkspaceMode: boolean) => void;
}

export interface CloudImportEntryControls {
  localDraftCount: number;
  openSavedDrafts: () => void;
  openFilePicker: () => void;
}

export function CloudImportInline({
  onClose,
  onImportComplete,
  onDraftDiscarded,
  expanded = false,
  initialLocalDraftId = null,
  onDraftIdChange,
  hideEntryHeader = false,
  onEntryControlsChange,
  onWorkspaceModeChange,
}: CloudImportInlineProps) {
  const [activeProvider, setActiveProvider] = useState<CloudProvider>(
    DEFAULT_CLOUD_PROVIDER
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceSplit = useCloudImportWorkspaceSplit({ expanded });

  const onedrive = useCloudImport("onedrive", onImportComplete);
  const googledrive = useCloudImport("googledrive", onImportComplete);
  const localImport = useLocalImport(
    onImportComplete,
    initialLocalDraftId,
    onDraftDiscarded
  );
  const activeHook = activeProvider === "onedrive" ? onedrive : googledrive;
  const activeProviderLabel = getCloudProviderLabel(activeProvider);
  const savedDraftsModal = useSavedImportDraftsModal({
    localImport,
    onDraftDiscarded,
  });
  const localDrafts = savedDraftsModal.drafts;
  const openSavedDrafts = savedDraftsModal.open;
  const refetchLocalDrafts = savedDraftsModal.refetch;
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  useEffect(() => {
    onEntryControlsChange?.({
      localDraftCount: localDrafts.length,
      openSavedDrafts,
      openFilePicker,
    });

    return () => {
      onEntryControlsChange?.(null);
    };
  }, [
    localDrafts.length,
    onEntryControlsChange,
    openFilePicker,
    openSavedDrafts,
  ]);

  useEffect(() => {
    onDraftIdChange?.(localImport.currentDraftId);
  }, [localImport.currentDraftId, onDraftIdChange]);

  useEffect(() => {
    activeHook.checkStatus();
  }, [activeProvider]);

  useEffect(() => {
    if (
      activeHook.connected &&
      activeHook.files.length === 0 &&
      !activeHook.filesLoading
    ) {
      activeHook.loadFiles();
    }
  }, [activeHook.connected]);

  useEffect(() => {
    if (activeHook.importResult) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeHook.importResult, onClose]);

  useEffect(() => {
    if (localImport.importResult) {
      void refetchLocalDrafts();
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [localImport.importResult, onClose, refetchLocalDrafts]);

  useEffect(() => {
    if (!localImport.currentDraftId) return;
    void refetchLocalDrafts();
  }, [localImport.currentDraftId, refetchLocalDrafts]);

  const switchProvider = (p: CloudProvider) => {
    if (p === activeProvider) return;
    setActiveProvider(p);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === activeHook.folderStack.length - 1) return;
    activeHook.navigateToBreadcrumbIndex(index);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) localImport.selectLocalFile(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) localImport.selectLocalFile(file);
    e.target.value = "";
  };

  const isLocalMode = localImport.selectedFile !== null;
  const hasSelectedFile = activeHook.selectedFile !== null;
  const isWorkspaceMode = isLocalMode || hasSelectedFile;
  const localReviewPaneStyle = workspaceSplit.getReviewPaneStyle(
    Boolean(localImport.editablePreview)
  );
  const cloudReviewPaneStyle = workspaceSplit.getReviewPaneStyle(
    Boolean(activeHook.editablePreview)
  );

  useEffect(() => {
    onWorkspaceModeChange?.(isWorkspaceMode);
  }, [isWorkspaceMode, onWorkspaceModeChange]);

  return (
    <div
      className={`relative flex min-h-0 min-w-0 flex-col bg-background ${expanded ? "h-full w-full flex-1 overflow-hidden" : "h-full overflow-hidden"}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* fullscreen shell owns the available area; child panels own scrolling */}
      {/* 드래그 오버레이 */}
      {isDragging && (
        <div className="absolute inset-0 bg-[rgba(var(--accent-rgb,99,102,241),0.08)] border-2 border-dashed border-accent rounded-xl flex flex-col items-center justify-center gap-2 z-50 text-accent pointer-events-none">
          <Upload size={36} />
          <p className="text-base font-semibold text-accent m-0">
            파일을 놓으세요
          </p>
          <p className="text-xs text-text-dim m-0">
            .xlsx, .xls, .csv, .txt, .pdf, 이미지 파일 지원
          </p>
        </div>
      )}

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.txt,.tsv,.md,.pdf,image/*"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

      {!isWorkspaceMode && (
        <>
          {!hideEntryHeader ? (
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
                        내 컴퓨터의 엑셀, CSV, PDF, 이미지 파일을 바로 올리거나
                        아래 클라우드 드라이브에서 이어서 가져올 수 있습니다.
                        저장한 작업도 같은 흐름에서 다시 열어 검토할 수
                        있습니다.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex min-h-10 shrink-0 items-center gap-1.5 self-start rounded-full border border-border bg-surface/75 px-3 py-2 text-[11px] font-medium text-text-secondary transition-colors hover:border-border-light hover:bg-surface hover:text-text"
                      onClick={openSavedDrafts}
                    >
                      <FileClock size={12} />
                      저장 작업
                      {localDrafts.length > 0 ? (
                        <span className="rounded-full border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-secondary">
                          {localDrafts.length}
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
                        onClick={openFilePicker}
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
          ) : null}

          <CloudImportSavedDraftsModal modal={savedDraftsModal} />
        </>
      )}

      {/* 로컬 프리뷰 모드 */}
      {isLocalMode && localImport.fileProxyUrl ? (
        <div
          ref={expanded ? workspaceSplit.previewWorkspaceRef : undefined}
          className={`flex min-h-0 min-w-0 flex-1 overflow-hidden ${workspaceSplit.expandedPreviewShellClassName}`}
          style={workspaceSplit.expandedPreviewShellStyle}
        >
          <div
            className={workspaceSplit.previewPaneClassName}
            style={workspaceSplit.previewPaneStyle}
          >
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border flex-shrink-0 bg-surface">
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 rounded-[5px] border border-border bg-transparent text-text-secondary text-xs font-medium cursor-pointer whitespace-nowrap flex-shrink-0 transition-[background,color] duration-[120ms] hover:bg-[var(--surface3)] hover:text-text"
                onClick={localImport.deselectFile}
              >
                <ArrowLeft size={13} />
                목록으로
              </button>
              <span className="text-[13px] font-medium text-text overflow-hidden text-ellipsis whitespace-nowrap">
                {localImport.selectedFile?.name}
              </span>
            </div>
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden p-0">
              <FilePreview
                uri={localImport.fileProxyUrl}
                mimeType={localImport.selectedFile?.mimeType ?? ""}
                fileName={localImport.selectedFile?.name ?? ""}
              />
            </div>
          </div>
          {workspaceSplit.isExpandedStackedLayout && (
            <div
              role="separator"
              aria-orientation="horizontal"
              aria-label="가져오기 레이아웃 높이 조절"
              tabIndex={0}
              className="group flex h-5 shrink-0 cursor-row-resize items-center justify-center bg-transparent"
              onPointerDown={workspaceSplit.startStackedSplitResize}
              onDoubleClick={workspaceSplit.resetStackedSplit}
              onKeyDown={(event) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  workspaceSplit.nudgeStackedSplit(-0.02);
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  workspaceSplit.nudgeStackedSplit(0.02);
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  workspaceSplit.setStackedSplitToMin();
                }
                if (event.key === "End") {
                  event.preventDefault();
                  workspaceSplit.setStackedSplitToMax();
                }
              }}
            >
              <span
                className={`h-1.5 w-14 rounded-full transition-colors ${workspaceSplit.isStackedSplitDragging ? "bg-accent-border" : "bg-border group-hover:bg-accent-border"}`}
              />
            </div>
          )}
          {expanded && (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="가져오기 레이아웃 크기 조절"
              tabIndex={0}
              className={`hidden lg:flex lg:min-h-0 lg:items-stretch lg:justify-center cursor-col-resize transition-colors duration-150 ${workspaceSplit.isDesktopSplitDragging ? "bg-accent-border" : "bg-border hover:bg-accent-border"}`}
              onPointerDown={workspaceSplit.startDesktopSplitResize}
              onDoubleClick={workspaceSplit.resetDesktopSplit}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  workspaceSplit.nudgeDesktopSplit(-0.02);
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  workspaceSplit.nudgeDesktopSplit(0.02);
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  workspaceSplit.setDesktopSplitToMin();
                }
                if (event.key === "End") {
                  event.preventDefault();
                  workspaceSplit.setDesktopSplitToMax();
                }
              }}
            >
              <div className="my-3 w-px rounded-full bg-[rgba(255,255,255,0.18)]" />
            </div>
          )}
          <div
            className={`flex min-h-0 flex-col overflow-hidden bg-surface ${workspaceSplit.expandedReviewPaneClassName}`}
            style={localReviewPaneStyle}
          >
            <ImportRightPanel hook={localImport} onClose={onClose} />
          </div>
        </div>
      ) : hasSelectedFile && activeHook.fileProxyUrl ? (
        /* 클라우드 프리뷰 모드 */
        <div
          ref={expanded ? workspaceSplit.previewWorkspaceRef : undefined}
          className={`flex min-h-0 min-w-0 flex-1 overflow-hidden ${workspaceSplit.expandedPreviewShellClassName}`}
          style={workspaceSplit.expandedPreviewShellStyle}
        >
          <div
            className={workspaceSplit.previewPaneClassName}
            style={workspaceSplit.previewPaneStyle}
          >
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border flex-shrink-0 bg-surface">
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 rounded-[5px] border border-border bg-transparent text-text-secondary text-xs font-medium cursor-pointer whitespace-nowrap flex-shrink-0 transition-[background,color] duration-[120ms] hover:bg-[var(--surface3)] hover:text-text"
                onClick={activeHook.deselectFile}
              >
                <ArrowLeft size={13} />
                목록으로
              </button>
              <span className="text-[13px] font-medium text-text overflow-hidden text-ellipsis whitespace-nowrap">
                {activeHook.selectedFile?.name}
              </span>
            </div>
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden p-0">
              <FilePreview
                uri={activeHook.fileProxyUrl}
                mimeType={activeHook.selectedFile?.mimeType ?? ""}
                fileName={activeHook.selectedFile?.name ?? ""}
              />
            </div>
          </div>
          {workspaceSplit.isExpandedStackedLayout && (
            <div
              role="separator"
              aria-orientation="horizontal"
              aria-label="가져오기 레이아웃 높이 조절"
              tabIndex={0}
              className="group flex h-5 shrink-0 cursor-row-resize items-center justify-center bg-transparent"
              onPointerDown={workspaceSplit.startStackedSplitResize}
              onDoubleClick={workspaceSplit.resetStackedSplit}
              onKeyDown={(event) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  workspaceSplit.nudgeStackedSplit(-0.02);
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  workspaceSplit.nudgeStackedSplit(0.02);
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  workspaceSplit.setStackedSplitToMin();
                }
                if (event.key === "End") {
                  event.preventDefault();
                  workspaceSplit.setStackedSplitToMax();
                }
              }}
            >
              <span
                className={`h-1.5 w-14 rounded-full transition-colors ${workspaceSplit.isStackedSplitDragging ? "bg-accent-border" : "bg-border group-hover:bg-accent-border"}`}
              />
            </div>
          )}
          {expanded && (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="가져오기 레이아웃 크기 조절"
              tabIndex={0}
              className={`hidden lg:flex lg:min-h-0 lg:items-stretch lg:justify-center cursor-col-resize transition-colors duration-150 ${workspaceSplit.isDesktopSplitDragging ? "bg-accent-border" : "bg-border hover:bg-accent-border"}`}
              onPointerDown={workspaceSplit.startDesktopSplitResize}
              onDoubleClick={workspaceSplit.resetDesktopSplit}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  workspaceSplit.nudgeDesktopSplit(-0.02);
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  workspaceSplit.nudgeDesktopSplit(0.02);
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  workspaceSplit.setDesktopSplitToMin();
                }
                if (event.key === "End") {
                  event.preventDefault();
                  workspaceSplit.setDesktopSplitToMax();
                }
              }}
            >
              <div className="my-3 w-px rounded-full bg-[rgba(255,255,255,0.18)]" />
            </div>
          )}
          <div
            className={`flex min-h-0 flex-col overflow-hidden bg-surface ${workspaceSplit.expandedReviewPaneClassName}`}
            style={cloudReviewPaneStyle}
          >
            <ImportRightPanel hook={activeHook} onClose={onClose} />
          </div>
        </div>
      ) : (
        /* 파일 브라우저 모드 */
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Provider 탭 */}
          <div className="flex gap-0 border-b border-border flex-shrink-0">
            {CLOUD_PROVIDER_ORDER.map((provider) => (
              <button
                key={provider}
                className={`flex-1 px-4 py-2.5 text-[13px] font-medium bg-transparent border-0 border-b-2 cursor-pointer transition-[color,border-color] duration-150 ${
                  activeProvider === provider
                    ? "text-accent border-b-accent font-semibold"
                    : "text-text-dim border-b-transparent hover:text-text"
                }`}
                onClick={() => switchProvider(provider)}
                type="button"
              >
                {getCloudProviderLabel(provider)}
              </button>
            ))}
          </div>

          {/* OAuth 미연결 */}
          {!activeHook.connecting && !activeHook.connected && (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-10 text-center">
              <CloudCog
                size={32}
                style={{ color: "var(--text-dim)", marginBottom: 8 }}
              />
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 4,
                }}
              >
                {activeProviderLabel} 연결이 필요합니다
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-dim)",
                  marginBottom: 16,
                }}
              >
                클라우드 드라이브를 연결하면 파일을 바로 가져올 수 있습니다.
              </p>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-[13px] font-medium border-0 bg-accent text-white cursor-pointer transition-opacity duration-150 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={activeHook.connectDrive}
                type="button"
              >
                연결하기
              </button>
            </div>
          )}

          {/* 연결 확인 중 */}
          {activeHook.connecting && (
            <div className="flex min-h-0 flex-1 items-center justify-center gap-2 py-10 text-text-dim text-[13px]">
              <Loader2 size={20} className="animate-spin" />
              <span>연결 상태 확인 중...</span>
            </div>
          )}

          {/* 연결 완료: 파일 브라우저 */}
          {activeHook.connected && !activeHook.connecting && (
            <>
              {/* 브레드크럼 */}
              <div
                className="scrollbar-subtle flex items-center px-5 py-2.5 text-[13px] text-text-dim border-b border-border flex-shrink-0 overflow-x-auto"
                style={{ justifyContent: "space-between" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    overflow: "hidden",
                  }}
                >
                  {activeHook.folderStack.length > 1 && (
                    <button
                      className="bg-transparent border-0 px-1 py-0.5 rounded text-[13px] text-text-secondary cursor-pointer whitespace-nowrap hover:bg-[var(--surface3)] hover:text-text"
                      onClick={activeHook.navigateBack}
                      type="button"
                      style={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                      <ArrowLeft size={14} />
                    </button>
                  )}
                  {activeHook.folderStack.map((entry, i) => (
                    <span
                      key={i}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      {i > 0 && (
                        <ChevronRight
                          size={12}
                          className="text-text-dim flex-shrink-0"
                        />
                      )}
                      <button
                        className="bg-transparent border-0 px-1 py-0.5 rounded text-[13px] text-text-secondary cursor-pointer whitespace-nowrap hover:bg-[var(--surface3)] hover:text-text"
                        onClick={() => handleBreadcrumbClick(i)}
                        type="button"
                        style={{
                          fontWeight:
                            i === activeHook.folderStack.length - 1 ? 600 : 400,
                        }}
                      >
                        {entry.name}
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => activeHook.setViewMode("grid")}
                    style={{
                      padding: "4px 6px",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      background:
                        activeHook.viewMode === "grid"
                          ? "var(--accent)"
                          : "transparent",
                      color:
                        activeHook.viewMode === "grid"
                          ? "#fff"
                          : "var(--text-dim)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="그리드 보기"
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => activeHook.setViewMode("list")}
                    style={{
                      padding: "4px 6px",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      background:
                        activeHook.viewMode === "list"
                          ? "var(--accent)"
                          : "transparent",
                      color:
                        activeHook.viewMode === "list"
                          ? "#fff"
                          : "var(--text-dim)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="목록 보기"
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>

              {/* 에러 */}
              {activeHook.error && (
                <div className="px-5">
                  <div className="px-3 py-2.5 rounded-[6px] bg-[rgba(239,68,68,0.1)] text-red text-[13px] mb-3">
                    {activeHook.error}
                  </div>
                </div>
              )}

              {/* 파일 그리드 */}
              <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-surface">
                <div className="scrollbar-subtle min-h-0 min-w-0 flex-1 overflow-auto px-5 py-4">
                  <FileGrid
                    files={activeHook.files}
                    loading={activeHook.filesLoading}
                    viewMode={activeHook.viewMode}
                    onSelectFile={activeHook.selectFileForPreview}
                    onNavigateFolder={activeHook.navigateToFolder}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
