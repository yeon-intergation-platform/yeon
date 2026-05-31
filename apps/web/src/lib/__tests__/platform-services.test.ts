import { describe, expect, it } from "vitest";

import { getPlatformServiceBySlug } from "../platform-services";

describe("platform-services", () => {
  it("루트 포털의 공개 서비스 진입 URL은 canonical subdomain을 사용한다", () => {
    expect(getPlatformServiceBySlug("typing-service")?.publicHref).toBe(
      "https://typing.yeon.world"
    );
    expect(getPlatformServiceBySlug("card-service")?.publicHref).toBe(
      "https://card.yeon.world"
    );
    expect(getPlatformServiceBySlug("community")?.publicHref).toBe(
      "https://community.yeon.world"
    );
  });
});
