import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockIsDevLoginAllowed = vi.fn();
const mockVerifyDevLoginRequestSecret = vi.fn();
const mockCreateDevLoginSession = vi.fn();
const mockApplyAuthSessionCookie = vi.fn();

vi.mock("@/server/auth/dev-login", () => ({
  isDevLoginAllowed: (...args: unknown[]) => mockIsDevLoginAllowed(...args),
  verifyDevLoginRequestSecret: (...args: unknown[]) =>
    mockVerifyDevLoginRequestSecret(...args),
  createDevLoginSession: (...args: unknown[]) =>
    mockCreateDevLoginSession(...args),
}));

vi.mock("@/server/auth/session", () => ({
  applyAuthSessionCookie: (...args: unknown[]) =>
    mockApplyAuthSessionCookie(...args),
}));
import { GET } from "../route";

describe("api/auth/dev-login route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDevLoginAllowed.mockReturnValue(true);
    mockVerifyDevLoginRequestSecret.mockReturnValue(true);
    mockCreateDevLoginSession.mockResolvedValue({
      sessionToken: "dev-session-token",
      expiresAt: new Date("2026-04-13T10:00:00.000Z"),
    });
    mockApplyAuthSessionCookie.mockImplementation(
      (response: Response) => response
    );
  });

  it("로컬 dev-login이 비활성화되면 404를 반환한다", async () => {
    mockIsDevLoginAllowed.mockReturnValue(false);

    const response = await GET(
      new NextRequest("https://yeon.world/api/auth/dev-login")
    );

    expect(response.status).toBe(404);
    expect(mockIsDevLoginAllowed).toHaveBeenCalled();
  });

  it("account가 없으면 Spring dev-login 세션으로 루트 경로에 리다이렉트한다", async () => {
    const response = await GET(
      new NextRequest("https://yeon.world/api/auth/dev-login")
    );

    expect(mockIsDevLoginAllowed).toHaveBeenCalled();
    expect(mockCreateDevLoginSession).toHaveBeenCalledWith({
      accountKey: null,
      create: false,
    });
    expect(mockApplyAuthSessionCookie).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://yeon.world/");
  });

  it("선택한 account가 있으면 Spring에 선택값을 넘기고 next 경로에 리다이렉트한다", async () => {
    const response = await GET(
      new NextRequest(
        "https://yeon.world/api/auth/dev-login?account=user-1&next=%2Fhome%3Ftab%3Drecords"
      )
    );

    expect(mockCreateDevLoginSession).toHaveBeenCalledWith({
      accountKey: "user-1",
      create: false,
    });
    expect(response.headers.get("location")).toBe("https://yeon.world/");
  });

  it("create=1이면 Spring에 계정 생성 세션을 요청한다", async () => {
    const response = await GET(
      new NextRequest(
        "https://yeon.world/api/auth/dev-login?create=1&next=%2Fhome%3Ftab%3Dspaces"
      )
    );

    expect(mockCreateDevLoginSession).toHaveBeenCalledWith({
      accountKey: null,
      create: true,
    });
    expect(response.headers.get("location")).toBe("https://yeon.world/");
  });

  it("Spring이 선택한 account를 찾지 못하면 404 오류를 반환한다", async () => {
    mockCreateDevLoginSession.mockRejectedValue(new Error("not found"));

    const response = await GET(
      new NextRequest(
        "https://yeon.world/api/auth/dev-login?account=missing-user"
      )
    );

    expect(mockIsDevLoginAllowed).toHaveBeenCalled();
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "선택한 테스트 계정을 찾지 못했습니다.",
    });
  });

  it("DEV_LOGIN_SECRET 검증을 통과하지 못하면 404를 반환한다", async () => {
    mockVerifyDevLoginRequestSecret.mockReturnValue(false);

    const response = await GET(
      new NextRequest("https://yeon.world/api/auth/dev-login")
    );

    expect(response.status).toBe(404);
    expect(mockVerifyDevLoginRequestSecret).toHaveBeenCalled();
    expect(mockCreateDevLoginSession).not.toHaveBeenCalled();
  });
});
