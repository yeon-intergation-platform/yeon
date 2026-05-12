import { afterEach, describe, expect, it, vi } from "vitest";

import { createCardDeckInSpring } from "../card-decks-spring-client";

describe("card-decks-spring-client", () => {
  const originalSpringBackendBaseUrl = process.env.SPRING_BACKEND_BASE_URL;
  const originalSpringInternalToken = process.env.SPRING_INTERNAL_TOKEN;

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.SPRING_BACKEND_BASE_URL = originalSpringBackendBaseUrl;
    process.env.SPRING_INTERNAL_TOKEN = originalSpringInternalToken;
  });

  it("POST 요청에서도 Spring BFF 인증 헤더를 유지한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ deck: { id: "dck_1" } }), {
        status: 201,
        headers: { "content-type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await createCardDeckInSpring("00000000-0000-0000-0000-000000000001", {
      title: "새 덱",
      description: "",
    });

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("X-Yeon-User-Id")).toBe(
      "00000000-0000-0000-0000-000000000001"
    );
    expect(headers.get("X-Yeon-Internal-Token")).toBe("internal-token");
  });
});
