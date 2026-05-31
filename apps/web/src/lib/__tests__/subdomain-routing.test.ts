import { describe, expect, it } from "vitest";

import { resolveServiceSubdomainRewritePath } from "../subdomain-routing";

describe("subdomain-routing", () => {
  it("서비스 subdomain 루트를 기존 서비스 path로 rewrite한다", () => {
    expect(
      resolveServiceSubdomainRewritePath({
        host: "typing.yeon.world",
        pathname: "/",
      })
    ).toBe("/typing-service");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "card.yeon.world",
        pathname: "/",
      })
    ).toBe("/card-service");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "community.yeon.world",
        pathname: "/",
      })
    ).toBe("/community");
  });

  it("서비스 subdomain의 하위 경로와 query string을 보존한다", () => {
    expect(
      resolveServiceSubdomainRewritePath({
        host: "typing.yeon.world",
        pathname: "/rooms",
        search: "?room=abc",
      })
    ).toBe("/typing-service/rooms?room=abc");
  });

  it("포트가 포함된 host도 서비스 subdomain으로 인식한다", () => {
    expect(
      resolveServiceSubdomainRewritePath({
        host: "card.yeon.world:443",
        pathname: "/decks",
      })
    ).toBe("/card-service/decks");
  });

  it("이미 기존 서비스 path이면 중복 rewrite하지 않는다", () => {
    expect(
      resolveServiceSubdomainRewritePath({
        host: "typing.yeon.world",
        pathname: "/typing-service/rooms",
      })
    ).toBeNull();
  });

  it("API, auth, Next asset, 정적 파일은 rewrite하지 않는다", () => {
    for (const pathname of [
      "/api/v1/card-decks",
      "/auth/login",
      "/_next/static/chunk.js",
      "/favicon.ico",
      "/robots.txt",
      "/sitemap.xml",
      "/images/logo.png",
    ]) {
      expect(
        resolveServiceSubdomainRewritePath({
          host: "community.yeon.world",
          pathname,
        })
      ).toBeNull();
    }
  });

  it("서비스 subdomain이 아니면 rewrite하지 않는다", () => {
    expect(
      resolveServiceSubdomainRewritePath({
        host: "yeon.world",
        pathname: "/",
      })
    ).toBeNull();
  });
});
