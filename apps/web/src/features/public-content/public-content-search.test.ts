import { describe, expect, it } from "vitest";
import {
  normalizePublicContentSearchQuery,
  searchPublicContentSupportArticles,
} from "./public-content-search";

describe("public content support search", () => {
  it("검색어 공백을 URL 상태에 맞게 정규화한다", () => {
    expect(normalizePublicContentSearchQuery("  Provider   연결 ")).toBe(
      "Provider 연결"
    );
  });

  it("제목과 문서 본문 용어로 support 문서를 찾는다", () => {
    const results = searchPublicContentSupportArticles("Provider 연결");

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some((article) => article.title.includes("NEXA Provider로 연결"))
    ).toBe(true);
    expect(results.every((article) => article.channel === "support")).toBe(
      true
    );

    expect(
      searchPublicContentSupportArticles("원격 Ollama").some((article) =>
        article.title.includes("provider-agent를 안전하게 설치")
      )
    ).toBe(true);
  });

  it("일치하는 문서가 없으면 빈 결과를 반환한다", () => {
    expect(searchPublicContentSupportArticles("존재하지않는검색어")).toEqual(
      []
    );
  });
});
