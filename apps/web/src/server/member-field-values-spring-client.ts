import type { BulkUpsertMemberFieldValuesBody } from "@yeon/api-contract/spaces";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}


export type SpringMemberFieldValueItem = {
  fieldDefinitionId: string;
  fieldType: string;
  fieldName: string;
  valueText: string | null;
  valueNumber: string | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
};

export type SpringMemberFieldValuesReadResponse = {
  values: SpringMemberFieldValueItem[];
};

export type SpringMemberFieldValuesWriteResponse = {
  ok: boolean;
  values: SpringMemberFieldValueItem[];
};

export class MemberFieldValuesSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "MemberFieldValuesSpringBackendHttpError";
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

export async function bulkUpsertMemberFieldValuesInSpring(
  spaceId: string,
  memberId: string,
  userId: string,
  body: BulkUpsertMemberFieldValuesBody,
): Promise<SpringMemberFieldValuesWriteResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/members/${memberId}/field-values`,
    {
      method: "PATCH",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
      body: JSON.stringify(body),
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new MemberFieldValuesSpringBackendHttpError(response.status, message);
  }

  return parsed;
}


export async function fetchMemberFieldValuesFromSpring(
  spaceId: string,
  memberId: string,
  userId: string,
  fieldDefinitionIds: string[],
): Promise<SpringMemberFieldValuesReadResponse> {
  const search = new URLSearchParams();
  for (const fieldDefinitionId of fieldDefinitionIds) {
    search.append("fieldDefinitionId", fieldDefinitionId);
  }

  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/members/${memberId}/field-values${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new MemberFieldValuesSpringBackendHttpError(response.status, message);
  }

  return parsed;
}
