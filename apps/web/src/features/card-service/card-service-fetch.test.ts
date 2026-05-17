import { afterEach, describe, expect, it, vi } from "vitest";

import {
  cardServiceFetchJson,
  cardServiceFetchVoid,
} from "./card-service-fetch";

describe("card-service-fetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("JSON 요청은 호출자가 credentials를 잘못 넘겨도 인증 쿠키 포함을 유지한다", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      cardServiceFetchJson<{ ok: boolean }>(
        "/api/v1/card-decks/dck_1",
        { credentials: "omit" },
        "덱을 불러오지 못했습니다."
      )
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/card-decks/dck_1", {
      credentials: "include",
    });
  });

  it("void 요청도 인증 쿠키 포함을 유지한다", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      cardServiceFetchVoid(
        "/api/v1/card-decks/dck_1/items/dki_1",
        { method: "DELETE", credentials: "omit" },
        "카드를 삭제하지 못했습니다."
      )
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/card-decks/dck_1/items/dki_1",
      {
        method: "DELETE",
        credentials: "include",
      }
    );
  });
});
