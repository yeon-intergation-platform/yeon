const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class CounselingRecordAudioSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CounselingRecordAudioSpringBackendHttpError";
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

export async function fetchCounselingRecordAudioFromSpring(params: {
  userId: string;
  recordId: string;
  rangeHeader?: string | null;
}) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/counseling-records/${params.recordId}/audio`,
    {
      cache: "no-store",
      method: "GET",
      headers: {
        accept: "*/*",
        "X-Yeon-User-Id": params.userId,
        ...(params.rangeHeader ? { Range: params.rangeHeader } : {}),
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
    },
  );

  if (!response.ok) {
    const raw = await response.text();
    const parsed = tryParseJson(raw);
    throw new CounselingRecordAudioSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.",
    );
  }

  return {
    bytes: new Uint8Array(await response.arrayBuffer()),
    status: response.status,
    mimeType: response.headers.get("content-type") ?? "application/octet-stream",
    contentLength: response.headers.get("content-length"),
    contentDisposition: response.headers.get("content-disposition"),
    contentRange: response.headers.get("content-range"),
  };
}
