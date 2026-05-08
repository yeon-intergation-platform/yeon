import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import { GoogleDriveBrowserSpringBackendHttpError, downloadGoogleDriveFileFromSpring } from "@/server/googledrive-browser-spring-client";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { fileId } = await params;
  const mimeType = request.nextUrl.searchParams.get("mimeType") ?? "";

  try {
    const downloaded = await downloadGoogleDriveFileFromSpring({
      userId: currentUser.id,
      fileId,
      mimeType,
    });

    const body = Buffer.from(downloaded.bytes);

    return new NextResponse(body, {
      headers: {
        "Content-Type": downloaded.contentType,
        "Content-Length": String(body.byteLength),
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    if (error instanceof GoogleDriveBrowserSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error("Google Drive 파일 프록시 오류:", error);
    return jsonError("파일을 가져오지 못했습니다.", 500);
  }
}
