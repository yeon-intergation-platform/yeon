import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LocalImportAnalysisSpringBackendHttpError } from "@/server/local-import-analysis-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockRunLocalImportAnalyzeInSpring = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) =>
    mockRequireAuthenticatedUser(...args),
}));

vi.mock("@/server/local-import-analysis-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/local-import-analysis-spring-client")
  >("@/server/local-import-analysis-spring-client");
  return {
    ...actual,
    runLocalImportAnalyzeInSpring: (...args: unknown[]) =>
      mockRunLocalImportAnalyzeInSpring(...args),
  };
});

import { POST } from "../analyze/route";

describe("local analyze route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("인증 사용자의 multipart 요청을 Spring 분석 API로 전달한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockRunLocalImportAnalyzeInSpring.mockResolvedValue(
      Response.json({ draftId: "draft-1", preview: { cohorts: [] } })
    );

    const form = new FormData();
    form.set("draftId", "draft-1");
    const response = await POST(
      new NextRequest("http://localhost/api/v1/integrations/local/analyze", {
        method: "POST",
        body: form,
        headers: { accept: "application/json" },
      })
    );

    expect(mockRunLocalImportAnalyzeInSpring).toHaveBeenCalledWith({
      userId: "user-1",
      formData: expect.any(FormData),
      accept: "application/json",
    });
    expect(response.status).toBe(200);
  });

  it("Spring 오류 상태를 기존 JSON 오류 shape로 보존한다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockRunLocalImportAnalyzeInSpring.mockRejectedValue(
      new LocalImportAnalysisSpringBackendHttpError(
        400,
        "지원하지 않는 파일 형식입니다."
      )
    );

    const file = new File(["bad"], "archive.zip", { type: "application/zip" });
    const form = new FormData();
    form.set("file", file);

    const response = await POST(
      new NextRequest("http://localhost/api/v1/integrations/local/analyze", {
        method: "POST",
        body: form,
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "지원하지 않는 파일 형식입니다.",
    });
  });
});
