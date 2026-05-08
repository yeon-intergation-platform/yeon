import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  SheetIntegrationsSpringBackendHttpError,
  syncSheetIntegrationInSpring,
} from "@/server/sheet-integrations-spring-client";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string; integrationId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId, integrationId } = await params;

  try {
    const result = await syncSheetIntegrationInSpring(
      spaceId,
      integrationId,
      currentUser.id,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SheetIntegrationsSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("시트 동기화를 처리하지 못했습니다.", 500);
  }
}
