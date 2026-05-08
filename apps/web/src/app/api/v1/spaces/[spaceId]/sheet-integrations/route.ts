import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  createSheetIntegrationInSpring,
  fetchSheetIntegrationsFromSpring,
  SheetIntegrationsSpringBackendHttpError,
} from "@/server/sheet-integrations-spring-client";

export const runtime = "nodejs";

const createSheetIntegrationBodySchema = z.object({
  sheetUrl: z.string().url(),
  dataType: z.string().min(1).max(30),
  columnMapping: z
    .object({
      nameColumn: z.number().int().min(0).optional(),
      dateColumn: z.number().int().min(0).optional(),
      statusColumn: z.number().int().min(0).optional(),
      typeColumn: z.number().int().min(0).optional(),
    })
    .nullish(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId } = await params;

  try {
    const result = await fetchSheetIntegrationsFromSpring(spaceId, currentUser.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SheetIntegrationsSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("시트 연동 목록을 불러오지 못했습니다.", 500);
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

  const parsed = createSheetIntegrationBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("요청 데이터가 올바르지 않습니다.", 400);
  }

  try {
    const result = await createSheetIntegrationInSpring(spaceId, currentUser.id, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof SheetIntegrationsSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("시트 연동을 추가하지 못했습니다.", 500);
  }
}
