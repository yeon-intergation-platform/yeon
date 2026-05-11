import type { ReorderMemberFieldsBody } from "@yeon/api-contract/spaces";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class MemberFieldsSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "MemberFieldsSpringBackendHttpError";
    this.status = status;
  }
}

function buildHeaders(userId: string) {
  return {
    accept: "application/json",
    "content-type": "application/json",
    "X-Yeon-User-Id": userId,
    ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
      ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
      : {}),
  };
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

async function parseSpringResponse(response: Response) {
  const body = await response.text();
  const parsed = tryParseJson(body);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new MemberFieldsSpringBackendHttpError(response.status, message);
  }

  return parsed;
}

export async function fetchMemberFieldsFromSpring(
  spaceId: string,
  tabId: string,
  userId: string,
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/member-tabs/${tabId}/fields`,
    {
      cache: "no-store",
      headers: { ...buildHeaders(userId), "content-type": undefined as never },
    },
  );

  return parseSpringResponse(response);
}

export async function fetchMemberFieldValuesFromSpring(
  spaceId: string,
  tabId: string,
  memberId: string,
  userId: string,
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/member-tabs/${tabId}/field-values?memberId=${encodeURIComponent(memberId)}`,
    {
      cache: "no-store",
      headers: { ...buildHeaders(userId), "content-type": undefined as never },
    },
  );

  return parseSpringResponse(response);
}

export async function bootstrapOverviewFieldsInSpring(
  spaceId: string,
  tabId: string,
  userId: string,
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/member-tabs/${tabId}/bootstrap-overview-fields`,
    {
      method: "POST",
      cache: "no-store",
      headers: buildHeaders(userId),
      body: JSON.stringify({}),
    },
  );

  return parseSpringResponse(response);
}

export async function createMemberFieldInSpring(
  spaceId: string,
  tabId: string,
  userId: string,
  body: unknown,
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/member-tabs/${tabId}/fields`,
    {
      method: "POST",
      cache: "no-store",
      headers: buildHeaders(userId),
      body: JSON.stringify(body),
    },
  );

  return parseSpringResponse(response);
}

export async function updateMemberFieldInSpring(
  spaceId: string,
  fieldId: string,
  userId: string,
  body: unknown,
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/member-fields/${fieldId}`,
    {
      method: "PATCH",
      cache: "no-store",
      headers: buildHeaders(userId),
      body: JSON.stringify(body),
    },
  );

  return parseSpringResponse(response);
}

export async function deleteMemberFieldInSpring(
  spaceId: string,
  fieldId: string,
  userId: string,
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/member-fields/${fieldId}`,
    {
      method: "DELETE",
      cache: "no-store",
      headers: buildHeaders(userId),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    const parsed = tryParseJson(body);
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new MemberFieldsSpringBackendHttpError(response.status, message);
  }
}

export async function reorderMemberFieldsInSpring(
  spaceId: string,
  tabId: string,
  userId: string,
  body: ReorderMemberFieldsBody,
) {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/member-tabs/${tabId}/fields/reorder`,
    {
      method: "PATCH",
      cache: "no-store",
      headers: buildHeaders(userId),
      body: JSON.stringify(body),
    },
  );

  return parseSpringResponse(response);
}
