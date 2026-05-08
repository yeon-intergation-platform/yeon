import type { NextRequest } from "next/server";

import {
  createOAuthCallbackErrorResponse,
  createOAuthCallbackSuccessResponse,
  resolveOAuthCallbackContext,
} from "@/app/api/v1/integrations/_shared";
import { CloudOAuthSpringBackendHttpError, exchangeOneDriveOAuthCodeInSpring } from "@/server/cloud-oauth-spring-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const context = resolveOAuthCallbackContext({
    request,
    providerKey: "onedrive",
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
    if (error instanceof CloudOAuthSpringBackendHttpError && error.status >= 500) {
      return createOAuthCallbackErrorResponse("onedrive", "exchange_failed");
    }
    return createOAuthCallbackErrorResponse("onedrive", "save_failed");
  }
}
