import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createMemberBodySchema } from "@yeon/api-contract/spaces";

import { jsonError, requireAuthenticatedUser } from "@/app/api/v1/counseling-records/_shared";
import { fetchMemberRiskProfilesFromSpring, MemberRiskSpringBackendHttpError } from "@/server/member-risk-spring-client";
import { createMemberInSpring, fetchMembersFromSpring, MembersSpringBackendHttpError } from "@/server/members-spring-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ spaceId: string }> }) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;
  const { spaceId } = await params;
  try {
    const { members } = await fetchMembersFromSpring(spaceId, currentUser.id);
    const { profiles } = await fetchMemberRiskProfilesFromSpring({
      userId: currentUser.id,
      members: members.map((member) => ({ id: member.id, initialRiskLevel: member.initialRiskLevel })),
    });
    const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
    return NextResponse.json({ members: members.map((member) => ({ ...member, ...(profileById.get(member.id) ?? {}) })) });
  } catch (error) {
    if (error instanceof MembersSpringBackendHttpError) return jsonError(error.message, error.status);
    if (error instanceof MemberRiskSpringBackendHttpError) return jsonError(error.message, error.status);
    console.error(error); return jsonError("수강생 목록을 불러오지 못했습니다.", 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ spaceId: string }> }) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;
  const { spaceId } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400); }
  const parsed = createMemberBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("요청 데이터가 올바르지 않습니다.", 400);
  try {
    const result = await createMemberInSpring(spaceId, currentUser.id, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof MembersSpringBackendHttpError) return jsonError(error.message, error.status);
    console.error(error); return jsonError("수강생을 추가하지 못했습니다.", 500);
  }
}
