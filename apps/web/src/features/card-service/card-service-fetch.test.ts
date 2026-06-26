import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CardServiceApiError,
  cardServiceFetchJson,
  cardServiceFetchVoid,
  listServerCardDecksOrNull,
  uploadCardDeckImage,
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
        })
      )
    );

    await expect(
      cardServiceFetchJson(
        "/api/v1/card-decks/dck_1/items/dki_1",
        { method: "PATCH" },
        "카드를 수정하지 못했습니다."
      )
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
          }
        )
      )
    );

    await expect(
      cardServiceFetchVoid(
        "/api/v1/card-decks/dck_1/items/dki_1",
        { method: "PATCH" },
        "카드를 수정하지 못했습니다."
      )
    ).rejects.toMatchObject({
      status: 503,
      message: "카드를 수정하지 못했습니다.",
    } satisfies Partial<CardServiceApiError>);
  });

  it("덱 목록 조회의 비인증 401은 게스트 fallback을 위해 null을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 401 }))
    );

    await expect(listServerCardDecksOrNull()).resolves.toBeNull();
  });

  it("덱 목록 조회의 비정상 응답은 status/code/message를 보존한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "CARD_DECK_LIST_UNAVAILABLE",
            message: "덱 목록을 잠시 불러올 수 없습니다.",
          }),
          { status: 503, headers: { "content-type": "application/json" } }
        )
      )
    );

    await expect(listServerCardDecksOrNull()).rejects.toMatchObject({
      name: "CardServiceApiError",
      status: 503,
      code: "CARD_DECK_LIST_UNAVAILABLE",
      message: "덱 목록을 잠시 불러올 수 없습니다.",
    } satisfies Partial<CardServiceApiError>);
  });
});

describe("uploadCardDeckImage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("file 필드로 multipart POST를 /api/v1/card-decks/assets에 보내고 응답을 반환한다", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          storageKey: "card-service/images/abc.png",
          imageUrl: "/api/v1/card-decks/assets/card-service%2Fimages%2Fabc.png",
        }),
        { status: 201, headers: { "content-type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const file = new File([new Uint8Array([1, 2, 3])], "photo.png", {
      type: "image/png",
    });

    await expect(uploadCardDeckImage(file)).resolves.toEqual({
      storageKey: "card-service/images/abc.png",
      imageUrl: "/api/v1/card-decks/assets/card-service%2Fimages%2Fabc.png",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/card-decks/assets");
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");

    const body = init?.body as FormData;
    expect(body).toBeInstanceOf(FormData);
    const uploaded = body.get("file");
    expect(uploaded).toBeInstanceOf(File);
    expect((uploaded as File).name).toBe("photo.png");
  });

  it("백엔드가 5MB 초과로 400을 주면 상태와 메시지를 보존해 던진다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "CARD_ASSET_TOO_LARGE",
            message: "이미지는 5MB 이하만 업로드할 수 있습니다.",
          }),
          { status: 400, headers: { "content-type": "application/json" } }
        )
      )
    );

    const file = new File([new Uint8Array([1])], "huge.png", {
      type: "image/png",
    });

    await expect(uploadCardDeckImage(file)).rejects.toMatchObject({
      name: "CardServiceApiError",
      status: 400,
      message: "이미지는 5MB 이하만 업로드할 수 있습니다.",
    } satisfies Partial<CardServiceApiError>);
  });
});
