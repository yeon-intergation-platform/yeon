import type { NextRequest } from "next/server";

import { requireAuthenticatedUser } from "@/app/api/v1/counseling-records/_shared";
import { handleOAuthStartRoute } from "@/app/api/v1/integrations/_shared";
import { CloudOAuthSpringBackendHttpError, fetchOneDriveOAuthUrlFromSpring } from "@/server/cloud-oauth-spring-client";
import { ServiceError } from "@/server/services/service-error";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  return handleOAuthStartRoute({
    userId: currentUser.id,
    providerKey: "onedrive",
    getOAuthUrl: async (state) => {
      try {
        const result = await fetchOneDriveOAuthUrlFromSpring(state);
        return result.url;
      } catch (error) {
        if (error instanceof CloudOAuthSpringBackendHttpError) {
          throw new ServiceError(error.status, error.message);
        }
        throw error;
      }
    },
    failureMessage: "OneDrive 인증 URL 생성에 실패했습니다.",
  });
}
