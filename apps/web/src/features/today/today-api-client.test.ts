import { describe, expect, it, vi } from "vitest";
import { createTodayApiClient, TodayApiError } from "@yeon/api-client";

describe("Today API client", () => {
  const activityType = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "휴식",
    colorToken: "yellow",
    iconKey: "coffee",
    sortOrder: 0,
    active: true,
    version: 0,
  } as const;

  function recordResponse(
    slotOverrides: Record<string, unknown> = {}
  ): Record<string, unknown> {
    return {
      date: "2026-07-22",
      slots: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        activityType: null,
        note: null,
        entries: [],
        ...(hour === 18 ? slotOverrides : {}),
      })),
      summary: {
        recordedHours: Object.keys(slotOverrides).length ? 1 : 0,
        recordRate: Object.keys(slotOverrides).length ? 4 : 0,
        activityMinutes: {},
      },
    };
  }

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

  it("기록 순서를 포함해 특정 시간 기록을 수정한다", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json(
        recordResponse({
          activityType,
          note: "커피 마시기",
          entries: [
            {
              entryIndex: 1,
              activityType,
              note: "커피 마시기",
            },
          ],
        })
      )
    );
    const client = createTodayApiClient({ fetch: fetchMock });

    await client.upsertRecordSlot("2026-07-22", 18, {
      activityTypeId: activityType.id,
      entryIndex: 1,
      note: "커피 마시기",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/today/records/2026-07-22/slots/18",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          activityTypeId: activityType.id,
          note: "커피 마시기",
          entryIndex: 1,
        }),
      })
    );
  });

  it("기록 순서를 쿼리에 포함해 항목 하나만 삭제한다", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(recordResponse()));
    const client = createTodayApiClient({ fetch: fetchMock });

    await client.deleteRecordSlot("2026-07-22", 18, 0);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/today/records/2026-07-22/slots/18?entryIndex=0",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("구버전 서버 응답은 첫 기록을 유지하며 entries 기본값을 채운다", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json(
        recordResponse({
          activityType,
          note: "산책",
        })
      )
    );
    const client = createTodayApiClient({ fetch: fetchMock });

    const result = await client.getRecord("2026-07-22");

    expect(result.slots[18]).toMatchObject({
      activityType,
      note: "산책",
      entries: [],
    });
  });
});
