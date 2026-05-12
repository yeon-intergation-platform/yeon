import { errorResponseSchema } from "@yeon/api-contract/error";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  DEFAULT_POST_LOGIN_PATH,
  getAppOrigin,
  normalizeAuthRedirectPath,
} from "@/server/auth/constants";
import {
  createDevLoginSession,
  isDevLoginAllowed,
  verifyDevLoginRequestSecret,
} from "@/server/auth/dev-login";
import { applyAuthSessionCookie } from "@/server/auth/session";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json(errorResponseSchema.parse({ message }), { status });
}

export async function GET(request: NextRequest) {
  if (!isDevLoginAllowed() || !verifyDevLoginRequestSecret(request)) {
    return new NextResponse(null, { status: 404 });
  }

  const requestedNextPath = request.nextUrl.searchParams.get("next");
  const nextPath = requestedNextPath
    ? normalizeAuthRedirectPath(requestedNextPath)
    : DEFAULT_POST_LOGIN_PATH;
  const shouldCreateAccount =
    request.nextUrl.searchParams.get("create") === "1";

  let session: { sessionToken: string; expiresAt: Date };
  try {
    session = await createDevLoginSession({
      accountKey: request.nextUrl.searchParams.get("account"),
      create: shouldCreateAccount,
    });
  } catch (error) {
    console.error("dev-login Spring 세션 생성 실패", error);
    return jsonError("선택한 테스트 계정을 찾지 못했습니다.", 404);
  }

  const response = NextResponse.redirect(
    new URL(nextPath, getAppOrigin(request.nextUrl.origin))
  );

  applyAuthSessionCookie(response, session);

  return response;
}
