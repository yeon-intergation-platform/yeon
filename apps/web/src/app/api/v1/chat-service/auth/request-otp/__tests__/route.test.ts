import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockParseJsonBody = vi.fn();
const mockRequestChatServiceOtpInSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  jsonChatServiceError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  parseJsonBody: (...args: unknown[]) => mockParseJsonBody(...args),
}));

vi.mock("@/server/chat-service-auth-spring-client", () => ({
  ChatServiceAuthSpringBackendHttpError: class ChatServiceAuthSpringBackendHttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  requestChatServiceOtpInSpring: (...args: unknown[]) =>
    mockRequestChatServiceOtpInSpring(...args),
}));
import { POST } from "../route";

describe("chat-service request-otp route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Spring OTP 요청을 호출한다", async () => {
    mockParseJsonBody.mockResolvedValue({ phoneNumber: "01012345678" });
    mockRequestChatServiceOtpInSpring.mockResolvedValue({
      challengeId: "11111111-1111-4111-8111-111111111111",
      expiresAt: "2026-05-08T10:00:00.000Z",
      acceptAnyCode: true,
      debugCode: null,
    });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/auth/request-otp", {
        method: "POST",
      })
    );

    expect(response.status).toBe(201);
    expect(mockRequestChatServiceOtpInSpring).toHaveBeenCalledWith({
      phoneNumber: "01012345678",
    });
  });
});
