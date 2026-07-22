import { describe, expect, it, vi } from "vitest";
import { createTodayApiClient, TodayApiError } from "@yeon/api-client";

describe("Today API client", () => {
  it("서버 오류의 HTTP 상태와 오류 코드를 보존한다", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "TODAY_VERSION_CONFLICT",
          message: "새로고침 후 다시 시도해주세요.",
        }),
        {
          status: 409,
          headers: { "content-type": "application/json" },
        }
      )
    );
    const client = createTodayApiClient({ fetch: fetchMock });

    await expect(
      client.completeTask("550e8400-e29b-41d4-a716-446655440000", {
        version: 2,
      })
    ).rejects.toMatchObject({
      name: "TodayApiError",
      status: 409,
      code: "TODAY_VERSION_CONFLICT",
      message: "새로고침 후 다시 시도해주세요.",
    } satisfies Partial<TodayApiError>);
  });

  it("JSON이 아닌 오류 응답도 상태를 보존하고 안전한 메시지를 사용한다", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("bad gateway", { status: 502 }));
    const client = createTodayApiClient({ fetch: fetchMock });

    await expect(
      client.deleteTask("550e8400-e29b-41d4-a716-446655440000", 1)
    ).rejects.toMatchObject({
      name: "TodayApiError",
      status: 502,
      code: undefined,
      message: "Today 요청을 처리하지 못했습니다.",
    } satisfies Partial<TodayApiError>);
  });
});
