import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PublicContentSpringBackendHttpError,
  fetchPublicContentArticleFromSpring,
  fetchPublicContentArticlesFromSpring,
  fetchPublicContentRedirectFromSpring,
  fetchPublicContentSitemapFromSpring,
  fetchPublicContentSnapshotFromSpring,
} from "../public-content-spring-client";
import {
  loadPublicContentArticle,
  loadPublicContentArchivedRedirect,
  loadPublicContentList,
  loadPublicContentSitemap,
  loadPublicContentSnapshot,
} from "../public-content-public-read";

vi.mock("../public-content-spring-client", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../public-content-spring-client")>();
  return {
    ...actual,
    fetchPublicContentArticleFromSpring: vi.fn(),
    fetchPublicContentArticlesFromSpring: vi.fn(),
    fetchPublicContentRedirectFromSpring: vi.fn(),
    fetchPublicContentSitemapFromSpring: vi.fn(),
    fetchPublicContentSnapshotFromSpring: vi.fn(),
  };
});

const unavailable = new PublicContentSpringBackendHttpError(
  503,
  "Spring backend와 연결할 수 없습니다."
);

describe("public content public read fallback", () => {
  beforeEach(() => {
    vi.mocked(fetchPublicContentArticleFromSpring).mockReset();
    vi.mocked(fetchPublicContentArticlesFromSpring).mockReset();
    vi.mocked(fetchPublicContentRedirectFromSpring).mockReset();
    vi.mocked(fetchPublicContentSitemapFromSpring).mockReset();
    vi.mocked(fetchPublicContentSnapshotFromSpring).mockReset();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Spring 장애 시 목록과 snapshot을 내장 발행 데이터로 반환한다", async () => {
    vi.mocked(fetchPublicContentArticlesFromSpring).mockRejectedValue(
      unavailable
    );
    vi.mocked(fetchPublicContentSnapshotFromSpring).mockRejectedValue(
      unavailable
    );

    const list = await loadPublicContentList({ channel: "support" });
    const snapshot = await loadPublicContentSnapshot({ channel: "support" });

    expect(list.articles.length).toBeGreaterThan(0);
    expect(snapshot.articles.length).toBe(list.articles.length);
    expect(snapshot.articles[0]?.publishedAt).toMatch(/T00:00:00\.000Z$/);
  });

  it("snapshot fallback도 serviceKey와 category 필터를 동일하게 적용한다", async () => {
    vi.mocked(fetchPublicContentSnapshotFromSpring).mockRejectedValue(
      unavailable
    );

    const snapshot = await loadPublicContentSnapshot({
      channel: "support",
      serviceKey: "nexa",
      category: "guides",
    });

    expect(snapshot.articles.length).toBeGreaterThan(0);
    expect(snapshot.articles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          channel: "support",
          serviceKey: "nexa",
          category: "guides",
        }),
      ])
    );
    expect(
      snapshot.articles.every(
        (article) =>
          article.channel === "support" &&
          article.serviceKey === "nexa" &&
          article.category === "guides"
      )
    ).toBe(true);
  });

  it("Spring 장애 시 상세와 sitemap도 같은 내장 데이터에서 파생한다", async () => {
    vi.mocked(fetchPublicContentArticlesFromSpring).mockRejectedValue(
      unavailable
    );
    vi.mocked(fetchPublicContentArticleFromSpring).mockRejectedValue(
      unavailable
    );
    vi.mocked(fetchPublicContentSitemapFromSpring).mockRejectedValue(
      unavailable
    );

    const list = await loadPublicContentList({ channel: "blog" });
    const target = list.articles[0];
    expect(target).toBeDefined();
    const detail = await loadPublicContentArticle({
      channel: "blog",
      slug: target.slug,
    });
    const sitemap = await loadPublicContentSitemap("blog");

    expect(detail.article.slug).toBe(target.slug);
    expect(
      sitemap.entries.some((entry) => entry.url === target.canonicalUrl)
    ).toBe(true);
  });

  it("Spring이 반환한 404는 정적 글로 덮어쓰지 않는다", async () => {
    const notFound = new PublicContentSpringBackendHttpError(
      404,
      "공개 콘텐츠 글을 찾을 수 없습니다."
    );
    vi.mocked(fetchPublicContentArticleFromSpring).mockRejectedValue(notFound);

    await expect(
      loadPublicContentArticle({
        channel: "blog",
        slug: "engineering/dailyting-video-faststart",
      })
    ).rejects.toBe(notFound);
  });

  it("보관 글 redirect는 반환하고 명시적 404는 null로 해석한다", async () => {
    vi.mocked(fetchPublicContentRedirectFromSpring).mockResolvedValueOnce({
      redirectTo: "https://blog.yeon.world/product/new-article",
    });
    await expect(
      loadPublicContentArchivedRedirect({
        channel: "blog",
        slug: "engineering/old-article",
      })
    ).resolves.toBe("https://blog.yeon.world/product/new-article");

    vi.mocked(fetchPublicContentRedirectFromSpring).mockRejectedValueOnce(
      new PublicContentSpringBackendHttpError(404, "redirect가 없습니다.")
    );
    await expect(
      loadPublicContentArchivedRedirect({
        channel: "blog",
        slug: "engineering/missing",
      })
    ).resolves.toBeNull();
  });

  it("redirect 조회 장애는 거짓 404로 바꾸지 않는다", async () => {
    vi.mocked(fetchPublicContentRedirectFromSpring).mockRejectedValue(
      unavailable
    );

    await expect(
      loadPublicContentArchivedRedirect({
        channel: "blog",
        slug: "engineering/old-article",
      })
    ).rejects.toBe(unavailable);
  });
});
