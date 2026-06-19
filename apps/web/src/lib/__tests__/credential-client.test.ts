import { describe, expect, it } from "vitest";
import { getAuthErrorCopy } from "@/server/auth/auth-errors";
import {
  CredentialApiError,
  getCredentialErrorMessage,
} from "../credential-client";

describe("getCredentialErrorMessage", () => {
  it("code가 있으면 code별 안내 카피(description)를 쓴다", () => {
    const error = new CredentialApiError(401, "백엔드 원문 메시지", {
      code: "invalid_credentials",
    });
    expect(getCredentialErrorMessage(error, "fallback")).toBe(
      getAuthErrorCopy("invalid_credentials").description
    );
  });

  it("account_locked 등 다른 code도 매핑된다", () => {
    const error = new CredentialApiError(423, "잠김", {
      code: "account_locked",
    });
    expect(getCredentialErrorMessage(error, "fallback")).toBe(
      getAuthErrorCopy("account_locked").description
    );
  });

  it("code가 없으면 에러 message를 그대로 쓴다", () => {
    const error = new CredentialApiError(400, "원문 메시지");
    expect(getCredentialErrorMessage(error, "fallback")).toBe("원문 메시지");
  });

  it("알 수 없는 code는 message로 폴백", () => {
    const error = new CredentialApiError(400, "원문", { code: "정의안된코드" });
    expect(getCredentialErrorMessage(error, "fallback")).toBe("원문");
  });

  it("CredentialApiError가 아니면 fallback", () => {
    expect(getCredentialErrorMessage(new Error("x"), "fallback")).toBe(
      "fallback"
    );
  });
});
