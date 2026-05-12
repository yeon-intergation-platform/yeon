import type { ImportPreview, ImportResult, OneDriveFile } from "../types";

async function readErrorText(
  response: Response,
  fallbackErrorMessage: string
): Promise<string> {
  const text = await response.text().catch(() => "");
  return text.trim() || fallbackErrorMessage;
}

export async function loadOneDriveConnectionStatus(
  statusHref: string
): Promise<boolean | null> {
  const response = await fetch(statusHref, { credentials: "include" });
  if (!response.ok) return null;

  const data = (await response.json()) as { connected: boolean };
  return data.connected;
}

export async function loadOneDriveFiles(
  filesHref: string
): Promise<OneDriveFile[]> {
  const response = await fetch(filesHref, { credentials: "include" });

  if (!response.ok) {
    throw new Error("파일 목록을 불러오지 못했습니다.");
  }

  const data = (await response.json()) as { files: OneDriveFile[] };
  return data.files;
}

export async function analyzeOneDriveFile(
  analyzeHref: string,
  fileId: string
): Promise<ImportPreview> {
  const response = await fetch(analyzeHref, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId }),
  });

  if (!response.ok) {
    throw new Error(await readErrorText(response, "파일 분석에 실패했습니다."));
  }

  return (await response.json()) as ImportPreview;
}

export async function importOneDrivePreview(
  importHref: string,
  preview: ImportPreview
): Promise<ImportResult> {
  const response = await fetch(importHref, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preview),
  });

  if (!response.ok) {
    throw new Error(await readErrorText(response, "가져오기에 실패했습니다."));
  }

  const data = (await response.json()) as {
    created: { spaces: number; members: number };
  };
  return data.created;
}
