import { describe, expect, it } from "vitest";
import { errorResponseSchema } from "../error";

describe("errorResponseSchema", () => {
  it("message만 있어도 통과(하위호환)", () => {
    const parsed = errorResponseSchema.parse({ message: "오류" });
    expect(parsed).toEqual({ message: "오류" });
  });

  it("code + message 기본형", () => {
    const parsed = errorResponseSchema.parse({
      code: "PHONE_VERIFICATION_EXPIRED",
      message: "인증 시간이 만료되었습니다.",
    });
    expect(parsed.code).toBe("PHONE_VERIFICATION_EXPIRED");
  });

  it("상황별 확장 메타데이터를 모두 받는다", () => {
    const parsed = errorResponseSchema.parse({
      code: "INVALID_STATE_TRANSITION",
      message: "현재 상태에서는 제출할 수 없습니다.",
      details: { field: "phoneNumber", reason: "invalid_format" },
      currentState: "DRAFT",
      requiredState: "READY_TO_SUBMIT",
      failedCondition: "phone_verification_completed",
      blockedAction: "ACCOUNT_SIGN_UP",
      actionGuide: "인증번호를 입력해 인증을 완료해 주세요.",
    });
    expect(parsed.currentState).toBe("DRAFT");
    expect(parsed.requiredState).toBe("READY_TO_SUBMIT");
    expect(parsed.failedCondition).toBe("phone_verification_completed");
    expect(parsed.blockedAction).toBe("ACCOUNT_SIGN_UP");
    expect(parsed.actionGuide).toBe("인증번호를 입력해 인증을 완료해 주세요.");
    expect(parsed.details).toEqual({
      field: "phoneNumber",
      reason: "invalid_format",
    });
  });

  it("message가 없으면 거부", () => {
    expect(errorResponseSchema.safeParse({ code: "X" }).success).toBe(false);
  });

  it("code 타입이 문자열이 아니면 거부", () => {
    expect(
      errorResponseSchema.safeParse({ code: 123, message: "오류" }).success
    ).toBe(false);
  });
});
