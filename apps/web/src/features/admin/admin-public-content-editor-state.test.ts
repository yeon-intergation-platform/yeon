import type { PublicContentAdminArticleDto } from "@yeon/api-contract/public-content";
import { describe, expect, it } from "vitest";
import {
  canDeletePublicContentDraft,
  hasPublicContentPublishedHistory,
} from "./admin-public-content-editor-state";

function draft(
  overrides: Partial<PublicContentAdminArticleDto> = {}
): PublicContentAdminArticleDto {
  return {
    id: "123",
    channel: "support",
    serviceKey: "nexa",
    category: "guides",
    slug: "nexa/guides/example",
    title: "예시 글",
    description: "예시 설명입니다.",
    summary: "예시 요약입니다.",
    canonicalUrl: "https://support.yeon.world/nexa/guides/example",
    publishedAt: null,
    updatedAt: "2026-07-16T00:00:00.000Z",
    readingMinutes: 1,
    bodyFormat: "markdown",
    bodyMarkdown: "## 예시\n\n본문입니다.",
    ctaLabel: null,
    ctaHref: null,
    metaTitle: null,
    metaDescription: null,
    ogImageUrl: null,
    status: "draft",
    visibility: "public",
    noindex: false,
    authorKey: "yeon",
    sourceRepo: "yeon",
    sourcePaths: [],
    redirectTo: null,
    version: 1,
    publishedRevisionId: null,
    ...overrides,
  };
}

describe("admin public content editor history state", () => {
  it("발행 이력이 없는 초안만 삭제할 수 있다", () => {
    expect(canDeletePublicContentDraft(draft(), [])).toBe(true);
  });

  it("보관 후 복구해 pointer가 없어도 발행 시각이나 revision으로 이력을 잠근다", () => {
    const restored = draft({ publishedAt: "2026-07-16T00:00:00.000Z" });
    expect(hasPublicContentPublishedHistory(restored, [])).toBe(true);
    expect(canDeletePublicContentDraft(restored, [])).toBe(false);
    expect(
      hasPublicContentPublishedHistory(draft(), [
        {
          id: "revision-1",
          articleId: "123",
          revisionNumber: 1,
          title: "예시 글",
          bodyMarkdown: "## 예시\n\n본문입니다.",
          publishedAt: "2026-07-16T00:00:00.000Z",
          createdBy: null,
        },
      ])
    ).toBe(true);
  });
});
