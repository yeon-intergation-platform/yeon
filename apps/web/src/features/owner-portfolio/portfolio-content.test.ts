import { describe, expect, it } from "vitest";
import {
  PORTFOLIO_DOCUMENTS,
  PORTFOLIO_EXTERNAL_LINKS,
  PORTFOLIO_GALLERY_ENTRIES,
} from "./portfolio-content";

describe("owner portfolio content", () => {
  it("공개 문서 링크는 버전이 고정된 PDF 다운로드 경로를 사용한다", () => {
    expect(PORTFOLIO_DOCUMENTS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "portfolio",
          href: "/documents/choi-hyeonjun-portfolio-v22.pdf",
        }),
        expect.objectContaining({
          id: "resume",
          href: "/documents/choi-hyeonjun-resume-v21.pdf",
        }),
      ])
    );
    expect(
      PORTFOLIO_DOCUMENTS.every((document) => document.href.endsWith(".pdf"))
    ).toBe(true);
  });

  it("PDF에서 확인한 GitHub와 블로그 공개 주소를 사용한다", () => {
    expect(PORTFOLIO_EXTERNAL_LINKS).toEqual([
      expect.objectContaining({
        id: "github",
        href: "https://github.com/Hyeonjun0527",
      }),
      expect.objectContaining({
        id: "blog",
        href: "https://osumaniaddict527.tistory.com",
      }),
    ]);
  });

  it("갤러리 콘텐츠는 고유한 순번과 한 줄 제목을 가지며 이미지 없이도 게시된다", () => {
    expect(PORTFOLIO_GALLERY_ENTRIES).toHaveLength(7);
    expect(
      new Set(PORTFOLIO_GALLERY_ENTRIES.map((entry) => entry.id)).size
    ).toBe(PORTFOLIO_GALLERY_ENTRIES.length);
    expect(
      new Set(PORTFOLIO_GALLERY_ENTRIES.map((entry) => entry.sequence)).size
    ).toBe(PORTFOLIO_GALLERY_ENTRIES.length);
    expect(
      PORTFOLIO_GALLERY_ENTRIES.every(
        (entry) => entry.title.trim() && entry.summary.trim() && !entry.imageSrc
      )
    ).toBe(true);
  });
});
