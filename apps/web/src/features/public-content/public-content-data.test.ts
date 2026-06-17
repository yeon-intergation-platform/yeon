import { describe, expect, it } from "vitest";
import {
  PUBLIC_CONTENT_ARTICLES,
  PUBLIC_CONTENT_CHANNELS,
  buildPublicContentCanonicalUrl,
  buildPublicContentOpenGraphImageUrl,
  getPublicContentArticleBySlug,
  getPublicContentCollectionBySlug,
  getPublicContentCollections,
  getPublicContentSitemapEntries,
  getPublicContentSupportCtaTarget,
} from "./public-content-data";

type PublicContentArticleForTest = (typeof PUBLIC_CONTENT_ARTICLES)[number];

function getPublicContentArticleText(article: PublicContentArticleForTest) {
  return article.body
    .map((block) => {
      if ("items" in block) return block.items.join(" ");
      if ("text" in block) return block.text;
      if ("links" in block) {
        return block.links
          .map((link) => `${link.label} ${link.href}`)
          .join(" ");
      }
      if ("title" in block) return block.title;
      return "";
    })
    .join(" ");
}

describe("public content data", () => {
  it("글이 있는 support 서비스와 분류만 collection으로 만든다", () => {
    const nexaCollection = getPublicContentCollectionBySlug("support", [
      "nexa",
    ]);
    const nexaGuidesCollection = getPublicContentCollectionBySlug("support", [
      "nexa",
      "guides",
    ]);

    expect(nexaCollection).toMatchObject({
      title: "NEXA 도움말",
      canonicalUrl: "https://support.yeon.world/nexa",
    });
    expect(nexaGuidesCollection).toMatchObject({
      title: "NEXA 가이드",
      canonicalUrl: "https://support.yeon.world/nexa/guides",
    });
    expect(nexaGuidesCollection?.articles.length).toBeGreaterThan(1);
    expect(
      getPublicContentCollectionBySlug("support", ["mooddesk"])
    ).toBeNull();
  });

  it("news와 blog collection은 실제 발행 글 기준으로 파생한다", () => {
    expect(
      getPublicContentCollectionBySlug("news", ["updates", "nexa"])
    ).toMatchObject({
      title: "NEXA 제품 업데이트",
      canonicalUrl: "https://news.yeon.world/updates/nexa",
    });

    expect(
      getPublicContentCollectionBySlug("news", ["news", "ai"])
    ).toMatchObject({
      title: "AI 업계 뉴스 해설",
      canonicalUrl: "https://news.yeon.world/news/ai",
    });

    expect(
      getPublicContentCollectionBySlug("news", ["news", "nexa"])
    ).toBeNull();

    expect(
      getPublicContentCollectionBySlug("blog", ["engineering"])
    ).toMatchObject({
      title: "기술 글",
      canonicalUrl: "https://blog.yeon.world/engineering",
    });

    expect(getPublicContentCollectionBySlug("blog", ["devlog"])).toMatchObject({
      title: "개발 일지",
      canonicalUrl: "https://blog.yeon.world/devlog",
    });
  });

  it("collection URL을 sitemap에 포함하고 빈 collection은 제외한다", () => {
    const sitemapUrls = getPublicContentSitemapEntries().map(
      (entry) => entry.url
    );

    expect(sitemapUrls).toContain(
      buildPublicContentCanonicalUrl("support", ["nexa", "guides"])
    );
    expect(sitemapUrls).toContain(
      buildPublicContentCanonicalUrl("news", ["updates", "nexa"])
    );
    expect(sitemapUrls).toContain(
      buildPublicContentCanonicalUrl("blog", ["engineering"])
    );
    expect(sitemapUrls).toContain(
      buildPublicContentCanonicalUrl("blog", ["devlog"])
    );

    expect(getPublicContentCollections("support").length).toBeGreaterThan(
      getPublicContentCollections("blog").length
    );
  });

  it("support 서비스 글은 서비스별 하단 CTA 정책을 따른다", () => {
    const supportArticles = PUBLIC_CONTENT_ARTICLES.filter(
      (article) => article.channel === PUBLIC_CONTENT_CHANNELS.support
    );

    supportArticles.forEach((article) => {
      const expectedCta = getPublicContentSupportCtaTarget(article.service);
      if (!expectedCta) return;

      expect(article).toMatchObject(expectedCta);
    });
  });

  it("채널별 기본 OG image URL은 canonical host를 기준으로 만든다", () => {
    expect(buildPublicContentOpenGraphImageUrl("support")).toBe(
      "https://support.yeon.world/opengraph-image"
    );
    expect(buildPublicContentOpenGraphImageUrl("news")).toBe(
      "https://news.yeon.world/opengraph-image"
    );
    expect(buildPublicContentOpenGraphImageUrl("blog")).toBe(
      "https://blog.yeon.world/opengraph-image"
    );
  });

  it("NEXA provider와 admin support 글을 공개 URL로 제공한다", () => {
    const slugs = [
      ["nexa", "guides", "connect-ollama-provider"],
      ["nexa", "guides", "install-provider-agent-safely"],
      ["nexa", "faq", "provider-pool-how-it-works"],
      ["nexa", "policy", "admin-safety-controls"],
    ];

    slugs.forEach((slug) => {
      expect(getPublicContentArticleBySlug("support", slug)).toMatchObject({
        channel: "support",
        service: "nexa",
      });
    });
  });

  it("NEXA 권한 글은 permissions integer와 webhook fallback을 일반 설명에 포함한다", () => {
    const article = getPublicContentArticleBySlug("support", [
      "nexa",
      "guides",
      "discord-bot-permissions",
    ]);
    expect(article).toBeTruthy();
    const bodyText = getPublicContentArticleText(article!);

    expect(bodyText).toContain("2147568640");
    expect(bodyText).toContain("2684734528");
    expect(bodyText).toContain("Message Content Intent");
    expect(bodyText).toContain("Manage Webhooks");
    expect(bodyText).toContain("기본 봇 이름으로 보내는 폴백");
  });

  it("Yeon 서비스 support 초기 글을 서비스별 공개 URL로 제공하고 mooddesk는 제외한다", () => {
    const requiredSlugs = [
      ["typing", "getting-started", "start-typing-practice"],
      ["typing", "guides", "join-typing-room"],
      ["typing", "troubleshooting", "race-not-starting"],
      ["typing", "troubleshooting", "result-not-saved"],
      ["typing", "troubleshooting", "site-not-opening"],
      ["card", "guides", "create-flashcard-deck"],
      ["card", "guides", "add-and-edit-cards"],
      ["card", "guides", "start-card-study"],
      ["card", "troubleshooting", "deck-data-not-visible"],
      ["card", "troubleshooting", "site-not-opening"],
      ["community", "guides", "write-community-post"],
      ["community", "guides", "write-comment"],
      ["community", "troubleshooting", "post-not-visible"],
      ["community", "troubleshooting", "site-not-opening"],
      ["community", "policy", "usage-rules"],
      ["account", "guides", "login-with-yeon-account"],
      ["account", "troubleshooting", "session-signed-out"],
      ["account", "policy", "privacy-conversation-data"],
      ["account", "guides", "public-service-urls"],
      ["account", "troubleshooting", "report-service-error"],
    ] as const;

    requiredSlugs.forEach((slug) => {
      expect(getPublicContentArticleBySlug("support", slug)).toMatchObject({
        channel: "support",
        service: slug[0],
      });
    });

    const supportArticles = PUBLIC_CONTENT_ARTICLES.filter(
      (article) => article.channel === PUBLIC_CONTENT_CHANNELS.support
    );
    ["typing", "card", "community", "account"].forEach((service) => {
      expect(
        supportArticles.filter((article) => article.service === service).length
      ).toBeGreaterThanOrEqual(5);
    });
    expect(
      supportArticles.some((article) => article.slugSegments[0] === "mooddesk")
    ).toBe(false);
  });

  it("Yeon 서비스 support 글은 서비스별 운영 기준을 본문에 포함한다", () => {
    const supportArticles = PUBLIC_CONTENT_ARTICLES.filter(
      (article) => article.channel === PUBLIC_CONTENT_CHANNELS.support
    );

    supportArticles
      .filter((article) => article.service === "typing")
      .forEach((article) => {
        expect(getPublicContentArticleText(article)).toContain("race-server");
      });

    supportArticles
      .filter((article) => article.service === "card")
      .forEach((article) => {
        const bodyText = getPublicContentArticleText(article);

        expect(bodyText).toContain("게스트");
        expect(bodyText).toContain("로그인");
      });

    supportArticles
      .filter((article) => article.service === "community")
      .forEach((article) => {
        expect(getPublicContentArticleText(article)).toContain("공개");
      });

    const privacyArticle = getPublicContentArticleBySlug("support", [
      "account",
      "policy",
      "privacy-conversation-data",
    ]);
    expect(privacyArticle).toBeTruthy();
    const privacyText = getPublicContentArticleText(privacyArticle!);

    expect(privacyText).toContain("Google 로그인");
    expect(privacyText).toContain("커뮤니티 글과 댓글");
    expect(privacyText).toContain("NEXA 질문");
  });
});
