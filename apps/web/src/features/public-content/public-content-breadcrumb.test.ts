import { describe, expect, it } from "vitest";
import {
  buildPublicContentArticleBreadcrumb,
  buildPublicContentCollectionBreadcrumb,
} from "./public-content-breadcrumb";
import {
  getPublicContentArticleBySlug,
  getPublicContentCollectionBySlug,
  type PublicContentArticle,
  type PublicContentChannel,
  type PublicContentCollection,
} from "./public-content-data";

function getArticle(
  channel: PublicContentChannel,
  slug: readonly string[]
): PublicContentArticle {
  const article = getPublicContentArticleBySlug(channel, slug);
  if (!article) {
    throw new Error(
      `테스트 article을 찾을 수 없습니다: ${channel}/${slug.join("/")}`
    );
  }

  return article;
}

function getCollection(
  channel: PublicContentChannel,
  slug: readonly string[]
): PublicContentCollection {
  const collection = getPublicContentCollectionBySlug(channel, slug);
  if (!collection) {
    throw new Error(
      `테스트 collection을 찾을 수 없습니다: ${channel}/${slug.join("/")}`
    );
  }

  return collection;
}

describe("public content breadcrumb", () => {
  it("article breadcrumb는 channel, collection prefix, article 순서로 만든다", () => {
    const breadcrumb = buildPublicContentArticleBreadcrumb(
      getArticle("support", ["nexa", "faq", "free-plan-limit"])
    );

    expect(
      breadcrumb.map((item) => ({
        current: item.current,
        href: item.href,
        label: item.label,
      }))
    ).toEqual([
      {
        current: false,
        href: "https://support.yeon.world",
        label: "Support",
      },
      {
        current: false,
        href: "https://support.yeon.world/nexa",
        label: "NEXA",
      },
      {
        current: false,
        href: "https://support.yeon.world/nexa/faq",
        label: "FAQ",
      },
      {
        current: true,
        href: "https://support.yeon.world/nexa/faq/free-plan-limit",
        label: "NEXA 무료 플랜에서는 무엇까지 사용할 수 있나요?",
      },
    ]);
  });

  it("collection breadcrumb는 현재 collection을 마지막 항목으로 둔다", () => {
    const breadcrumb = buildPublicContentCollectionBreadcrumb(
      getCollection("news", ["updates", "nexa"])
    );

    expect(breadcrumb.map((item) => item.label)).toEqual([
      "News",
      "업데이트",
      "NEXA",
    ]);
    expect(breadcrumb.at(-1)).toMatchObject({
      current: true,
      href: "https://news.yeon.world/updates/nexa",
    });
  });
});
