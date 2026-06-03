import { credentialResendVerificationBodySchema } from "@yeon/api-contract/credential";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AuthFlowError } from "@/server/auth/auth-errors";
import {
  getClientIp,
  respondWithAuthError,
  respondWithInvalidInput,
  respondWithServerError,
} from "@/server/auth/credentials/route-helpers";
import { resendCredentialVerificationInSpring } from "@/server/credential-auth-spring-client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return respondWithInvalidInput("요청 본문을 해석할 수 없습니다.");
  }

  const parsed = credentialResendVerificationBodySchema.safeParse(rawBody);

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "입력 형식이 올바르지 않습니다.";
    return respondWithInvalidInput(message);
  }

  try {
    await resendCredentialVerificationInSpring({
      email: parsed.data.email,
      ipAddress: getClientIp(request),
      appOrigin: request.nextUrl.origin,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthFlowError) {
      return respondWithAuthError(error);
    }
    console.error("인증 메일 Spring 재발송 요청 처리 중 오류", error);
    return respondWithServerError();
  }
}
