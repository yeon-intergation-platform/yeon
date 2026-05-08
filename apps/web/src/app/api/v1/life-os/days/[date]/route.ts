import { NextResponse, type NextRequest } from "next/server";
import {
  lifeOsDayResponseSchema,
  lifeOsLocalDateSchema,
  upsertLifeOsDayBodySchema,
} from "@yeon/api-contract/life-os";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  fetchLifeOsDayFromSpring,
  LifeOsSpringBackendHttpError,
  updateLifeOsDayInSpring,
} from "@/server/life-os-spring-client";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) {
    return response;
  }

  const { date } = await params;
  const parsedDate = lifeOsLocalDateSchema.safeParse(date);
  if (!parsedDate.success) {
    return jsonError("날짜 형식이 올바르지 않습니다.", 400);
  }

  try {
    const day = await fetchLifeOsDayFromSpring(currentUser.id, parsedDate.data);
    return NextResponse.json(lifeOsDayResponseSchema.parse(day));
  } catch (error) {
    if (error instanceof LifeOsSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("Life OS 기록을 불러오지 못했습니다.", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) {
    return response;
  }

  const { date } = await params;
  const parsedDate = lifeOsLocalDateSchema.safeParse(date);
  if (!parsedDate.success) {
    return jsonError("날짜 형식이 올바르지 않습니다.", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = upsertLifeOsDayBodySchema.safeParse({
    ...((typeof body === "object" && body !== null ? body : {}) as Record<
      string,
      unknown
    >),
    localDate: parsedDate.data,
  });
  if (!parsed.success) {
    return jsonError("Life OS 기록 형식이 올바르지 않습니다.", 400);
  }

  try {
    const day = await updateLifeOsDayInSpring(
      currentUser.id,
      parsedDate.data,
      parsed.data,
    );
    return NextResponse.json(lifeOsDayResponseSchema.parse(day));
  } catch (error) {
    if (error instanceof LifeOsSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("Life OS 기록을 저장하지 못했습니다.", 500);
  }
}
