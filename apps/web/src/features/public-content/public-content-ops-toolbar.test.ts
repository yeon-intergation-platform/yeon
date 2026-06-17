import { describe, expect, it } from "vitest";
import {
  buildPublicContentOpsToolbarModel,
  isPublicContentOpsModeSearchParams,
} from "./public-content-ops-toolbar";
import {
  PUBLIC_CONTENT_CHANNELS,
  getPublicContentArticles,
} from "./public-content-data";

describe("public content ops toolbar", () => {
  it("ops query는 명시적으로 켠 경우만 true로 본다", () => {
    expect(isPublicContentOpsModeSearchParams({ ops: "1" })).toBe(true);
    expect(isPublicContentOpsModeSearchParams({ ops: "true" })).toBe(true);
    expect(isPublicContentOpsModeSearchParams({ ops: ["1"] })).toBe(true);
    expect(isPublicContentOpsModeSearchParams({ ops: "0" })).toBe(false);
    expect(isPublicContentOpsModeSearchParams({})).toBe(false);
  });

  it("비활성 상태에서는 toolbar model을 만들지 않는다", () => {
    const article = getPublicContentArticles(
      PUBLIC_CONTENT_CHANNELS.support
    )[0];

    expect(
      buildPublicContentOpsToolbarModel(article, { enabled: false })
    ).toBeNull();
  });

  it("활성 toolbar는 preview, SEO, sitemap 확인만 제공한다", () => {
    const article = getPublicContentArticles(
      PUBLIC_CONTENT_CHANNELS.support
    )[0];
    const model = buildPublicContentOpsToolbarModel(article, { enabled: true });

    expect(model).not.toBeNull();
    expect(model?.actions.map((action) => action.kind)).toEqual([
      "preview",
      "seo",
      "sitemap",
    ]);
    expect(model?.actions.map((action) => action.label)).toEqual([
      "draft 보기",
      "SEO 검사",
      "sitemap",
    ]);
    expect(model?.sitemapIncluded).toBe(true);
    expect(model?.robotsIndexable).toBe(false);
    expect(model?.validationMessages).toEqual([]);
  });

  it("초기 toolbar에는 수정, 저장, 발행, 보관, 삭제 action을 넣지 않는다", () => {
    const article = getPublicContentArticles(PUBLIC_CONTENT_CHANNELS.blog)[0];
    const model = buildPublicContentOpsToolbarModel(article, { enabled: true });
    const actionText = model?.actions
      .map((action) => `${action.kind} ${action.label} ${action.href}`)
      .join(" ");

    expect(actionText).toBeDefined();
    expect(actionText).not.toMatch(/수정|저장|발행|보관|삭제|archive|delete/i);
  });
});
