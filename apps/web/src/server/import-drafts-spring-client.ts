import { buildSpringBffHeaders } from "@/server/spring-bff-client";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

export class ImportDraftsSpringBackendHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ImportDraftsSpringBackendHttpError";
    this.status = status;
  }
}

function tryParseJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function extractErrorMessage(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") return null;
  if ("message" in parsed && typeof parsed.message === "string")
    return parsed.message;
  if (
    "error" in parsed &&
    parsed.error &&
    typeof parsed.error === "object" &&
    "message" in parsed.error &&
    typeof parsed.error.message === "string"
  )
    return parsed.error.message;
  return null;
}
async function fetchJson(path: string, userId: string, init?: RequestInit) {
  const response = await fetch(`${resolveSpringBackendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildSpringBffHeaders(init?.headers, { userId }),
  });

  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok)
    throw new ImportDraftsSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다."
    );
  return parsed;
}

export async function fetchLocalImportDraftsFromSpring(
  userId: string,
  limit: number
) {
  const query = new URLSearchParams({
    provider: "local",
    limit: String(limit),
  });
  for (const status of ["uploaded", "analyzing", "analyzed", "edited", "error"])
    query.append("statuses", status);
  return fetchJson(`/import-drafts?${query.toString()}`, userId) as Promise<{
    drafts: unknown[];
  }>;
}
export async function fetchImportDraftFromSpring(
  userId: string,
  draftId: string
) {
  return fetchJson(
    `/import-drafts/${encodeURIComponent(draftId)}`,
    userId
  ) as Promise<unknown>;
}
export async function patchImportDraftPreviewInSpring(
  userId: string,
  draftId: string,
  body: { preview: unknown; status: string }
) {
  return fetchJson(
    `/import-drafts/${encodeURIComponent(draftId)}/preview`,
    userId,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }
  ) as Promise<{ ok: boolean }>;
}
export async function deleteImportDraftInSpring(
  userId: string,
  draftId: string
) {
  return fetchJson(`/import-drafts/${encodeURIComponent(draftId)}`, userId, {
    method: "DELETE",
  }) as Promise<{ ok: boolean }>;
}
export async function fetchImportDraftFileFromSpring(
  userId: string,
  draftId: string
) {
  return fetchJson(
    `/import-drafts/${encodeURIComponent(draftId)}/file`,
    userId
  ) as Promise<{ fileName: string; mimeType: string; base64: string }>;
}
