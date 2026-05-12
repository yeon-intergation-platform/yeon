import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateCloudImportDraft = vi.fn();
const mockMarkImportDraftAnalyzing = vi.fn();
const mockSaveImportDraftError = vi.fn();
const mockSaveImportDraftPreview = vi.fn();
const mockSaveImportDraftProcessingState = vi.fn();
const mockGetImportDraftSource = vi.fn();
const mockRunImportCommitInSpring = vi.fn();
const mockRunLocalImportAnalyzeInSpring = vi.fn();
const mockAnalyzeBuffer = vi.fn();
const mockCreateImportSSEStream = vi.fn();

vi.mock("@/server/services/import-drafts-service", () => ({
  createCloudImportDraft: (...args: unknown[]) =>
    mockCreateCloudImportDraft(...args),
  markImportDraftAnalyzing: (...args: unknown[]) =>
    mockMarkImportDraftAnalyzing(...args),
  saveImportDraftError: (...args: unknown[]) =>
    mockSaveImportDraftError(...args),
  saveImportDraftPreview: (...args: unknown[]) =>
    mockSaveImportDraftPreview(...args),
  saveImportDraftProcessingState: (...args: unknown[]) =>
    mockSaveImportDraftProcessingState(...args),
  getImportDraftSource: (...args: unknown[]) =>
    mockGetImportDraftSource(...args),
}));
vi.mock("@/server/services/import-preview-service", async () => {
  const { z } = await import("zod");
  return {
    importPreviewBodySchema: z.object({ cohorts: z.array(z.unknown()) }),
  };
});
vi.mock("@/server/import-commit-spring-client", () => ({
  ImportCommitSpringBackendHttpError: class ImportCommitSpringBackendHttpError extends Error {
    constructor(
      public status: number,
      message: string
    ) {
      super(message);
    }
  },
  runImportCommitInSpring: (...args: unknown[]) =>
    mockRunImportCommitInSpring(...args),
}));
vi.mock("@/server/local-import-analysis-spring-client", () => ({
  LocalImportAnalysisSpringBackendHttpError: class LocalImportAnalysisSpringBackendHttpError extends Error {
    constructor(
      public status: number,
      message: string
    ) {
      super(message);
    }
  },
  runLocalImportAnalyzeInSpring: (...args: unknown[]) =>
    mockRunLocalImportAnalyzeInSpring(...args),
}));
vi.mock("@/server/services/file-analysis-service", () => ({
  analyzeBuffer: (...args: unknown[]) => mockAnalyzeBuffer(...args),
}));
vi.mock("@/server/services/import-stream", () => ({
  createImportSSEStream: (...args: unknown[]) =>
    mockCreateImportSSEStream(...args),
}));
vi.mock("@/features/cloud-import/file-kind", () => ({
  detectFileKind: () => "spreadsheet",
}));
vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
}));

import {
  createOAuthCallbackErrorResponse,
  createOAuthCallbackSuccessResponse,
  handleCloudAnalyzeRoute,
  handleImportCommitRoute,
} from "../_shared";

describe("integrations _shared", () => {
  const env = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...env, NEXT_PUBLIC_APP_URL: "https://yeon.world" };
  });

  it("OAuth callback 성공 응답은 counseling-service student-management로 돌려보낸다", () => {
    const response = createOAuthCallbackSuccessResponse("googledrive");

    expect(response.headers.get("location")).toBe(
      "https://yeon.world/counseling-service/student-management?googledrive_connected=true"
    );
  });

  it("OAuth callback 실패 응답은 counseling-service student-management로 돌려보낸다", () => {
    const response = createOAuthCallbackErrorResponse(
      "onedrive",
      "exchange_failed"
    );

    expect(response.headers.get("location")).toBe(
      "https://yeon.world/counseling-service/student-management?onedrive_error=exchange_failed"
    );
  });

  it("handleImportCommitRoute는 invalid JSON이면 400을 반환한다", async () => {
    const request = new NextRequest(
      "http://localhost/api/v1/integrations/local/import",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{bad json",
      }
    );

    const response = await handleImportCommitRoute({
      request,
      userId: "user-1",
    });

    expect(response.status).toBe(400);
  });

  it("handleImportCommitRoute는 Spring commit 결과를 그대로 반환한다", async () => {
    mockRunImportCommitInSpring.mockResolvedValue({
      created: { spaces: 1, members: 2 },
      spaceIds: ["space-1"],
    });
    const request = new NextRequest(
      "http://localhost/api/v1/integrations/local/import",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          draftId: "550e8400-e29b-41d4-a716-446655440000",
          preview: { cohorts: [] },
        }),
      }
    );

    const response = await handleImportCommitRoute({
      request,
      userId: "user-1",
    });

    expect(mockRunImportCommitInSpring).toHaveBeenCalledWith("user-1", {
      draftId: "550e8400-e29b-41d4-a716-446655440000",
      preview: { cohorts: [] },
    });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      created: { spaces: 1, members: 2 },
      spaceIds: ["space-1"],
    });
  });

  it("handleCloudAnalyzeRoute는 access token이 없으면 401을 반환한다", async () => {
    const request = new NextRequest(
      "http://localhost/api/v1/integrations/googledrive/analyze",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileId: "file-1",
          fileName: "students.xlsx",
          mimeType: "application/vnd.ms-excel",
        }),
      }
    );

    const response = await handleCloudAnalyzeRoute({
      request,
      userId: "user-1",
      provider: "googledrive",
      providerLabel: "Google Drive",
      getAccessToken: async () => null,
      downloadFile: async () => Buffer.from(""),
      requireMimeType: true,
    });

    expect(response.status).toBe(401);
  });

  it("handleCloudAnalyzeRoute는 draftId 복구를 Spring 분석으로 전달한다", async () => {
    mockRunLocalImportAnalyzeInSpring.mockResolvedValue(
      Response.json({ draftId: "draft-1", preview: { cohorts: [] } })
    );
    const request = new NextRequest(
      "http://localhost/api/v1/integrations/googledrive/analyze",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          draftId: "550e8400-e29b-41d4-a716-446655440000",
        }),
      }
    );

    const response = await handleCloudAnalyzeRoute({
      request,
      userId: "user-1",
      provider: "googledrive",
      providerLabel: "Google Drive",
      getAccessToken: async () => "token",
      downloadFile: async () => Buffer.from(""),
      requireMimeType: true,
    });

    expect(response.status).toBe(200);
    expect(mockRunLocalImportAnalyzeInSpring).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1" })
    );
  });

  it("handleCloudAnalyzeRoute는 파일 필수 필드가 없으면 400을 반환한다", async () => {
    const request = new NextRequest(
      "http://localhost/api/v1/integrations/googledrive/analyze",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fileId: "file-1" }),
      }
    );

    const response = await handleCloudAnalyzeRoute({
      request,
      userId: "user-1",
      provider: "googledrive",
      providerLabel: "Google Drive",
      getAccessToken: async () => "token",
      downloadFile: async () => Buffer.from(""),
      requireMimeType: true,
    });

    expect(response.status).toBe(400);
  });

  it("handleCloudAnalyzeRoute는 Spring 분석 실패를 그대로 반환한다", async () => {
    mockRunLocalImportAnalyzeInSpring.mockRejectedValue(
      new Error("지원하지 않는 파일 형식입니다.")
    );
    const request = new NextRequest(
      "http://localhost/api/v1/integrations/googledrive/analyze",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileId: "file-1",
          fileName: "students.xlsx",
          mimeType: "application/vnd.ms-excel",
        }),
      }
    );

    const response = await handleCloudAnalyzeRoute({
      request,
      userId: "user-1",
      provider: "googledrive",
      providerLabel: "Google Drive",
      getAccessToken: async () => "token",
      downloadFile: async () => Buffer.from("xlsx"),
      requireMimeType: true,
    });

    expect(response.status).toBe(500);
  });
});
