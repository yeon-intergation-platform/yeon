"use client";

import { ArrowLeft } from "lucide-react";
import type { useCloudImportWorkspaceSplit } from "../hooks/use-cloud-import-workspace-split";
import type { ImportHook } from "../types";
import { FilePreview } from "./file-preview";
import { ImportRightPanel } from "./import-right-panel";

type CloudImportWorkspaceSplit = ReturnType<
  typeof useCloudImportWorkspaceSplit
>;

interface CloudImportPreviewWorkspaceProps {
  expanded: boolean;
  hook: ImportHook;
  workspaceSplit: CloudImportWorkspaceSplit;
  onClose: () => void;
}

export function CloudImportPreviewWorkspace({
  expanded,
  hook,
  workspaceSplit,
  onClose,
}: CloudImportPreviewWorkspaceProps) {
  const reviewPaneStyle = workspaceSplit.getReviewPaneStyle(
    Boolean(hook.editablePreview)
  );

  if (!hook.selectedFile || !hook.fileProxyUrl) {
    return null;
  }

  return (
    <div
      ref={expanded ? workspaceSplit.previewWorkspaceRef : undefined}
      className={`flex min-h-0 min-w-0 flex-1 overflow-hidden ${workspaceSplit.expandedPreviewShellClassName}`}
      style={workspaceSplit.expandedPreviewShellStyle}
    >
      <div
        className={workspaceSplit.previewPaneClassName}
        style={workspaceSplit.previewPaneStyle}
      >
        <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-border bg-surface px-3.5 py-2.5">
          <button
            type="button"
            className="flex flex-shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-[5px] border border-border bg-transparent px-2 py-1 text-xs font-medium text-text-secondary transition-[background,color] duration-[120ms] hover:bg-[var(--surface3)] hover:text-text"
            onClick={hook.deselectFile}
          >
            <ArrowLeft size={13} />
            목록으로
          </button>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-text">
            {hook.selectedFile.name}
          </span>
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden p-0">
          <FilePreview
            uri={hook.fileProxyUrl}
            mimeType={hook.selectedFile.mimeType ?? ""}
            fileName={hook.selectedFile.name}
          />
        </div>
      </div>

      <CloudImportPreviewSeparators
        expanded={expanded}
        workspaceSplit={workspaceSplit}
      />

      <div
        className={`flex min-h-0 flex-col overflow-hidden bg-surface ${workspaceSplit.expandedReviewPaneClassName}`}
        style={reviewPaneStyle}
      >
        <ImportRightPanel hook={hook} onClose={onClose} />
      </div>
    </div>
  );
}

function CloudImportPreviewSeparators({
  expanded,
  workspaceSplit,
}: {
  expanded: boolean;
  workspaceSplit: CloudImportWorkspaceSplit;
}) {
  return (
    <>
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
          className={`hidden cursor-col-resize transition-colors duration-150 lg:flex lg:min-h-0 lg:items-stretch lg:justify-center ${workspaceSplit.isDesktopSplitDragging ? "bg-accent-border" : "bg-border hover:bg-accent-border"}`}
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
    </>
  );
}
