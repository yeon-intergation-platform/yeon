import { describe, expect, it } from "vitest";
import { buildPublicContentTableOfContents } from "./public-content-table-of-contents";
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
});
