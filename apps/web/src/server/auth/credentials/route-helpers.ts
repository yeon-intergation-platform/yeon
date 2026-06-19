import { errorResponseSchema } from "@yeon/api-contract/error";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  type AuthErrorCode,
  AuthFlowError,
  authErrorCodes,
} from "@/server/auth/auth-errors";

const AUTH_ERROR_STATUS: Record<AuthErrorCode, number> = {
  [authErrorCodes.providerDenied]: 400,
  [authErrorCodes.invalidState]: 400,
  [authErrorCodes.missingCode]: 400,
  [authErrorCodes.providerNotConfigured]: 500,
  [authErrorCodes.oauthExchangeFailed]: 502,
  [authErrorCodes.profileFetchFailed]: 502,
  [authErrorCodes.emailRequired]: 400,
  [authErrorCodes.emailNotVerified]: 403,
  [authErrorCodes.providerConflict]: 409,
  [authErrorCodes.invalidCredentials]: 401,
  [authErrorCodes.passwordPolicyViolation]: 400,
  [authErrorCodes.emailAlreadyRegistered]: 409,
  [authErrorCodes.accountLocked]: 423,
  [authErrorCodes.rateLimitExceeded]: 429,
  [authErrorCodes.invalidVerificationToken]: 400,
  [authErrorCodes.invalidResetToken]: 400,
  [authErrorCodes.serverError]: 500,
};

export function getClientIp(request: NextRequest): string {
  // idx-168: Cloudflare 뒤에서는 CF-Connecting-IP가 스푸핑 불가 신뢰 헤더.
  // CF-Connecting-IP가 없으면(로컬/직접 연결) XFF의 마지막 hop(가장 신뢰 가능)을 사용한다.
  // XFF 첫 번째 값은 클라이언트가 임의로 설정 가능하므로 IP 기반 rate limit에 사용하지 않는다.
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    const trimmed = cfConnectingIp.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const hops = forwarded.split(",");
    // 마지막 hop: 신뢰된 프록시가 추가한 가장 오른쪽 IP.
    const last = hops[hops.length - 1]?.trim();
    if (last) {
      return last;
    }
  }

  const real = request.headers.get("x-real-ip");
  if (real) {
    return real.trim();
  }

  return "unknown";
}

export function respondWithAuthError(error: AuthFlowError) {
  const status = AUTH_ERROR_STATUS[error.code] ?? 500;
  return NextResponse.json(
    errorResponseSchema.parse({ code: error.code, message: error.message }),
    { status }
  );
}

export function respondWithInvalidInput(message: string) {
  return NextResponse.json(errorResponseSchema.parse({ message }), {
    status: 400,
  });
}

export function respondWithServerError() {
  return NextResponse.json(
    errorResponseSchema.parse({
      code: authErrorCodes.serverError,
      message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    }),
    { status: 500 }
  );
}
