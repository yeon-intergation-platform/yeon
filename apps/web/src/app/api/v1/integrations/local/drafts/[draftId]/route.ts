import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import { importPreviewBodySchema } from "@/server/services/import-preview-service";
import {
  deleteImportDraftInSpring,
  fetchImportDraftFromSpring,
  ImportDraftsSpringBackendHttpError,
  patchImportDraftPreviewInSpring,
} from "@/server/import-drafts-spring-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ draftId: string }> }) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;
  const { draftId } = await params;
  try {
    const draft = await fetchImportDraftFromSpring(currentUser.id, draftId);
    return NextResponse.json(draft);
  } catch (error) {
    if (error instanceof ImportDraftsSpringBackendHttpError) return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("가져오기 초안을 불러오지 못했습니다.", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ draftId: string }> }) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;
  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400); }
  const parsed = importPreviewBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("요청 데이터가 올바르지 않습니다.", 400);
  const { draftId } = await params;
  try {
    const result = await patchImportDraftPreviewInSpring(currentUser.id, draftId, { preview: parsed.data, status: 'edited' });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ImportDraftsSpringBackendHttpError) return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("가져오기 초안을 저장하지 못했습니다.", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ draftId: string }> }) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;
  const { draftId } = await params;
  try {
    const result = await deleteImportDraftInSpring(currentUser.id, draftId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ImportDraftsSpringBackendHttpError) return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("가져오기 초안을 삭제하지 못했습니다.", 500);
  }
}
