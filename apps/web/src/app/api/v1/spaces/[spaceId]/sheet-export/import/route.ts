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
import {
  importSpaceFromLinkedSheet,
  type SheetImportResult,
} from "@/server/sheet-export-bff";
import { ServiceError } from "@/server/services/service-error";

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
      return jsonError(
        "연동된 시트가 없어 수강생 데이터를 가져올 수 없습니다.",
        404
      );
    }

    const result = await importSpaceFromLinkedSheet(
      spaceId,
      integration.sheetId,
      currentUser.id
    );

    return NextResponse.json(
      {
        status: result.status,
        summary: result.summary,
        conflicts: result.conflicts,
        lastSyncedAt: result.lastSyncedAt?.toISOString() ?? null,
      } satisfies Omit<SheetImportResult, "lastSyncedAt"> & {
        lastSyncedAt: string | null;
      },
      { status: result.status === "blocked" ? 409 : 200 }
    );
  } catch (error) {
    if (error instanceof SheetExportSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError(
      "연동된 시트에서 수강생 데이터를 가져오지 못했습니다.",
      500
    );
  }
}
