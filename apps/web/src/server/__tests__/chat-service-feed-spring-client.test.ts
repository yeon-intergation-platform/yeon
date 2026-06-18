import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createChatServiceFeedPostInSpring,
  fetchChatServiceFeedFromSpring,
} from "../chat-service-feed-spring-client";

describe("chat-service-feed-spring-client", () => {
  const originalSpringBackendBaseUrl = process.env.SPRING_BACKEND_BASE_URL;
  const originalSpringInternalToken = process.env.SPRING_INTERNAL_TOKEN;
  const profileId = "00000000-0000-4000-8000-000000000001";

  afterEach(() => {
    vi.unstubAllGlobals();
    restoreEnv("SPRING_BACKEND_BASE_URL", originalSpringBackendBaseUrl);
    restoreEnv("SPRING_INTERNAL_TOKEN", originalSpringInternalToken);
  });

  it("feed 목록 조회에 Spring BFF 인증 헤더와 현재 프로필 헤더를 함께 보낸다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ posts: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchChatServiceFeedFromSpring(profileId);

    const [rawUrl, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(String(rawUrl)).toBe("http://spring.test/chat-service/feed");
    expect(init?.cache).toBe("no-store");
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("X-Yeon-Chat-Profile-Id")).toBe(profileId);
    expect(headers.get("X-Yeon-Internal-Token")).toBe("internal-token");
  });

  it("feed 생성 요청에서도 content-type과 Spring BFF 인증 헤더를 유지한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          post: {
            id: "post-1",
            body: "본문",
          },
        }),
        {
          status: 201,
          headers: { "content-type": "application/json" },
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await createChatServiceFeedPostInSpring({
      currentProfileId: profileId,
      body: "본문",
    });

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(init?.method).toBe("POST");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("X-Yeon-Chat-Profile-Id")).toBe(profileId);
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
