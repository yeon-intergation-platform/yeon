import {
  File,
  FileSpreadsheet,
  FileText,
  Folder,
  ImageIcon,
  Loader2,
} from "lucide-react";

import { isSelectableKind } from "../file-kind";
import type { DriveFile } from "../types";

function formatSize(bytes: number): string {
  if (bytes === 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface FileGridProps {
  files: DriveFile[];
  loading: boolean;
  viewMode: "grid" | "list";
  onSelectFile: (file: DriveFile) => void;
  onNavigateFolder: (id: string, name: string) => void;
}

type FileKind = DriveFile["fileKind"];

function getListRowClasses(fileKind: FileKind): string {
  switch (fileKind) {
    case "folder":
      return "text-text-secondary cursor-pointer opacity-100 hover:bg-accent-dim hover:text-accent";
    case "spreadsheet":
      return "text-text cursor-pointer opacity-100 hover:bg-[rgba(34,197,94,0.06)] hover:text-green";
    case "csv":
      return "text-text cursor-pointer opacity-100 hover:bg-[rgba(34,197,94,0.06)] hover:text-green";
    case "txt":
      return "text-text cursor-pointer opacity-100 hover:bg-accent-dim hover:text-text-secondary";
    case "pdf":
      return "text-text cursor-pointer opacity-100 hover:bg-[rgba(239,68,68,0.06)] hover:text-red";
    case "image":
      return "text-text cursor-pointer opacity-100 hover:bg-[rgba(6,182,212,0.06)] hover:text-cyan";
    default:
      return "";
  }
}

function getCardClasses(fileKind: FileKind): string {
  switch (fileKind) {
    case "folder":
      return "text-text-secondary cursor-pointer opacity-100 hover:border-accent-border hover:bg-accent-dim hover:text-accent";
    case "spreadsheet":
      return "text-text cursor-pointer opacity-100 hover:border-green hover:bg-[rgba(34,197,94,0.06)]";
    case "csv":
      return "text-text cursor-pointer opacity-100 hover:border-green hover:bg-[rgba(34,197,94,0.06)]";
    case "txt":
      return "text-text cursor-pointer opacity-100 hover:border-accent-border hover:bg-accent-dim";
    case "pdf":
      return "text-text cursor-pointer opacity-100 hover:border-red hover:bg-[rgba(239,68,68,0.06)]";
    case "image":
      return "text-text cursor-pointer opacity-100 hover:border-cyan hover:bg-[rgba(6,182,212,0.06)]";
    default:
      return "";
  }
}

function getIconColor(fileKind: FileKind): string {
  switch (fileKind) {
    case "folder":
      return "text-accent";
    case "spreadsheet":
      return "text-green";
    case "csv":
      return "text-green";
    case "txt":
      return "text-text-secondary";
    case "pdf":
      return "text-red";
    case "image":
      return "text-cyan";
    default:
      return "text-inherit";
  }
}

function FileKindIcon({ file, size }: { file: DriveFile; size: number }) {
  switch (file.fileKind) {
    case "folder":
      return <Folder size={size} />;
    case "spreadsheet":
      return <FileSpreadsheet size={size} />;
    case "csv":
      return <FileSpreadsheet size={size} />;
    case "txt":
      return <FileText size={size} />;
    case "pdf":
      return <FileText size={size} />;
    case "image":
      return <ImageIcon size={size} />;
    default:
      return <File size={size} />;
  }
}

export function FileGrid({
  files,
  loading,
  viewMode,
  onSelectFile,
  onNavigateFolder,
}: FileGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-text-dim text-[13px]">
        <Loader2 size={20} className="animate-spin" />
        <span>파일 목록을 불러오는 중...</span>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-10 text-text-dim text-[13px]">
        파일이 없습니다.
      </div>
    );
  }

  const selectable = (file: DriveFile) => isSelectableKind(file.fileKind);

  if (viewMode === "list") {
    return (
      <ul className="list-none p-0 m-0 flex flex-col gap-0.5">
        {files.map((file) => (
          <li key={file.id}>
            <button
              className={`grid items-center gap-2.5 px-2.5 py-2 rounded-[6px] border-0 bg-transparent text-[13px] w-full text-left transition-[background] duration-[120ms] ${
                !file.isFolder && !selectable(file)
                  ? "text-text-dim cursor-not-allowed opacity-50"
                  : getListRowClasses(file.fileKind)
              }`}
              style={{
                gridTemplateColumns:
                  "20px minmax(100px, 40%) max-content max-content",
              }}
              onClick={() => {
                if (file.isFolder) onNavigateFolder(file.id, file.name);
                else if (selectable(file)) onSelectFile(file);
              }}
              disabled={!file.isFolder && !selectable(file)}
              type="button"
            >
              <span
                className={`flex items-center flex-shrink-0 ${getIconColor(file.fileKind)}`}
              >
                <FileKindIcon file={file} size={16} />
              </span>
              <span className="flex-1 font-medium overflow-hidden text-ellipsis whitespace-nowrap text-text">
                {file.name}
              </span>
              <span className="text-xs text-text-dim whitespace-nowrap flex-shrink-0">
                {file.isFolder ? "폴더" : formatSize(file.size)}
              </span>
              <span className="text-xs text-text-dim whitespace-nowrap flex-shrink-0 min-w-[80px] text-right">
                {formatDate(file.lastModifiedAt)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul
      className="list-none p-0 m-0 grid gap-2"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))" }}
    >
      {files.map((file) => (
        <li key={file.id}>
          <button
            className={`flex flex-col items-start gap-1.5 px-3 pt-3.5 pb-3 rounded-lg border border-border bg-[var(--surface2,var(--surface))] text-[13px] w-full text-left transition-[border-color,background,color] duration-150 ${
              !file.isFolder && !selectable(file)
                ? "text-text-dim cursor-not-allowed opacity-50"
                : getCardClasses(file.fileKind)
            }`}
            onClick={() => {
              if (file.isFolder) {
                onNavigateFolder(file.id, file.name);
              } else if (selectable(file)) {
                onSelectFile(file);
              }
            }}
            disabled={!file.isFolder && !selectable(file)}
            type="button"
            title={
              selectable(file)
                ? "클릭하여 미리보기"
                : file.isFolder
                  ? "폴더 열기"
                  : "지원하지 않는 파일 형식"
            }
          >
            <div className={`flex items-center ${getIconColor(file.fileKind)}`}>
              <FileKindIcon file={file} size={28} />
            </div>
            <span className="text-[13px] font-medium text-text overflow-hidden text-ellipsis whitespace-nowrap w-full">
              {file.name}
            </span>
            <span className="text-[11px] text-text-dim whitespace-nowrap overflow-hidden text-ellipsis w-full">
              {file.isFolder ? "폴더" : formatSize(file.size)}
              {" · "}
              {formatDate(file.lastModifiedAt)}
            </span>
            {selectable(file) && (
              <span className="mt-0.5 text-[11px] font-medium text-green">
                클릭하여 선택
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
