import { afterEach, describe, expect, it, vi } from "vitest";

describe("mobile-app-mode", () => {
  afterEach(() => {
    vi.resetModules();
    delete process.env.EXPO_PUBLIC_MOBILE_VARIANT;
  });

  it("기본 모드는 익명친구 앱 모드로 분기한다", async () => {
    const { MOBILE_APP_VARIANT, isAnonymousApp, isCardApp } =
      await import("./mobile-app-mode");

    expect(MOBILE_APP_VARIANT).toBe("anonymous");
    expect(isAnonymousApp).toBe(true);
    expect(isCardApp).toBe(false);
  });

  it("card 값일 때 카드서비스 모드로 분기한다", async () => {
    process.env.EXPO_PUBLIC_MOBILE_VARIANT = "card";
    vi.resetModules();

    const { MOBILE_APP_VARIANT, isAnonymousApp, isCardApp } =
      await import("./mobile-app-mode");

    expect(MOBILE_APP_VARIANT).toBe("card");
    expect(isAnonymousApp).toBe(false);
    expect(isCardApp).toBe(true);
  });

  it("알 수 없는 값은 anonymous로 폴백한다", async () => {
    process.env.EXPO_PUBLIC_MOBILE_VARIANT = "unknown";
    vi.resetModules();

    const { MOBILE_APP_VARIANT, isAnonymousApp, isCardApp } =
      await import("./mobile-app-mode");

    expect(MOBILE_APP_VARIANT).toBe("anonymous");
    expect(isAnonymousApp).toBe(true);
    expect(isCardApp).toBe(false);
  });
});
