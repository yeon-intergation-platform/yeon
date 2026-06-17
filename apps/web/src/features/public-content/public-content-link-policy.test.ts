import { describe, expect, it } from "vitest";
import { getPublicContentLinkRel } from "./public-content-link-policy";

describe("public content link policy", () => {
  it("absolute web URL에는 기본 noopener를 적용한다", () => {
    expect(
      getPublicContentLinkRel({
        href: "https://discord-ai.yeon.world/install",
      })
    ).toBe("noopener");
  });

  it("새 탭 링크에는 noreferrer까지 적용한다", () => {
    expect(
      getPublicContentLinkRel({
        href: "/support/nexa",
        target: "_blank",
      })
    ).toBe("noopener noreferrer");
  });

  it("명시 rel은 덮어쓰지 않는다", () => {
    expect(
      getPublicContentLinkRel({
        href: "https://example.com",
        rel: "nofollow",
        target: "_blank",
      })
    ).toBe("nofollow");
  });

  it("상대 경로 기본 링크에는 rel을 추가하지 않는다", () => {
    expect(getPublicContentLinkRel({ href: "/support/nexa" })).toBeUndefined();
  });
});
