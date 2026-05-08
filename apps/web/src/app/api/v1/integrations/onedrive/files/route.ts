import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  fetchOneDriveFilesFromSpring,
  OneDriveBrowserSpringBackendHttpError,
} from "@/server/onedrive-browser-spring-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  const folderId = request.nextUrl.searchParams.get("folderId") ?? undefined;

  try {
    const payload = await fetchOneDriveFilesFromSpring({
      userId: currentUser.id,
      folderId,
    });
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof OneDriveBrowserSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("OneDrive 파일 목록을 불러오지 못했습니다.", 500);
  }
}
