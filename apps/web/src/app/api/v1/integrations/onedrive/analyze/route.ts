import type { NextRequest } from "next/server";

import { requireAuthenticatedUser } from "@/app/api/v1/counseling-records/_shared";
import { handleCloudAnalyzeRoute } from "@/app/api/v1/integrations/_shared";
import { downloadOneDriveFileFromSpring, OneDriveBrowserSpringBackendHttpError } from "@/server/onedrive-browser-spring-client";
import { ServiceError } from "@/server/errors/service-error";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  return handleCloudAnalyzeRoute({
    request,
    userId: currentUser.id,
    provider: "onedrive",
    providerLabel: "OneDrive",
    getAccessToken: async () => "spring-transport",
    downloadFile: async (_accessToken, fileId, mimeType) => {
      try {
        const downloaded = await downloadOneDriveFileFromSpring({
          userId: currentUser.id,
          fileId,
          mimeType,
        });
        return Buffer.from(downloaded.bytes);
      } catch (error) {
        if (error instanceof OneDriveBrowserSpringBackendHttpError) {
          throw new ServiceError(error.status, error.message);
        }
        throw error;
      }
    },
    requireMimeType: false,
  });
}
