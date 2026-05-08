export type OneDriveBrowserStatusResponse = {
  connected: boolean;
};

export type OneDriveBrowserFile = {
  id: string;
  name: string;
  size: number;
  lastModifiedAt: string;
  mimeType: string;
};

export type OneDriveBrowserFilesResponse = {
  files: OneDriveBrowserFile[];
};

export type OneDriveBrowserFileContentResponse = {
  bytes: Uint8Array;
  contentType: string;
};

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class OneDriveBrowserSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "OneDriveBrowserSpringBackendHttpError";
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
  if ("message" in parsed && typeof parsed.message === "string") return parsed.message;
  if (
    "error" in parsed &&
    parsed.error &&
    typeof parsed.error === "object" &&
    "message" in parsed.error &&
    typeof parsed.error.message === "string"
  ) {
    return parsed.error.message;
  }
  return null;
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new OneDriveBrowserSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
    );
  }

  return parsed as T;
}

function buildHeaders(userId: string) {
  return {
    accept: "application/json",
    "X-Yeon-User-Id": userId,
    ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
      ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
      : {}),
  };
}

export async function fetchOneDriveStatusFromSpring(
  userId: string,
): Promise<OneDriveBrowserStatusResponse> {
  const response = await fetch(`${resolveSpringBackendBaseUrl()}/onedrive/status`, {
    method: "GET",
    cache: "no-store",
    headers: buildHeaders(userId),
  });

  return readJsonResponse<OneDriveBrowserStatusResponse>(response);
}

export async function fetchOneDriveFilesFromSpring(params: {
  userId: string;
  folderId?: string;
}): Promise<OneDriveBrowserFilesResponse> {
  const url = new URL(`${resolveSpringBackendBaseUrl()}/onedrive/files`);
  if (params.folderId) {
    url.searchParams.set("folderId", params.folderId);
  }

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: buildHeaders(params.userId),
  });

  return readJsonResponse<OneDriveBrowserFilesResponse>(response);
}

export async function downloadOneDriveFileFromSpring(params: {
  userId: string;
  fileId: string;
  mimeType: string;
}): Promise<OneDriveBrowserFileContentResponse> {
  const url = new URL(
    `${resolveSpringBackendBaseUrl()}/onedrive/files/${params.fileId}/content`,
  );
  if (params.mimeType) {
    url.searchParams.set("mimeType", params.mimeType);
  }

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: buildHeaders(params.userId),
  });

  if (!response.ok) {
    const raw = await response.text();
    const parsed = tryParseJson(raw);
    throw new OneDriveBrowserSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    bytes: new Uint8Array(arrayBuffer),
    contentType:
      response.headers.get("content-type") ?? "application/octet-stream",
  };
}
