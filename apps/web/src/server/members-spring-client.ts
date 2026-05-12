import type {
  BulkDeleteMembersBody,
  CreateMemberBody,
  UpdateMemberBody,
} from "@yeon/api-contract/spaces";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";

export type SpringMember = {
  id: string;
  spaceId: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  initialRiskLevel: string | null;
  createdAt: string;
  updatedAt: string;
};

type FetchInit = {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
};
const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}
export class MembersSpringBackendHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "MembersSpringBackendHttpError";
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
async function fetchJsonFromSpring(
  path: string,
  userId: string,
  init?: FetchInit
) {
  const response = await fetch(`${resolveSpringBackendBaseUrl()}${path}`, {
    method: init?.method ?? "GET",
    body: init?.body,
    cache: "no-store",
    headers: buildSpringBffHeaders(init?.headers, { userId }),
  });
  const body = await response.text();
  const parsed = tryParseJson(body);
  if (!response.ok) {
    throw new MembersSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다."
    );
  }
  return parsed;
}
export async function fetchMembersFromSpring(spaceId: string, userId: string) {
  return fetchJsonFromSpring(`/spaces/${spaceId}/members`, userId) as Promise<{
    members: SpringMember[];
  }>;
}
export async function createMemberInSpring(
  spaceId: string,
  userId: string,
  body: CreateMemberBody
) {
  return fetchJsonFromSpring(`/spaces/${spaceId}/members`, userId, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  }) as Promise<{ member: SpringMember }>;
}
export async function fetchMemberInSpaceFromSpring(
  spaceId: string,
  memberId: string,
  userId: string
) {
  return fetchJsonFromSpring(
    `/spaces/${spaceId}/members/${memberId}`,
    userId
  ) as Promise<{ member: SpringMember }>;
}
export async function fetchOwnedMemberFromSpring(
  memberId: string,
  userId: string
) {
  return fetchJsonFromSpring(`/members/${memberId}`, userId) as Promise<{
    member: SpringMember;
  }>;
}
export async function updateMemberInSpring(
  spaceId: string,
  memberId: string,
  userId: string,
  body: UpdateMemberBody
) {
  return fetchJsonFromSpring(`/spaces/${spaceId}/members/${memberId}`, userId, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  }) as Promise<{ member: SpringMember }>;
}
export async function deleteMemberInSpring(
  spaceId: string,
  memberId: string,
  userId: string
) {
  return fetchJsonFromSpring(`/spaces/${spaceId}/members/${memberId}`, userId, {
    method: "DELETE",
  }) as Promise<{ ok: boolean }>;
}
export async function bulkDeleteMembersInSpring(
  spaceId: string,
  userId: string,
  body: BulkDeleteMembersBody
) {
  return fetchJsonFromSpring(`/spaces/${spaceId}/members/bulk-delete`, userId, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  }) as Promise<{ deletedCount: number; deletedIds: string[] }>;
}
