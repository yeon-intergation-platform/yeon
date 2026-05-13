import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatServiceReportSpringBackendHttpError } from "@/server/chat-service-report-spring-client";
import { ServiceError } from "@/server/errors/service-error";

const mockRequireChatServiceAuth = vi.fn();
const mockParseJsonBody = vi.fn();
const mockCreateChatServiceReportInSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  jsonChatServiceError: (message: string, status: number) => Response.json({ message }, { status }),
  parseJsonBody: (...args: unknown[]) => mockParseJsonBody(...args),
  requireChatServiceAuth: (...args: unknown[]) => mockRequireChatServiceAuth(...args),
}));

vi.mock("@/server/chat-service-report-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/chat-service-report-spring-client")>("@/server/chat-service-report-spring-client");
  return {
    ...actual,
    createChatServiceReportInSpring: (...args: unknown[]) => mockCreateChatServiceReportInSpring(...args),
  };
});

import { POST } from "../route";

describe("chat-service reports route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalid body면 400을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ targetType: "bad" });
    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/reports", { method: "POST" }));
    expect(response.status).toBe(400);
  });

  it("Spring 신고 응답을 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ targetType: "profile", targetId: "22222222-2222-4222-8222-222222222222", reason: "사유" });
    mockCreateChatServiceReportInSpring.mockResolvedValue({ report: { id: "33333333-3333-4333-8333-333333333333", targetType: "profile", targetId: "22222222-2222-4222-8222-222222222222", reason: "사유", status: "received", createdAt: "2026-05-01T00:00:00Z" } });
    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/reports", { method: "POST" }));
    expect(mockCreateChatServiceReportInSpring).toHaveBeenCalledWith({ currentProfileId: "11111111-1111-4111-8111-111111111111", targetType: "profile", targetId: "22222222-2222-4222-8222-222222222222", reason: "사유" });
    expect(response.status).toBe(201);
  });

  it("Spring 오류를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockResolvedValue({ profile: { id: "11111111-1111-4111-8111-111111111111" } });
    mockParseJsonBody.mockResolvedValue({ targetType: "profile", targetId: "22222222-2222-4222-8222-222222222222", reason: "사유" });
    mockCreateChatServiceReportInSpring.mockRejectedValue(new ChatServiceReportSpringBackendHttpError(404, "신고 대상 프로필을 찾지 못했습니다."));
    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/reports", { method: "POST" }));
    expect(response.status).toBe(404);
  });

  it("auth ServiceError를 그대로 반환한다", async () => {
    mockRequireChatServiceAuth.mockRejectedValue(new ServiceError(401, "chat-service 로그인이 필요합니다."));
    const response = await POST(new NextRequest("http://localhost/api/v1/chat-service/reports", { method: "POST" }));
    expect(response.status).toBe(401);
  });
});
