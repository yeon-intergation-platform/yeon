import { describe, expect, it } from "vitest";

import {
  CardRoomsSpringBackendHttpError,
  resolveCardRoomsSpringErrorPayload,
} from "./card-rooms-spring-client";

describe("card rooms Spring BFF error policy", () => {
  it("preserves Spring status, code, and message boundaries", () => {
    const payload = resolveCardRoomsSpringErrorPayload(
      {
        code: "CARD_ROOM_FORBIDDEN",
        message: "참가자 권한이 없습니다.",
      },
      "카드방 요청에 실패했습니다."
    );
    const error = new CardRoomsSpringBackendHttpError(
      403,
      payload.message,
      payload.code
    );

    expect(error.status).toBe(403);
    expect(error.code).toBe("CARD_ROOM_FORBIDDEN");
    expect(error.message).toBe("참가자 권한이 없습니다.");
  });

  it("falls back to the route-specific message when Spring omits a message", () => {
    expect(
      resolveCardRoomsSpringErrorPayload(
        { code: "CARD_ROOM_NOT_FOUND" },
        "카드방을 불러오지 못했습니다."
      )
    ).toEqual({
      code: "CARD_ROOM_NOT_FOUND",
      message: "카드방을 불러오지 못했습니다.",
    });
  });
});
