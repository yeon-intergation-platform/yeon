import { credentialVerifyQuerySchema } from "@yeon/api-contract/credential";
import { createYeonUrl } from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AuthFlowError } from "@/server/auth/auth-errors";
import { getAppOrigin } from "@/server/auth/constants";
import { verifyCredentialEmailInSpring } from "@/server/credential-auth-spring-client";

export const runtime = "nodejs";

const VERIFIED_REDIRECT_PATH = "/auth/verified";
const ERROR_REDIRECT_PATH = "/auth/error";

export async function GET(request: NextRequest) {
  const parsed = credentialVerifyQuerySchema.safeParse({
    token: request.nextUrl.searchParams.get("token"),
  });

  if (!parsed.success) {
    const url = createYeonUrl(
      `${ERROR_REDIRECT_PATH}?reason=invalid_verification_token`,
      getAppOrigin(request.nextUrl.origin)
    );
    return NextResponse.redirect(url);
  }

  try {
    await verifyCredentialEmailInSpring(parsed.data.token);
    const url = createYeonUrl(
      VERIFIED_REDIRECT_PATH,
      getAppOrigin(request.nextUrl.origin)
    );
    return NextResponse.redirect(url);
  } catch (error) {
    if (error instanceof AuthFlowError) {
      const url = createYeonUrl(
        `${ERROR_REDIRECT_PATH}?reason=${encodeURIComponent(error.code)}`,
        getAppOrigin(request.nextUrl.origin)
      );
      return NextResponse.redirect(url);
    }
    console.error("이메일 인증 Spring 처리 중 오류", error);
    const url = createYeonUrl(
      `${ERROR_REDIRECT_PATH}?reason=server_error`,
      getAppOrigin(request.nextUrl.origin)
    );
    return NextResponse.redirect(url);
  }
}
