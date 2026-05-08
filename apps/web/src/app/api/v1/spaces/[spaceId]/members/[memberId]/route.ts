import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateMemberBodySchema } from "@yeon/api-contract/spaces";

import { jsonError, requireAuthenticatedUser } from "@/app/api/v1/counseling-records/_shared";
import { deleteMemberInSpring, MembersSpringBackendHttpError, updateMemberInSpring } from "@/server/members-spring-client";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ spaceId: string; memberId: string }> }) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;
  const { spaceId, memberId } = await params;
  let body: unknown; try { body = await request.json(); } catch { return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400); }
  const parsed = updateMemberBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("요청 데이터가 올바르지 않습니다.", 400);
  try { return NextResponse.json(await updateMemberInSpring(spaceId, memberId, currentUser.id, parsed.data)); }
  catch (error) { if (error instanceof MembersSpringBackendHttpError) return jsonError(error.message, error.status); console.error(error); return jsonError("수강생 정보를 수정하지 못했습니다.", 500); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ spaceId: string; memberId: string }> }) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;
  const { spaceId, memberId } = await params;
  try { return NextResponse.json(await deleteMemberInSpring(spaceId, memberId, currentUser.id)); }
  catch (error) { if (error instanceof MembersSpringBackendHttpError) return jsonError(error.message, error.status); console.error(error); return jsonError("수강생을 삭제하지 못했습니다.", 500); }
}
