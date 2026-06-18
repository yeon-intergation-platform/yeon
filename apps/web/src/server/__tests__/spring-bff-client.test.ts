import { afterEach, describe, expect, it } from "vitest";
import { buildSpringBffHeaders } from "../spring-bff-client";

describe("spring-bff-client", () => {
  const originalSpringInternalToken = process.env.SPRING_INTERNAL_TOKEN;

  afterEach(() => {
    restoreEnv("SPRING_INTERNAL_TOKEN", originalSpringInternalToken);
  });

  it("요청별 헤더를 보존하면서 BFF 인증 헤더를 단일 규칙으로 주입한다", () => {
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";

    const headers = buildSpringBffHeaders(
      {
        "content-type": "application/json",
        "X-Yeon-Internal-Token": "wrong-token",
        "X-Yeon-User-Id": "wrong-user",
      },
      { userId: "00000000-0000-0000-0000-000000000001" }
    );

    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("X-Yeon-User-Id")).toBe(
      "00000000-0000-0000-0000-000000000001"
    );
    expect(headers.get("X-Yeon-Internal-Token")).toBe("internal-token");
  });

  it("비운영 단독 실행에서는 dev:all과 같은 Spring 내부 토큰을 기본값으로 쓴다", () => {
    delete process.env.SPRING_INTERNAL_TOKEN;

    const headers = buildSpringBffHeaders();

    expect(headers.get("X-Yeon-Internal-Token")).toBe(
      "local-dev-internal-token"
    );
  });
});

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
