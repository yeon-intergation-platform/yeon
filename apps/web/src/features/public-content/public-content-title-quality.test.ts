import { describe, expect, it } from "vitest";
import {
  PUBLIC_CONTENT_ARTICLES,
  type PublicContentArticle,
} from "./public-content-data";
import { getPublicContentTitleQualityWarnings } from "./public-content-title-quality";

function getWarnings(
  article: Pick<PublicContentArticle, "channel" | "service" | "title">
) {
  return getPublicContentTitleQualityWarnings({
    channel: article.channel,
    serviceKey: article.service,
    title: article.title,
  });
}

describe("public content title quality", () => {
  it("현재 static registry 제목은 제목 품질 기준을 통과한다", () => {
    const warnings = PUBLIC_CONTENT_ARTICLES.flatMap((article) =>
      getWarnings(article).map((warning) => ({
        article: `${article.channel}:${article.slugSegments.join("/")}`,
        warning,
      }))
    );

    expect(warnings).toEqual([]);
  });

  it("support generic 제목은 서비스 단서와 검색 의도를 요구한다", () => {
    expect(
      getWarnings({
        channel: "support",
        service: "nexa",
        title: "가이드",
      })
    ).toEqual([
      "title generic",
      "title 너무 짧음",
      "title 서비스 단서 누락",
      "title 검색 행동/문제 표현 누락",
    ]);
  });

  it("news 제목은 대상과 공지 성격을 요구한다", () => {
    expect(
      getWarnings({
        channel: "news",
        service: "nexa",
        title: "새 소식",
      })
    ).toEqual([
      "title generic",
      "title 너무 짧음",
      "title 공지 대상 누락",
      "title 공지/업데이트 성격 누락",
    ]);
  });

  it("blog 제목은 결정 맥락을 요구한다", () => {
    expect(
      getWarnings({
        channel: "blog",
        service: "account",
        title: "개발 이야기",
      })
    ).toEqual(["title generic", "title 너무 짧음", "title 결정 맥락 누락"]);
  });
});
