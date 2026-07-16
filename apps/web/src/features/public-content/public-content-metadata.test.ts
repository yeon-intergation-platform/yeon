import { describe, expect, it } from "vitest";
import { getPublicContentArticles } from "./public-content-data";
import { buildPublicContentArticleMetadata } from "./public-content-metadata";

describe("public content metadata", () => {
  it("발행 revision의 SEO 제목·설명·OG 이미지를 우선한다", () => {
    const base = getPublicContentArticles("blog")[0];
    if (!base) throw new Error("테스트할 blog 글이 없습니다.");
    const article = {
      ...base,
      metaTitle: "관리자 SEO 제목",
      metaDescription: "관리자가 발행한 검색 설명입니다.",
      ogImageUrl: "https://cdn.yeon.world/public-content/custom-og.png",
    };
    const metadata = buildPublicContentArticleMetadata(article);

    expect(metadata.title).toBe("관리자 SEO 제목");
    expect(metadata.description).toBe("관리자가 발행한 검색 설명입니다.");
    expect(metadata.openGraph?.title).toBe("관리자 SEO 제목");
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({
        url: "https://cdn.yeon.world/public-content/custom-og.png",
      }),
    ]);
  });
});
