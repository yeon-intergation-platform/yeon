import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  snapshotSpaceTemplateInSpring,
  SpringBackendHttpError,
} from "@/server/space-templates-spring-client";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  try {
    const result = await snapshotSpaceTemplateInSpring(spaceId, currentUser.id, body as {
      name: string;
      description?: string | null;
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof SpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("템플릿 스냅샷을 저장하지 못했습니다.", 500);
  }
}
