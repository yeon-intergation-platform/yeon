import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  fetchOneDriveStatusFromSpring,
  OneDriveBrowserSpringBackendHttpError,
} from "@/server/onedrive-browser-spring-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  try {
    const payload = await fetchOneDriveStatusFromSpring(currentUser.id);
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof OneDriveBrowserSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("OneDrive 연결 상태를 확인하지 못했습니다.", 500);
  }
}
