import {
  bulkUpdateSpeakerResponseSchema,
  type BulkUpdateSpeakerRequest,
  updateSegmentResponseSchema,
  type UpdateSegmentRequest,
} from "@yeon/api-contract/counseling-records";

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

export class CounselingRecordMutationSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CounselingRecordMutationSpringBackendHttpError";
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

async function readJson(response: Response) {
  const raw = await response.text();
  const parsed = tryParseJson(raw);
  if (!response.ok) {
    throw new CounselingRecordMutationSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다."
    );
  }
  return parsed;
}

async function readOk(response: Response) {
  return (await readJson(response)) as { ok: boolean };
}

export async function linkCounselingRecordMemberInSpring(
  userId: string,
  recordId: string,
  memberId: string | null
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/counseling-records/${recordId}/link-member`,
    {
      cache: "no-store",
      method: "PATCH",
      headers: buildSpringBffHeaders(
        {
          "content-type": "application/json",
        },
        { userId }
      ),
      body: JSON.stringify({ memberId }),
    }
  );
  return readOk(response);
}

export async function deleteCounselingRecordInSpring(
  userId: string,
  recordId: string
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/counseling-records/${recordId}`,
    {
      cache: "no-store",
      method: "DELETE",
      headers: buildSpringBffHeaders(undefined, { userId }),
    }
  );
  return readOk(response);
}

export async function updateTranscriptSegmentInSpring(
  userId: string,
  recordId: string,
  segmentId: string,
  body: UpdateSegmentRequest
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/counseling-records/${recordId}/segments/${segmentId}`,
    {
      cache: "no-store",
      method: "PATCH",
      headers: buildSpringBffHeaders(
        {
          "content-type": "application/json",
        },
        { userId }
      ),
      body: JSON.stringify(body),
    }
  );
  return updateSegmentResponseSchema.parse(await readJson(response));
}

export async function bulkUpdateSpeakerInSpring(
  userId: string,
  recordId: string,
  body: BulkUpdateSpeakerRequest
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/counseling-records/${recordId}/segments/bulk`,
    {
      cache: "no-store",
      method: "PATCH",
      headers: buildSpringBffHeaders(
        {
          "content-type": "application/json",
        },
        { userId }
      ),
      body: JSON.stringify(body),
    }
  );
  return bulkUpdateSpeakerResponseSchema.parse(await readJson(response));
}
