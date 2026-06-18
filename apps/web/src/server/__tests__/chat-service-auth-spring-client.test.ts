import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchChatServiceSessionFromSpring,
  resolveChatServiceGuestProfileInSpring,
} from "../chat-service-auth-spring-client";

describe("chat-service-auth-spring-client", () => {
  const originalSpringBackendBaseUrl = process.env.SPRING_BACKEND_BASE_URL;
  const originalSpringInternalToken = process.env.SPRING_INTERNAL_TOKEN;

  afterEach(() => {
    vi.unstubAllGlobals();
    restoreEnv("SPRING_BACKEND_BASE_URL", originalSpringBackendBaseUrl);
    restoreEnv("SPRING_INTERNAL_TOKEN", originalSpringInternalToken);
  });

  it("게스트 프로필 생성/조회 요청에 Spring BFF 인증 헤더를 보낸다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: "profile-1" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await resolveChatServiceGuestProfileInSpring({
      guestNickname: "닉네임",
      guestPassword: "password",
    });

    const [rawUrl, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(String(rawUrl)).toBe(
      "http://spring.test/chat-service/auth/guest-profile"
    );
    expect(init?.method).toBe("POST");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("X-Yeon-Internal-Token")).toBe("internal-token");
  });

  it("세션 조회 요청은 세션 토큰과 Spring BFF 인증 헤더를 함께 보낸다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ profile: null }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchChatServiceSessionFromSpring("session-token");

    const [rawUrl, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(String(rawUrl)).toBe("http://spring.test/chat-service/auth/session");
    expect(init?.method).toBe("GET");
    expect(headers.get("X-Yeon-Chat-Session-Token")).toBe("session-token");
    expect(headers.get("X-Yeon-Internal-Token")).toBe("internal-token");
  });
});

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
