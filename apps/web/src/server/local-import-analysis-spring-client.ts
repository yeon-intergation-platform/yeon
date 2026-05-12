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

export class LocalImportAnalysisSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "LocalImportAnalysisSpringBackendHttpError";
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

export async function runLocalImportAnalyzeInSpring(params: {
  userId: string;
  formData: FormData;
  accept: string | null;
}) {
  const headers = buildSpringBffHeaders(undefined, { userId: params.userId });
  headers.delete("content-type");
  if (params.accept?.includes("text/event-stream")) {
    headers.set("accept", "text/event-stream");
  }

  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/integrations/local/analyze`,
    {
      method: "POST",
      body: params.formData,
      cache: "no-store",
      headers,
    }
  );

  if (params.accept?.includes("text/event-stream")) {
    if (!response.ok) {
      const raw = await response.text();
      const parsed = tryParseJson(raw);
      throw new LocalImportAnalysisSpringBackendHttpError(
        response.status,
        extractErrorMessage(parsed) ?? "파일 분석에 실패했습니다."
      );
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  }

  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok) {
    throw new LocalImportAnalysisSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "파일 분석에 실패했습니다."
    );
  }
  return Response.json(parsed);
}
