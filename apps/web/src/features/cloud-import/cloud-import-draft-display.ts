import type { DriveFile } from "./types";

export type LocalImportDraftListItem = {
  id: string;
  status:
    | "uploaded"
    | "analyzing"
    | "analyzed"
    | "edited"
    | "imported"
    | "error";
  selectedFile: DriveFile;
  error: string | null;
  processingMessage: string | null;
  updatedAt: string;
  expiresAt: string;
};

export function formatUpdatedAt(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getDraftStatusLabel(
  status: LocalImportDraftListItem["status"]
) {
  switch (status) {
    case "uploaded":
      return "업로드 완료";
    case "analyzing":
      return "분석 중";
    case "analyzed":
      return "분석 완료";
    case "edited":
      return "수정 중";
    case "error":
      return "오류";
    default:
      return "임시초안";
  }
}

export function getDraftStatusBadgeClass(
  status: LocalImportDraftListItem["status"]
) {
  switch (status) {
    case "analyzed":
      return "border-accent-border bg-accent-dim/70 text-accent";
    case "analyzing":
      return "border-[rgba(125,211,252,0.24)] bg-[rgba(56,189,248,0.1)] text-[rgb(125,211,252)]";
    case "edited":
      return "border-[rgba(196,181,253,0.24)] bg-[rgba(139,92,246,0.1)] text-[rgb(216,180,254)]";
    case "error":
      return "border-red/30 bg-red/10 text-red";
    default:
      return "border-border bg-surface-2/80 text-text-secondary";
  }
}

export function getDraftFileExtensionLabel(fileName: string) {
  const extensionIndex = fileName.lastIndexOf(".");

  if (extensionIndex < 0 || extensionIndex === fileName.length - 1) {
    return "FILE";
  }

  return fileName.slice(extensionIndex + 1).toUpperCase();
}

export function getDraftRowSummary(draft: LocalImportDraftListItem) {
  if (draft.error) {
    return draft.status === "error"
      ? "오류가 발생한 작업입니다. 다시 열어 확인하거나 삭제할 수 있습니다."
      : "상태 확인이 필요한 작업입니다. 다시 열어 이어서 진행해 주세요.";
  }

  switch (draft.status) {
    case "uploaded":
      return "업로드한 파일입니다. 분석을 시작할 수 있습니다.";
    case "analyzing":
      return "분석 중이던 작업입니다. 결과를 이어서 확인할 수 있습니다.";
    case "analyzed":
      return "분석 결과가 저장되어 있습니다. 검토 후 가져올 수 있습니다.";
    case "edited":
      return "수정 중이던 초안입니다. 이어서 마무리할 수 있습니다.";
    default:
      return "가져오기 작업을 이어서 확인할 수 있습니다.";
  }
}
