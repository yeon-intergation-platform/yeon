import type { NextRequest } from "next/server";

import { requireAuthenticatedUser } from "@/app/api/v1/counseling-records/_shared";
import {
  createOAuthCallbackErrorResponse,
  createOAuthCallbackSuccessResponse,
  resolveOAuthCallbackContext,
} from "@/app/api/v1/integrations/_shared";
import {
  CloudOAuthSpringBackendHttpError,
  exchangeOneDriveOAuthCodeInSpring,
} from "@/server/cloud-oauth-spring-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // IDX 171: 콜백 시점의 현재 로그인 사용자를 확인해 user 쿠키 userId와 일치하는지 재검증한다.
  const { currentUser } = await requireAuthenticatedUser(request);
  if (!currentUser) {
    return createOAuthCallbackErrorResponse("onedrive", "invalid_state");
  }

  const context = resolveOAuthCallbackContext({
    request,
    providerKey: "onedrive",
    currentUserId: currentUser.id,
  });

  if ("response" in context) {
    return context.response;
  }

  try {
    await exchangeOneDriveOAuthCodeInSpring({
      userId: context.userId,
      code: context.code,
    });
    return createOAuthCallbackSuccessResponse("onedrive");
  } catch (error) {
    console.error("OneDrive OAuth callback 오류:", error);
    if (
      error instanceof CloudOAuthSpringBackendHttpError &&
      error.status >= 500
    ) {
      return createOAuthCallbackErrorResponse("onedrive", "exchange_failed");
    }
    return createOAuthCallbackErrorResponse("onedrive", "save_failed");
  }
}
