import { credentialRegisterBodySchema } from "@yeon/api-contract/credential";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AuthFlowError } from "@/server/auth/auth-errors";
import {
  getClientIp,
  respondWithAuthError,
  respondWithInvalidInput,
  respondWithServerError,
} from "@/server/auth/credentials/route-helpers";
import { registerCredentialInSpring } from "@/server/credential-auth-spring-client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return respondWithInvalidInput("요청 본문을 해석할 수 없습니다.");
  }

  const parsed = credentialRegisterBodySchema.safeParse(rawBody);

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "입력 형식이 올바르지 않습니다.";
    return respondWithInvalidInput(message);
  }

  try {
    const result = await registerCredentialInSpring({
      ...parsed.data,
      ipAddress: getClientIp(request),
      appOrigin: request.nextUrl.origin,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof AuthFlowError) {
      return respondWithAuthError(error);
    }
    console.error("일반 가입 Spring 처리 중 오류", error);
    return respondWithServerError();
  }
}
