import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CardServiceApiError,
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

  it("401은 상태를 보존한 사용자 인증 만료 오류로 정규화한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ message: "로그인이 필요합니다." }), {
          status: 401,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(
      cardServiceFetchJson(
        "/api/v1/card-decks/dck_1/items/dki_1",
        { method: "PATCH" },
        "카드를 수정하지 못했습니다.",
      ),
    ).rejects.toMatchObject({
      name: "CardServiceApiError",
      status: 401,
      message: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
    } satisfies Partial<CardServiceApiError>);
  });

  it("내부 Spring/backend 문구는 사용자용 fallback으로 숨긴다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({ message: "Spring backend 요청에 실패했습니다." }),
          {
            status: 503,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    await expect(
      cardServiceFetchVoid(
        "/api/v1/card-decks/dck_1/items/dki_1",
        { method: "PATCH" },
        "카드를 수정하지 못했습니다.",
      ),
    ).rejects.toMatchObject({
      status: 503,
      message: "카드를 수정하지 못했습니다.",
    } satisfies Partial<CardServiceApiError>);
  });
});
