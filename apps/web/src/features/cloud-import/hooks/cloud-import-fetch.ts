import type { DriveFile, ImportCommitResult, ImportPreview } from "../types";

export type ResolveApiHref = (path: string) => string;

async function readErrorText(
  response: Response,
  fallbackErrorMessage: string
): Promise<string> {
  const text = await response.text().catch(() => "");
  return text.trim() || fallbackErrorMessage;
}

export async function loadImportDraftSnapshot<T>(
  resolveApiHref: ResolveApiHref,
  draftId: string
): Promise<T> {
  const response = await fetch(
    resolveApiHref(`/api/v1/integrations/local/drafts/${draftId}`)
  );

  if (!response.ok) {
    throw new Error(
      await readErrorText(response, "가져오기 초안을 불러오지 못했습니다.")
    );
  }

  return (await response.json()) as T;
}

export async function saveImportDraftPreview(
  resolveApiHref: ResolveApiHref,
  draftId: string,
  preview: ImportPreview
): Promise<void> {
  await fetch(resolveApiHref(`/api/v1/integrations/local/drafts/${draftId}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preview),
  });
}

export async function deleteImportDraft(
  resolveApiHref: ResolveApiHref,
  draftId: string
): Promise<void> {
  await fetch(resolveApiHref(`/api/v1/integrations/local/drafts/${draftId}`), {
    method: "DELETE",
  });
}

export async function loadCloudConnectionStatus(
  baseHref: string
): Promise<boolean | null> {
  const response = await fetch(`${baseHref}/status`);
  if (!response.ok) return null;

  const payload = (await response.json()) as { connected: boolean };
  return payload.connected;
}

export async function loadCloudDriveFiles(
  baseHref: string,
  folderId: string | undefined,
  signal: AbortSignal
): Promise<unknown[]> {
  const url = folderId
    ? `${baseHref}/files?folderId=${folderId}`
    : `${baseHref}/files`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("파일 목록을 불러오지 못했습니다.");
  }

  const payload = (await response.json()) as { files: unknown[] };
  return payload.files;
}

export async function requestCloudImportAnalysis(params: {
  baseHref: string;
  draftId: string | null;
  file: DriveFile;
  instruction?: string;
  previousResult?: ImportPreview;
  signal: AbortSignal;
}): Promise<Response> {
  return fetch(`${params.baseHref}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      draftId: params.draftId ?? undefined,
      fileId: params.file.id,
      fileName: params.file.name,
      mimeType: params.file.mimeType,
      size: params.file.size,
      lastModifiedAt: params.file.lastModifiedAt,
      instruction: params.instruction,
      previousResult: params.previousResult,
    }),
    signal: params.signal,
  });
}

export async function commitCloudImport(
  baseHref: string,
  draftId: string | null,
  preview: ImportPreview
): Promise<ImportCommitResult> {
  const response = await fetch(`${baseHref}/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      draftId: draftId ?? undefined,
      preview,
    }),
  });

  if (!response.ok) {
    throw new Error(await readErrorText(response, "가져오기에 실패했습니다."));
  }

  return (await response.json()) as ImportCommitResult;
}

export async function requestLocalImportAnalysis(params: {
  resolveApiHref: ResolveApiHref;
  file: File | null;
  draftId: string | null;
  instruction?: string;
  previousResult?: ImportPreview;
  signal: AbortSignal;
}): Promise<Response> {
  const formData = new FormData();
  if (params.file) {
    formData.append("file", params.file);
  }
  if (params.draftId) {
    formData.append("draftId", params.draftId);
  }
  if (params.instruction) {
    formData.append("instruction", params.instruction);
  }
  if (params.previousResult) {
    formData.append("previousResult", JSON.stringify(params.previousResult));
  }

  return fetch(params.resolveApiHref("/api/v1/integrations/local/analyze"), {
    method: "POST",
    headers: { Accept: "text/event-stream" },
    body: formData,
    signal: params.signal,
  });
}

export async function commitLocalImport(
  resolveApiHref: ResolveApiHref,
  draftId: string | null,
  preview: ImportPreview
): Promise<ImportCommitResult> {
  const response = await fetch(
    resolveApiHref("/api/v1/integrations/local/import"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draftId: draftId ?? undefined,
        preview,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await readErrorText(response, "가져오기에 실패했습니다."));
  }

  return (await response.json()) as ImportCommitResult;
}
