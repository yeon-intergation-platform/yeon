import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  fetchMemberRiskProfilesFromSpring,
  MemberRiskSpringBackendHttpError,
} from "@/server/member-risk-spring-client";
import {
  fetchOwnedMemberFromSpring,
  MembersSpringBackendHttpError,
} from "@/server/members-spring-client";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;
  const { memberId } = await params;
  try {
    const { member } = await fetchOwnedMemberFromSpring(
      memberId,
      currentUser.id
    );
    const { profiles } = await fetchMemberRiskProfilesFromSpring({
      userId: currentUser.id,
      members: [{ id: member.id, initialRiskLevel: member.initialRiskLevel }],
    });
    const riskProfile = profiles[0] ?? {
      aiRiskLevel: null,
      aiRiskSummary: null,
      aiRiskSignals: [],
      riskSource: member.initialRiskLevel ? "manual" : null,
      counselingRecordCount: 0,
      lastCounselingAt: null,
    };
    return NextResponse.json({ member: { ...member, ...riskProfile } });
  } catch (error) {
    if (error instanceof MembersSpringBackendHttpError)
      return jsonError(error.message, error.status);
    if (error instanceof MemberRiskSpringBackendHttpError)
      return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("수강생 정보를 불러오지 못했습니다.", 500);
  }
}
