import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockParseJsonBody = vi.fn();
const mockVerifyChatServiceOtpInSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  CHAT_SERVICE_SESSION_COOKIE_NAME: "chat-service-session",
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
  verifyChatServiceOtpInSpring: (...args: unknown[]) =>
    mockVerifyChatServiceOtpInSpring(...args),
}));

import { POST } from "../route";

const body = {
  challengeId: "11111111-1111-4111-8111-111111111111",
  phoneNumber: "01012345678",
  code: "123456",
};

describe("chat-service verify-otp route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Spring OTP 검증 후 session cookie를 설정한다", async () => {
    mockParseJsonBody.mockResolvedValue(body);
    mockVerifyChatServiceOtpInSpring.mockResolvedValue({
      session: {
        token: "a".repeat(32),
        expiresAt: "2026-05-08T10:00:00.000Z",
        user: {
          id: "11111111-1111-4111-8111-111111111111",
          nickname: "닉",
          ageLabel: "20세",
          regionLabel: "서울",
          avatarUrl: null,
          bio: "소개",
          points: 900,
        },
      },
    });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/chat-service/auth/verify-otp", {
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain(
      "chat-service-session="
    );
    expect(mockVerifyChatServiceOtpInSpring).toHaveBeenCalledWith(body);
  });
});
