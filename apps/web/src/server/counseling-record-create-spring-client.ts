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

export class CounselingRecordCreateSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CounselingRecordCreateSpringBackendHttpError";
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
  if ("message" in parsed && typeof parsed.message === "string") {
    return parsed.message;
  }
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

export async function createCounselingRecordInSpring(params: {
  userId: string;
  userEmail?: string | null;
  userDisplayName?: string | null;
  formData: FormData;
  clientRequestId?: string | null;
}) {
  const headers = buildSpringBffHeaders(undefined, { userId: params.userId });
  headers.set("accept", "application/json");
  headers.delete("content-type");
  if (params.userEmail) headers.set("X-Yeon-User-Email", params.userEmail);
  if (params.userDisplayName) {
    headers.set("X-Yeon-User-Display-Name", params.userDisplayName);
  }
  if (params.clientRequestId) {
    headers.set("X-Client-Request-Id", params.clientRequestId);
  }

  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/counseling-records`,
    {
      method: "POST",
      cache: "no-store",
      headers,
      body: params.formData,
    }
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new CounselingRecordCreateSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "상담 기록 생성에 실패했습니다."
    );
  }

  return parsed;
}
