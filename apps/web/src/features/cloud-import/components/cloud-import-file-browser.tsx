"use client";

import {
  ArrowLeft,
  ChevronRight,
  CloudCog,
  LayoutGrid,
  List,
  Loader2,
} from "lucide-react";
import {
  CLOUD_PROVIDER_ORDER,
  getCloudProviderLabel,
} from "../cloud-provider-config";
import type { useCloudImport } from "../hooks/use-cloud-import";
import type { CloudProvider } from "../types";
import { FileGrid } from "./cloud-import-file-grid";

type CloudImportHook = ReturnType<typeof useCloudImport>;

interface CloudImportFileBrowserProps {
  activeProvider: CloudProvider;
  activeProviderLabel: string;
  activeHook: CloudImportHook;
  onSwitchProvider: (provider: CloudProvider) => void;
}

export function CloudImportFileBrowser({
  activeProvider,
  activeProviderLabel,
  activeHook,
  onSwitchProvider,
}: CloudImportFileBrowserProps) {
  const handleBreadcrumbClick = (index: number) => {
    if (index === activeHook.folderStack.length - 1) return;
    activeHook.navigateToBreadcrumbIndex(index);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <CloudImportProviderTabs
        activeProvider={activeProvider}
        onSwitchProvider={onSwitchProvider}
      />

      {!activeHook.connecting && !activeHook.connected && (
        <CloudImportConnectionPrompt
          activeProviderLabel={activeProviderLabel}
          onConnect={activeHook.connectDrive}
        />
      )}

      {activeHook.connecting && <CloudImportConnectionChecking />}

      {activeHook.connected && !activeHook.connecting && (
        <>
          <CloudImportBrowserToolbar
            activeHook={activeHook}
            onBreadcrumbClick={handleBreadcrumbClick}
          />

          {activeHook.error && (
            <div className="px-5">
              <div className="mb-3 rounded-[6px] bg-[rgba(239,68,68,0.1)] px-3 py-2.5 text-[13px] text-red">
                {activeHook.error}
              </div>
            </div>
          )}

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
  );
}

function CloudImportProviderTabs({
  activeProvider,
  onSwitchProvider,
}: {
  activeProvider: CloudProvider;
  onSwitchProvider: (provider: CloudProvider) => void;
}) {
  return (
    <div className="flex flex-shrink-0 gap-0 border-b border-border">
      {CLOUD_PROVIDER_ORDER.map((provider) => (
        <button
          key={provider}
          className={`flex-1 cursor-pointer border-0 border-b-2 bg-transparent px-4 py-2.5 text-[13px] font-medium transition-[color,border-color] duration-150 ${
            activeProvider === provider
              ? "border-b-accent font-semibold text-accent"
              : "border-b-transparent text-text-dim hover:text-text"
          }`}
          onClick={() => onSwitchProvider(provider)}
          type="button"
        >
          {getCloudProviderLabel(provider)}
        </button>
      ))}
    </div>
  );
}

function CloudImportConnectionPrompt({
  activeProviderLabel,
  onConnect,
}: {
  activeProviderLabel: string;
  onConnect: () => void;
}) {
  return (
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
        className="flex cursor-pointer items-center gap-1.5 rounded-[6px] border-0 bg-accent px-4 py-2 text-[13px] font-medium text-white transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onConnect}
        type="button"
      >
        연결하기
      </button>
    </div>
  );
}

function CloudImportConnectionChecking() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center gap-2 py-10 text-[13px] text-text-dim">
      <Loader2 size={20} className="animate-spin" />
      <span>연결 상태 확인 중...</span>
    </div>
  );
}

function CloudImportBrowserToolbar({
  activeHook,
  onBreadcrumbClick,
}: {
  activeHook: CloudImportHook;
  onBreadcrumbClick: (index: number) => void;
}) {
  return (
    <div
      className="scrollbar-subtle flex flex-shrink-0 items-center overflow-x-auto border-b border-border px-5 py-2.5 text-[13px] text-text-dim"
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
            className="cursor-pointer whitespace-nowrap rounded border-0 bg-transparent px-1 py-0.5 text-[13px] text-text-secondary hover:bg-[var(--surface3)] hover:text-text"
            onClick={activeHook.navigateBack}
            type="button"
            style={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            <ArrowLeft size={14} />
          </button>
        )}
        {activeHook.folderStack.map((entry, index) => (
          <span key={index} style={{ display: "flex", alignItems: "center" }}>
            {index > 0 && (
              <ChevronRight size={12} className="flex-shrink-0 text-text-dim" />
            )}
            <button
              className="cursor-pointer whitespace-nowrap rounded border-0 bg-transparent px-1 py-0.5 text-[13px] text-text-secondary hover:bg-[var(--surface3)] hover:text-text"
              onClick={() => onBreadcrumbClick(index)}
              type="button"
              style={{
                fontWeight:
                  index === activeHook.folderStack.length - 1 ? 600 : 400,
              }}
            >
              {entry.name}
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        <CloudImportViewModeButton
          active={activeHook.viewMode === "grid"}
          title="그리드 보기"
          onClick={() => activeHook.setViewMode("grid")}
        >
          <LayoutGrid size={14} />
        </CloudImportViewModeButton>
        <CloudImportViewModeButton
          active={activeHook.viewMode === "list"}
          title="목록 보기"
          onClick={() => activeHook.setViewMode("list")}
        >
          <List size={14} />
        </CloudImportViewModeButton>
      </div>
    </div>
  );
}

function CloudImportViewModeButton({
  active,
  title,
  onClick,
  children,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "4px 6px",
        border: "1px solid var(--border)",
        borderRadius: 4,
        background: active ? "var(--accent)" : "transparent",
        color: active ? "#fff" : "var(--text-dim)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
      }}
      title={title}
    >
      {children}
    </button>
  );
}
