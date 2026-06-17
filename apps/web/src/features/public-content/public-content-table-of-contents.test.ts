import { describe, expect, it } from "vitest";
import {
  buildPublicContentTableOfContents,
  shouldShowPublicContentTableOfContents,
} from "./public-content-table-of-contents";
import type { PublicContentArticle } from "./public-content-data";

function buildArticle(
  body: PublicContentArticle["body"]
): Pick<PublicContentArticle, "body"> {
  return { body };
}

describe("public content table of contents", () => {
  it("heading block만 목차에 포함한다", () => {
    const tableOfContents = buildPublicContentTableOfContents(
      buildArticle([
        { text: "첫 문단", type: "paragraph" },
        { title: "첫 번째 섹션", type: "heading" },
        { items: ["확인"], type: "checklist" },
        { title: "두 번째 섹션", type: "heading" },
      ])
    );

    expect(tableOfContents).toEqual([
      {
        blockIndex: 1,
        id: "section-1",
        title: "첫 번째 섹션",
      },
      {
        blockIndex: 3,
        id: "section-2",
        title: "두 번째 섹션",
      },
    ]);
  });

  it("중복 제목도 heading 순서 기반 id로 구분한다", () => {
    const tableOfContents = buildPublicContentTableOfContents(
      buildArticle([
        { title: "설정", type: "heading" },
        { title: "설정", type: "heading" },
      ])
    );

    expect(tableOfContents.map((item) => item.id)).toEqual([
      "section-1",
      "section-2",
    ]);
  });

  it("heading이 없으면 빈 목차를 반환한다", () => {
    expect(
      buildPublicContentTableOfContents(
        buildArticle([{ text: "본문만 있는 글", type: "paragraph" }])
      )
    ).toEqual([]);
  });

  it("blog 목차는 긴 engineering 글에만 기본 노출한다", () => {
    const body = [{ title: "결정 근거", type: "heading" }] as const;

    expect(
      shouldShowPublicContentTableOfContents({
        body,
        category: "engineering",
        channel: "blog",
        readingMinutes: 4,
      })
    ).toBe(true);
    expect(
      shouldShowPublicContentTableOfContents({
        body,
        category: "essay",
        channel: "blog",
        readingMinutes: 4,
      })
    ).toBe(false);
    expect(
      shouldShowPublicContentTableOfContents({
        body,
        category: "product",
        channel: "blog",
        readingMinutes: 5,
      })
    ).toBe(false);
    expect(
      shouldShowPublicContentTableOfContents({
        body,
        category: "engineering",
        channel: "blog",
        readingMinutes: 3,
      })
    ).toBe(false);
  });

  it("support와 news는 기존처럼 heading이 있으면 목차를 노출한다", () => {
    const body = [{ title: "확인", type: "heading" }] as const;

    expect(
      shouldShowPublicContentTableOfContents({
        body,
        category: "guides",
        channel: "support",
        readingMinutes: 2,
      })
    ).toBe(true);
    expect(
      shouldShowPublicContentTableOfContents({
        body,
        category: "notice",
        channel: "news",
        readingMinutes: 2,
      })
    ).toBe(true);
  });
});
