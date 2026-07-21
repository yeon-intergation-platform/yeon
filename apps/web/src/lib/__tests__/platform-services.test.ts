import { describe, expect, it } from "vitest";
import {
  getPlatformServiceBySlug,
  getPlatformServicesForRequest,
  resolvePlatformServiceEntryHref,
} from "../platform-services";

describe("platform-services", () => {
  it("루트 포털의 운영 공개 서비스 URL은 canonical subdomain을 유지한다", () => {
    expect(getPlatformServiceBySlug("typing-service")?.publicHref).toBe(
      "https://typing.yeon.world"
    );
    expect(getPlatformServiceBySlug("card-service")?.publicHref).toBe(
      "https://card.yeon.world"
    );
    expect(getPlatformServiceBySlug("community")?.publicHref).toBe(
      "https://community.yeon.world"
    );
    expect(getPlatformServiceBySlug("todo-service")?.publicHref).toBe(
      "https://todo.yeon.world"
    );
    expect(getPlatformServiceBySlug("news")?.publicHref).toBe(
      "https://news.yeon.world"
    );
  });

  it("운영 apex host에서만 서비스 카드 진입 URL을 canonical subdomain으로 resolve한다", () => {
    const card = getPlatformServiceBySlug("card-service");
    expect(card).not.toBeNull();

    expect(resolvePlatformServiceEntryHref(card!, "yeon.world")).toBe(
      "https://card.yeon.world"
    );
    expect(resolvePlatformServiceEntryHref(card!, "www.yeon.world")).toBe(
      "https://card.yeon.world"
    );
  });

  it("localhost/dev host에서는 서비스 카드 진입 URL을 내부 path로 resolve한다", () => {
    const card = getPlatformServiceBySlug("card-service");
    expect(card).not.toBeNull();

    expect(resolvePlatformServiceEntryHref(card!, "localhost:3000")).toBe(
      "/card-service"
    );
    expect(resolvePlatformServiceEntryHref(card!, "127.0.0.1:3000")).toBe(
      "/card-service"
    );
    expect(resolvePlatformServiceEntryHref(card!, "dev.yeon.world")).toBe(
      "/card-service"
    );
  });

  it("요청 host 기준 서비스 목록은 publicHref만 안전하게 치환한다", () => {
    const services = getPlatformServicesForRequest("localhost:3000");

    expect(
      services.find((service) => service.slug === "typing-service")?.publicHref
    ).toBe("/typing-service");
    expect(
      services.find((service) => service.slug === "card-service")?.publicHref
    ).toBe("/card-service");
    expect(
      services.find((service) => service.slug === "community")?.publicHref
    ).toBe("/community");
    expect(
      services.find((service) => service.slug === "todo-service")?.publicHref
    ).toBe("/today");
    expect(
      services.find((service) => service.slug === "news")?.publicHref
    ).toBe("https://news.yeon.world");
  });
});
