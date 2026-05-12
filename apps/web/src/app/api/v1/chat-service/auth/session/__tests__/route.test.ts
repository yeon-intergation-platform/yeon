import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetchChatServiceSessionFromSpring = vi.fn();
const mockLogoutChatServiceSessionInSpring = vi.fn();

vi.mock("@/app/api/v1/chat-service/_shared", () => ({
  clearChatServiceSessionCookie: (response: Response) => {
    response.headers.append(
      "set-cookie",
      "chat-service-session=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/"
    );
  },
  getChatServiceSessionToken: () => "token",
  jsonChatServiceError: (message: string, status: number) =>
    Response.json({ message }, { status }),
}));

vi.mock("@/server/chat-service-auth-spring-client", () => ({
  ChatServiceAuthSpringBackendHttpError: class ChatServiceAuthSpringBackendHttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  fetchChatServiceSessionFromSpring: (...args: unknown[]) =>
    mockFetchChatServiceSessionFromSpring(...args),
  logoutChatServiceSessionInSpring: (...args: unknown[]) =>
    mockLogoutChatServiceSessionInSpring(...args),
}));

import { DELETE, GET } from "../route";

const sessionResponse = { authenticated: false, session: null };

describe("chat-service session route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Spring session 조회를 호출한다", async () => {
    mockFetchChatServiceSessionFromSpring.mockResolvedValue(sessionResponse);

    const response = await GET(
      new NextRequest("http://localhost/api/v1/chat-service/auth/session")
    );

    expect(response.status).toBe(200);
    expect(mockFetchChatServiceSessionFromSpring).toHaveBeenCalledWith("token");
  });

  it("Spring logout 후 session cookie를 비운다", async () => {
    mockLogoutChatServiceSessionInSpring.mockResolvedValue(sessionResponse);

    const response = await DELETE(
      new NextRequest("http://localhost/api/v1/chat-service/auth/session", {
        method: "DELETE",
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain(
      "chat-service-session="
    );
    expect(mockLogoutChatServiceSessionInSpring).toHaveBeenCalledWith("token");
  });
});
