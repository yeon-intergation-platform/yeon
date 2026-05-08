import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  fetchSheetExportIntegrationFromSpring,
  upsertSheetExportIntegrationInSpring,
  deleteSheetExportIntegrationInSpring,
  SheetExportSpringBackendHttpError,
} from "@/server/sheet-export-spring-client";

export const runtime = "nodejs";

const createExportBodySchema = z.object({
  sheetUrl: z.string().url(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId } = await params;

  try {
    const result = await fetchSheetExportIntegrationFromSpring(
      spaceId,
      currentUser.id,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SheetExportSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("시트 익스포트 설정을 불러오지 못했습니다.", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = createExportBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("요청 데이터가 올바르지 않습니다.", 400);
  }

  try {
    const result = await upsertSheetExportIntegrationInSpring(
      spaceId,
      currentUser.id,
      { sheetUrl: parsed.data.sheetUrl },
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof SheetExportSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("시트 익스포트 연동을 저장하지 못했습니다.", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId } = await params;

  try {
    const result = await deleteSheetExportIntegrationInSpring(
      spaceId,
      currentUser.id,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SheetExportSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("시트 익스포트 연동을 해제하지 못했습니다.", 500);
  }
}
