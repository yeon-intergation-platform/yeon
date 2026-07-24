import { describe, expect, it } from "vitest";
import {
  resolveLegacyHostnameRedirectUrl,
  resolveLegacyServicePathRedirectUrl,
  resolveServiceSubdomainRewritePath,
} from "../subdomain-routing";
import { normalizeRequestHostname } from "../request-host";

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

    expect(
      resolveServiceSubdomainRewritePath({
        host: "game.yeon.world",
        pathname: "/",
      })
    ).toBe("/game-service");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "todo.yeon.world",
        pathname: "/",
      })
    ).toBe("/today");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "support.yeon.world",
        pathname: "/",
      })
    ).toBe("/support");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "portfolio.yeon.world",
        pathname: "/",
      })
    ).toBe("/portfolio");
  });

  it("서비스 subdomain의 하위 경로와 query string을 보존한다", () => {
    expect(
      resolveServiceSubdomainRewritePath({
        host: "typing.yeon.world",
        pathname: "/rooms",
        search: "?room=abc",
      })
    ).toBe("/typing-service/rooms?room=abc");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "blog.yeon.world",
        pathname: "/engineering/search-console-sitemap-operations",
      })
    ).toBe("/blog/engineering/search-console-sitemap-operations");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "news.yeon.world",
        pathname: "/news/ai/discord-ai-news-interpretation",
      })
    ).toBe("/news/news/ai/discord-ai-news-interpretation");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "news.yeon.world",
        pathname: "/news",
      })
    ).toBe("/news/news");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "game.yeon.world",
        pathname: "/snake-io",
      })
    ).toBe("/game-service/snake-io");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "game.yeon.world",
        pathname: "/snake-io",
        search: "?utm=search",
      })
    ).toBe("/game-service/snake-io?utm=search");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "todo.yeon.world",
        pathname: "/record",
        search: "?source=shortcut",
      })
    ).toBe("/today/record?source=shortcut");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "portfolio.yeon.world",
        pathname: "/",
        search: "?source=gallery",
      })
    ).toBe("/portfolio?source=gallery");
  });

  it("공개 콘텐츠 subdomain의 feed.xml을 channel 내부 route로 rewrite한다", () => {
    expect(
      resolveServiceSubdomainRewritePath({
        host: "support.yeon.world",
        pathname: "/feed.xml",
      })
    ).toBe("/support/feed.xml");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "news.yeon.world",
        pathname: "/feed.xml",
        search: "?utm=feed",
      })
    ).toBe("/news/feed.xml?utm=feed");

    expect(
      resolveServiceSubdomainRewritePath({
        host: "typing.yeon.world",
        pathname: "/feed.xml",
      })
    ).toBeNull();
  });

  it("포트가 포함된 host도 서비스 subdomain으로 인식한다", () => {
    expect(
      resolveServiceSubdomainRewritePath({
        host: "card.yeon.world:443",
        pathname: "/decks",
      })
    ).toBe("/card-service/decks");
  });

  it("forwarded host 목록은 첫 host 기준으로 정규화한다", () => {
    expect(normalizeRequestHostname("www.yeon.world, yeon-prod-web:3000")).toBe(
      "www.yeon.world"
    );
  });

  it("이미 기존 서비스 path이면 중복 rewrite하지 않는다", () => {
    expect(
      resolveServiceSubdomainRewritePath({
        host: "typing.yeon.world",
        pathname: "/typing-service/rooms",
      })
    ).toBeNull();
  });

  it("루트 도메인 전용 /profile은 서비스 subdomain에서도 rewrite하지 않는다", () => {
    expect(
      resolveServiceSubdomainRewritePath({
        host: "typing.yeon.world",
        pathname: "/profile",
      })
    ).toBeNull();

    expect(
      resolveServiceSubdomainRewritePath({
        host: "card.yeon.world",
        pathname: "/profile",
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

  it("루트 도메인의 legacy 서비스 path를 canonical subdomain으로 redirect한다", () => {
    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "yeon.world",
        pathname: "/typing-service",
      })?.toString()
    ).toBe("https://typing.yeon.world/");

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "yeon.world",
        pathname: "/card-service/decks/abc",
        search: "?mode=study",
      })?.toString()
    ).toBe("https://card.yeon.world/decks/abc?mode=study");

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "yeon.world",
        pathname: "/community/posts/1",
      })?.toString()
    ).toBe("https://community.yeon.world/posts/1");

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "yeon.world",
        pathname: "/support/nexa/guides/add-nexa-discord-bot",
      })?.toString()
    ).toBe("https://support.yeon.world/nexa/guides/add-nexa-discord-bot");

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "yeon.world",
        pathname: "/game-service/snake-io",
      })?.toString()
    ).toBe("https://game.yeon.world/snake-io");

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "yeon.world",
        pathname: "/today",
      })?.toString()
    ).toBe("https://todo.yeon.world/");

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "yeon.world",
        pathname: "/portfolio",
      })?.toString()
    ).toBe("https://portfolio.yeon.world/");
  });

  it("기존 오타 포트폴리오 host를 정상 host로 redirect한다", () => {
    expect(
      resolveLegacyHostnameRedirectUrl({
        host: "portforlio.yeon.world",
        pathname: "/pull-it",
        search: "?source=legacy",
      })?.toString()
    ).toBe("https://portfolio.yeon.world/pull-it?source=legacy");
  });

  it("서비스 subdomain에 legacy prefix가 남으면 prefix를 제거한 URL로 redirect한다", () => {
    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "typing.yeon.world",
        pathname: "/typing-service/rooms",
        search: "?room=abc",
      })?.toString()
    ).toBe("https://typing.yeon.world/rooms?room=abc");

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "news.yeon.world",
        pathname: "/news/updates/nexa/discord-permission-guides",
      })?.toString()
    ).toBe("https://news.yeon.world/updates/nexa/discord-permission-guides");

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "news.yeon.world",
        pathname: "/news/ai/discord-ai-news-interpretation",
      })
    ).toBeNull();

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "news.yeon.world",
        pathname: "/news",
      })
    ).toBeNull();

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "game.yeon.world",
        pathname: "/game-service/snake-io",
        search: "?utm=legacy",
      })?.toString()
    ).toBe("https://game.yeon.world/snake-io?utm=legacy");

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "portfolio.yeon.world",
        pathname: "/portfolio",
      })?.toString()
    ).toBe("https://portfolio.yeon.world/");

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "todo.yeon.world",
        pathname: "/today",
      })?.toString()
    ).toBe("https://todo.yeon.world/");
  });

  it("다른 서비스 subdomain의 legacy path는 redirect하지 않는다", () => {
    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "typing.yeon.world",
        pathname: "/card-service/decks",
      })
    ).toBeNull();
  });

  it("공개 콘텐츠 subdomain 사이의 내부 채널 경로는 대상 canonical host로 전환한다", () => {
    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "support.yeon.world",
        pathname: "/news",
        search: "?source=header",
      })?.toString()
    ).toBe("https://news.yeon.world/?source=header");

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "news.yeon.world",
        pathname: "/blog/engineering",
      })?.toString()
    ).toBe("https://blog.yeon.world/engineering");

    expect(
      resolveLegacyServicePathRedirectUrl({
        host: "blog.yeon.world",
        pathname: "/support",
      })?.toString()
    ).toBe("https://support.yeon.world/");
  });
});
