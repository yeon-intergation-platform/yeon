import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  fetchImportDraftFileFromSpring,
  ImportDraftsSpringBackendHttpError,
} from "@/server/import-drafts-spring-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ draftId: string }> }) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;
  const { draftId } = await params;
  try {
    const file = await fetchImportDraftFileFromSpring(currentUser.id, draftId);
    const bytes = Buffer.from(file.base64, 'base64');
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Length': String(bytes.byteLength),
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error) {
    if (error instanceof ImportDraftsSpringBackendHttpError) return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("초안 파일을 불러오지 못했습니다.", 500);
  }
}
