import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getPublicContentBlogDetailModel } from "./public-content-blog-detail";
import {
  PUBLIC_CONTENT_CHANNELS,
  getPublicContentArticles,
  type PublicContentArticle,
} from "./public-content-data";

function getBlogArticles() {
  return getPublicContentArticles(PUBLIC_CONTENT_CHANNELS.blog);
}

function getArticleText(article: PublicContentArticle) {
  return article.body
    .flatMap((block) => {
      if (block.type === "paragraph") return [block.text];
      if (block.type === "heading") return [block.title];
      if (block.type === "checklist" || block.type === "steps") {
        return [...block.items];
      }
      if (block.type === "callout") return [block.title, block.text];
      if (block.type === "links") {
        return [block.title, ...block.links.map((link) => link.label)];
      }
      if (block.type === "image") return [block.alt, block.caption ?? ""];
      if (block.type === "code") return [block.code, block.filename ?? ""];

      return [];
    })
    .join(" ");
}

describe("public content blog detail", () => {
  it("blog는 feed를 제공하지만 초기 author page route는 만들지 않는다", () => {
    expect(existsSync("src/app/blog/feed.xml/route.ts")).toBe(true);
    expect(existsSync("src/app/blog/author")).toBe(false);
    expect(existsSync("src/app/blog/authors")).toBe(false);
  });

  it("blog 상세는 운영 주체와 관련 support/news 링크를 파생한다", () => {
    const warnings = getBlogArticles().flatMap((article) => {
      const model = getPublicContentBlogDetailModel(article);

      if (!model) {
        return [`${article.slugSegments.join("/")}: model 없음`];
      }

      const articleWarnings = [];
      if (model.authorName !== "YEON") {
        articleWarnings.push(
          `${article.slugSegments.join("/")}: 운영 주체 없음`
        );
      }
      if ("authorHref" in model) {
        articleWarnings.push(
          `${article.slugSegments.join("/")}: 초기 author page 링크가 있음`
        );
      }
      if (model.supportLinks.length === 0) {
        articleWarnings.push(
          `${article.slugSegments.join("/")}: 관련 support 링크 없음`
        );
      }
      if (model.newsLinks.length === 0) {
        articleWarnings.push(
          `${article.slugSegments.join("/")}: 관련 news 링크 없음`
        );
      }

      return articleWarnings;
    });

    expect(warnings).toEqual([]);
  });

  it("engineering 글은 repo 근거 링크를 제공하고 다른 분류는 숨긴다", () => {
    const warnings = getBlogArticles().flatMap((article) => {
      const model = getPublicContentBlogDetailModel(article);
      if (!model) return [];

      if (article.category === "engineering") {
        return model.repoSourceLinks.length > 0 &&
          model.repoSourceLinks.every((link) =>
            link.href.startsWith("https://github.com/")
          )
          ? []
          : [`${article.slugSegments.join("/")}: repo 근거 링크 없음`];
      }

      return model.repoSourceLinks.length === 0
        ? []
        : [`${article.slugSegments.join("/")}: repo 근거 링크 노출됨`];
    });

    expect(warnings).toEqual([]);
  });

  it("code block은 blog engineering 글에서만 주요 요소로 사용한다", () => {
    const warnings = getBlogArticles().flatMap((article) => {
      const hasCodeBlock = article.body.some((block) => block.type === "code");

      return hasCodeBlock && article.category !== "engineering"
        ? [`${article.slugSegments.join("/")}: engineering 외 code block 사용`]
        : [];
    });

    expect(warnings).toEqual([]);
  });

  it("제품 제작기 스크린샷은 선택 사항이며 이미지가 있으면 제품 맥락에만 둔다", () => {
    const warnings = getBlogArticles().flatMap((article) => {
      const hasImageBlock = article.body.some(
        (block) => block.type === "image"
      );

      return hasImageBlock && article.category !== "product"
        ? [`${article.slugSegments.join("/")}: product 외 screenshot 사용`]
        : [];
    });

    expect(warnings).toEqual([]);
  });

  it("devlog와 essay는 각각 배운 점과 실제 기능 연결을 포함한다", () => {
    const warnings = getBlogArticles().flatMap((article) => {
      const text = getArticleText(article);

      if (
        article.category === "devlog" &&
        !["배운", "제약", "결정"].some((keyword) => text.includes(keyword))
      ) {
        return [`${article.slugSegments.join("/")}: devlog 근거/배운 점 부족`];
      }

      if (
        article.category === "essay" &&
        !["support", "news", "blog", "admin", "CMS"].some((keyword) =>
          text.includes(keyword)
        )
      ) {
        return [`${article.slugSegments.join("/")}: 실제 기능 연결 부족`];
      }

      return [];
    });

    expect(warnings).toEqual([]);
  });
});
