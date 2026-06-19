import { describe, expect, it } from "vitest";
import { extractSpringErrorCode } from "../spring-error";

describe("extractSpringErrorCode", () => {
  it("평면 { code } 에서 추출", () => {
    expect(
      extractSpringErrorCode({
        code: "PHONE_VERIFICATION_EXPIRED",
        message: "만료",
      })
    ).toBe("PHONE_VERIFICATION_EXPIRED");
  });

  it("중첩 { error: { code } } 에서 추출", () => {
    expect(
      extractSpringErrorCode({
        error: { code: "FORBIDDEN", message: "권한 없음" },
      })
    ).toBe("FORBIDDEN");
  });

  it("code가 없으면 undefined", () => {
    expect(extractSpringErrorCode({ message: "오류만" })).toBeUndefined();
  });

  it("code가 문자열이 아니면 undefined", () => {
    expect(extractSpringErrorCode({ code: 500 })).toBeUndefined();
  });

  it("객체가 아니면 undefined", () => {
    expect(extractSpringErrorCode(null)).toBeUndefined();
    expect(extractSpringErrorCode("문자열")).toBeUndefined();
    expect(extractSpringErrorCode(undefined)).toBeUndefined();
  });
});
