import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../route";

describe("backend bootstrap health route", () => {
  const originalBaseUrl = process.env.SPRING_BOOTSTRAP_BASE_URL;

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.SPRING_BOOTSTRAP_BASE_URL;
  });

  afterEach(() => {
    if (typeof originalBaseUrl === "string") {
      process.env.SPRING_BOOTSTRAP_BASE_URL = originalBaseUrl;
      return;
    }

    delete process.env.SPRING_BOOTSTRAP_BASE_URL;
  });

  it("backend health가 정상이면 200 응답으로 감싼다", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('{"status":"UP"}', {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      targetUrl: "http://127.0.0.1:8081/actuator/health",
      upstreamStatus: 200,
      upstreamBody: '{"status":"UP"}',
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/actuator/health",
      {
        headers: { accept: "application/json" },
        cache: "no-store",
      }
    );
  });

  it("env base url이 있으면 그 값을 사용한다", async () => {
    process.env.SPRING_BOOTSTRAP_BASE_URL = "http://127.0.0.1:9090/";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('{"status":"UP"}', { status: 200 })
    );

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      targetUrl: "http://127.0.0.1:9090/actuator/health",
    });
  });

  it("upstream가 실패하면 502로 감싼다", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('{"status":"DOWN"}', { status: 503 })
    );

    const response = await GET();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      targetUrl: "http://127.0.0.1:8081/actuator/health",
      upstreamStatus: 503,
      upstreamBody: '{"status":"DOWN"}',
    });
  });

  it("fetch 예외가 나면 502와 메시지를 반환한다", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("connect ECONNREFUSED")
    );

    const response = await GET();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      targetUrl: "http://127.0.0.1:8081/actuator/health",
      message: "connect ECONNREFUSED",
    });
  });
});
