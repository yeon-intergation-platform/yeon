import { afterEach, describe, expect, it, vi } from "vitest";

import {
  requestTodaySpring,
  resolveTodaySpringBackendBaseUrl,
} from "../today-spring-client";

describe("today-spring-client", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("기본 URL이 비어 있으면 유효한 bootstrap URL을 사용한다", () => {
    expect(
      resolveTodaySpringBackendBaseUrl({
        SPRING_BACKEND_BASE_URL: "   ",
        SPRING_BOOTSTRAP_BASE_URL: " https://backend.example.com/ ",
      })
    ).toBe("https://backend.example.com");
  });

  it("두 URL이 모두 비어 있으면 로컬 Spring 기본 주소를 사용한다", () => {
    expect(
      resolveTodaySpringBackendBaseUrl({
        SPRING_BACKEND_BASE_URL: undefined,
        SPRING_BOOTSTRAP_BASE_URL: "",
      })
    ).toBe("http://127.0.0.1:8081");
  });

  it("Spring 응답이 제한 시간을 넘으면 추적 가능한 504 오류로 변환한다", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener(
              "abort",
              () => reject(init.signal?.reason),
              { once: true }
            );
          })
      )
    );

    const request = requestTodaySpring("user-1", "/today/board", undefined, {
      timeoutMs: 25,
    });
    const assertion = expect(request).rejects.toMatchObject({
      status: 504,
      code: "TODAY_BACKEND_TIMEOUT",
      message: "Today 서버 응답 시간이 초과되었습니다.",
    });

    await vi.advanceTimersByTimeAsync(25);
    await assertion;
  });
});
