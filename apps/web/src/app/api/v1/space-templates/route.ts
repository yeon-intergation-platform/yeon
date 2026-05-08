import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  createSpaceTemplateInSpring,
  fetchSpaceTemplatesFromSpring,
  SpringBackendHttpError,
} from "@/server/space-templates-spring-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  try {
    const result = await fetchSpaceTemplatesFromSpring(currentUser.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("템플릿 목록을 불러오지 못했습니다.", 500);
  }
}

export async function POST(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  try {
    const result = await createSpaceTemplateInSpring(currentUser.id, body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof SpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("템플릿을 생성하지 못했습니다.", 500);
  }
}
