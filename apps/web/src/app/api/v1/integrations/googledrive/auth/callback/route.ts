import type { NextRequest } from "next/server";

import {
  createOAuthCallbackErrorResponse,
  createOAuthCallbackSuccessResponse,
  resolveOAuthCallbackContext,
} from "@/app/api/v1/integrations/_shared";
import { CloudOAuthSpringBackendHttpError, exchangeGoogleDriveOAuthCodeInSpring } from "@/server/cloud-oauth-spring-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const context = resolveOAuthCallbackContext({
    request,
    providerKey: "googledrive",
  });

  if ("response" in context) {
    return context.response;
  }

  try {
    await exchangeGoogleDriveOAuthCodeInSpring({
      userId: context.userId,
      code: context.code,
    });
  } catch (error) {
    console.error("Google Drive 토큰 교환 실패:", error);
    if (error instanceof CloudOAuthSpringBackendHttpError && error.status >= 500) {
      return createOAuthCallbackErrorResponse("googledrive", "exchange_failed");
    }
    return createOAuthCallbackErrorResponse("googledrive", "save_failed");
  }

  return createOAuthCallbackSuccessResponse("googledrive");
}
