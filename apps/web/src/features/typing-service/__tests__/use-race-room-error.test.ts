import { describe, expect, it } from "vitest";
import { TYPING_ROOM_ERROR_CODE } from "@yeon/race-shared";
import { resolveRoomErrorMessage } from "../use-race-room";

describe("resolveRoomErrorMessage", () => {
  it("code(FULL)가 있으면 locale 메시지로 직접 매핑한다", () => {
    expect(
      resolveRoomErrorMessage(
        { code: TYPING_ROOM_ERROR_CODE.FULL, message: "방이 가득 찼습니다." },
        "ko"
      )
    ).toBe("방이 가득 찼습니다.");
  });

  it("code(STARTED) 매핑", () => {
    expect(
      resolveRoomErrorMessage(
        { code: TYPING_ROOM_ERROR_CODE.STARTED, message: "x" },
        "ko"
      )
    ).toBe("이미 시작된 방입니다.");
  });

  it("영어 locale은 code를 영어 메시지로 — 서버 한글 message가 노출되지 않는다", () => {
    const result = resolveRoomErrorMessage(
      { code: TYPING_ROOM_ERROR_CODE.CLOSED, message: "이미 닫힌 방입니다." },
      "en"
    );
    expect(result).toBe("This room is already closed.");
    expect(/[가-힣]/.test(result)).toBe(false);
  });

  it("REJOIN_ONLY code도 영어 메시지", () => {
    const result = resolveRoomErrorMessage(
      {
        code: TYPING_ROOM_ERROR_CODE.REJOIN_ONLY,
        message: "재접속 대기 중인 방입니다.",
      },
      "en"
    );
    expect(/[가-힣]/.test(result)).toBe(false);
  });

  it("code가 없으면 message 문자열 해석으로 폴백한다", () => {
    expect(resolveRoomErrorMessage({ message: "room is full" }, "ko")).toBe(
      "방이 가득 찼습니다."
    );
    expect(resolveRoomErrorMessage({ message: "already started" }, "ko")).toBe(
      "이미 시작된 방입니다."
    );
  });
});
