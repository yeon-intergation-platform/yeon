import { describe, expect, it } from "vitest";
import {
  buildPublicContentArticleStructuredData,
  buildPublicContentBreadcrumbJsonLd,
  buildPublicContentFaqPageJsonLd,
  buildPublicContentHowToJsonLd,
} from "./public-content-structured-data";
import {
  getPublicContentArticleBySlug,
  type PublicContentArticle,
} from "./public-content-data";

function getArticle(channel: PublicContentArticle["channel"], slug: string[]) {
  const article = getPublicContentArticleBySlug(channel, slug);

  if (!article) {
    throw new Error(
      `테스트 article을 찾을 수 없습니다: ${channel}/${slug.join("/")}`
    );
  }

  return article;
}

function getGraphTypes(article: PublicContentArticle) {
  return (
    buildPublicContentArticleStructuredData(article)["@graph"] as {
      "@type": string;
    }[]
  ).map((node) => node["@type"]);
}

describe("public content structured data", () => {
  it("모든 article structured data에 Article 계열과 BreadcrumbList를 포함한다", () => {
    const article = getArticle("blog", [
      "engineering",
      "search-console-sitemap-operations",
    ]);
    const structuredData = buildPublicContentArticleStructuredData(article);

    expect(structuredData["@context"]).toBe("https://schema.org");
    expect(getGraphTypes(article)).toEqual(["BlogPosting", "BreadcrumbList"]);
  });

  it("breadcrumb는 channel, collection prefix, article을 순서대로 담는다", () => {
    const article = getArticle("support", ["nexa", "faq", "free-plan-limit"]);
    const breadcrumb = buildPublicContentBreadcrumbJsonLd(article);

    expect(breadcrumb).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          item: "https://support.yeon.world",
          name: "Support",
          position: 1,
        },
        {
          item: "https://support.yeon.world/nexa",
          name: "NEXA",
          position: 2,
        },
        {
          item: "https://support.yeon.world/nexa/faq",
          name: "FAQ",
          position: 3,
        },
        {
          item: "https://support.yeon.world/nexa/faq/free-plan-limit",
          name: "NEXA 무료 플랜에서는 무엇까지 사용할 수 있나요?",
          position: 4,
        },
      ],
    });
  });

  it("support FAQ 글은 본문에서 FAQPage 답변을 만든다", () => {
    const article = getArticle("support", ["nexa", "faq", "free-plan-limit"]);
    const faqPage = buildPublicContentFaqPageJsonLd(article);

    expect(faqPage).toMatchObject({
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          acceptedAnswer: {
            "@type": "Answer",
          },
          name: "NEXA 무료 플랜에서는 무엇까지 사용할 수 있나요?",
        },
      ],
    });
    expect(
      (
        faqPage?.mainEntity as {
          acceptedAnswer: { text: string };
        }[]
      )[0].acceptedAnswer.text
    ).toContain("무료로 시작할 수 있는 것");
  });

  it("support steps 글은 HowTo step을 본문 순서대로 만든다", () => {
    const article = getArticle("support", [
      "nexa",
      "guides",
      "add-nexa-discord-bot",
    ]);
    const howTo = buildPublicContentHowToJsonLd(article);

    expect(howTo).toMatchObject({
      "@type": "HowTo",
      name: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
    });
    expect((howTo?.step as { position: number; text: string }[])[0]).toEqual({
      "@type": "HowToStep",
      name: "디스코드에서 봇을 추가할 서버를 열고 본인 역할에 서버 관리 또는 봇 초대 권한이 있는지 확인합니다.",
      position: 1,
      text: "디스코드에서 봇을 추가할 서버를 열고 본인 역할에 서버 관리 또는 봇 초대 권한이 있는지 확인합니다.",
    });
  });

  it("news와 blog 글에는 FAQPage와 HowTo를 붙이지 않는다", () => {
    const newsArticle = getArticle("news", [
      "news",
      "ai",
      "discord-ai-news-interpretation",
    ]);
    const blogArticle = getArticle("blog", [
      "devlog",
      "public-content-network-start",
    ]);

    expect(buildPublicContentFaqPageJsonLd(newsArticle)).toBeNull();
    expect(buildPublicContentHowToJsonLd(newsArticle)).toBeNull();
    expect(buildPublicContentFaqPageJsonLd(blogArticle)).toBeNull();
    expect(buildPublicContentHowToJsonLd(blogArticle)).toBeNull();
  });
});
