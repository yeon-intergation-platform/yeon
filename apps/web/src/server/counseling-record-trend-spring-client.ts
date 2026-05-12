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

export class CounselingRecordTrendSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CounselingRecordTrendSpringBackendHttpError";
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
  ) {
    return parsed.error.message;
  }
  return null;
}

async function readError(response: Response) {
  const raw = await response.text();
  const parsed = tryParseJson(raw);
  return extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
}

export async function fetchCounselingRecordTrendSourcesFromSpring(
  userId: string,
  body: { recordIds: string[] }
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/counseling-records/trend-source`,
    {
      cache: "no-store",
      method: "POST",
      headers: buildSpringBffHeaders(
        {
          "content-type": "application/json",
        },
        { userId }
      ),
      body: JSON.stringify(body),
    }
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new CounselingRecordTrendSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다."
    );
  }

  return parsed as {
    records: Array<{
      studentName: string;
      sessionTitle: string;
      counselingType: string;
      createdAt: string;
      segments: Array<{ speakerLabel: string; text: string; startMs: number }>;
    }>;
  };
}

export async function streamCounselingRecordTrendAnalysisFromSpring(
  userId: string,
  body: { recordIds: string[] }
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/counseling-records/analyze-trend`,
    {
      cache: "no-store",
      method: "POST",
      headers: buildSpringBffHeaders(
        {
          accept: "text/event-stream",
          "content-type": "application/json",
        },
        { userId }
      ),
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new CounselingRecordTrendSpringBackendHttpError(
      response.status,
      await readError(response)
    );
  }

  if (!response.body) {
    throw new CounselingRecordTrendSpringBackendHttpError(
      502,
      "Spring backend 응답 스트림을 받지 못했습니다."
    );
  }

  return response.body;
}
