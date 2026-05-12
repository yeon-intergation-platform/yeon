"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { Upload } from "lucide-react";
import {
  DEFAULT_CLOUD_PROVIDER,
  getCloudProviderLabel,
} from "../cloud-provider-config";
import type { CloudProvider } from "../types";
import type { ImportCommitResult } from "../types";
import { useCloudImport } from "../hooks/use-cloud-import";
import { useLocalImport } from "../hooks/use-local-import";
import { useSavedImportDraftsModal } from "../hooks/use-saved-import-drafts-modal";
import { useCloudImportWorkspaceSplit } from "../hooks/use-cloud-import-workspace-split";
import { CloudImportSavedDraftsModal } from "./cloud-import-saved-drafts-modal";
import { CloudImportEntryHeader } from "./cloud-import-entry-header";
import { CloudImportFileBrowser } from "./cloud-import-file-browser";
import { CloudImportPreviewWorkspace } from "./cloud-import-preview-workspace";

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
            <CloudImportEntryHeader
              localDraftCount={localDrafts.length}
              onOpenSavedDrafts={openSavedDrafts}
              onOpenFilePicker={openFilePicker}
            />
          ) : null}

          <CloudImportSavedDraftsModal modal={savedDraftsModal} />
        </>
      )}

      {/* 로컬 프리뷰 모드 */}
      {isLocalMode && localImport.fileProxyUrl ? (
        <CloudImportPreviewWorkspace
          expanded={expanded}
          hook={localImport}
          workspaceSplit={workspaceSplit}
          onClose={onClose}
        />
      ) : hasSelectedFile && activeHook.fileProxyUrl ? (
        <CloudImportPreviewWorkspace
          expanded={expanded}
          hook={activeHook}
          workspaceSplit={workspaceSplit}
          onClose={onClose}
        />
      ) : (
        <CloudImportFileBrowser
          activeProvider={activeProvider}
          activeProviderLabel={activeProviderLabel}
          activeHook={activeHook}
          onSwitchProvider={switchProvider}
        />
      )}
    </div>
  );
}
