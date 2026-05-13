import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  fetchSheetExportIntegrationFromSpring,
  SheetExportSpringBackendHttpError,
} from "@/server/sheet-export-spring-client";
import { exportSpaceToSheet } from "@/server/sheet-export-bff";
import { ServiceError } from "@/server/errors/service-error";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId } = await params;

  try {
    const { integration } = await fetchSheetExportIntegrationFromSpring(
      spaceId,
      currentUser.id
    );

    if (!integration) {
      return jsonError("연동된 익스포트 시트가 없습니다.", 404);
    }

    const result = await exportSpaceToSheet(
      spaceId,
      integration.sheetId,
      currentUser.id
    );

    return NextResponse.json({
      exported: result.exported,
      lastSyncedAt: result.lastSyncedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof SheetExportSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("시트에 반영하지 못했습니다.", 500);
  }
}
