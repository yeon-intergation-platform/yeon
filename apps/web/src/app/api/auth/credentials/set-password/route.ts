import { credentialSetPasswordBodySchema } from "@yeon/api-contract/credential";
import { errorResponseSchema } from "@yeon/api-contract/error";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AuthFlowError } from "@/server/auth/auth-errors";
import {
  respondWithAuthError,
  respondWithInvalidInput,
  respondWithServerError,
} from "@/server/auth/credentials/route-helpers";
import { getAuthSessionTokenFromRequest } from "@/server/auth/request-session-token";
import { setCredentialPasswordInSpring } from "@/server/credential-auth-spring-client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const sessionToken = getAuthSessionTokenFromRequest(request);

  if (!sessionToken) {
    return NextResponse.json(
      errorResponseSchema.parse({
        message: "로그인 후 이용해 주세요.",
      }),
      { status: 401 }
    );
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return respondWithInvalidInput("요청 본문을 해석할 수 없습니다.");
  }

  const parsed = credentialSetPasswordBodySchema.safeParse(rawBody);

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "입력 형식이 올바르지 않습니다.";
    return respondWithInvalidInput(message);
  }

  try {
    await setCredentialPasswordInSpring({
      sessionToken: sessionToken.token,
      body: { password: parsed.data.password },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthFlowError) {
      return respondWithAuthError(error);
    }
    console.error("비밀번호 추가 Spring 처리 중 오류", error);
    return respondWithServerError();
  }
}
