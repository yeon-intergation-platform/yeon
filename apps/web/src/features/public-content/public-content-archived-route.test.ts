import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadArchivedRedirect = vi.fn();
const mockPermanentRedirect = vi.fn((target: string): never => {
  throw new Error(`PERMANENT_REDIRECT:${target}`);
});

vi.mock("@/server/public-content-public-read", () => ({
  loadPublicContentArchivedRedirect: (...args: unknown[]) =>
    mockLoadArchivedRedirect(...args),
}));

vi.mock("@yeon/ui/runtime/YeonRouteControl", () => ({
  permanentRedirectYeon: (target: string) => mockPermanentRedirect(target),
}));

import { redirectArchivedPublicContentIfConfigured } from "./public-content-archived-route";

describe("public content archived route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("설정된 보관 글 대상을 영구 redirect한다", async () => {
    mockLoadArchivedRedirect.mockResolvedValue(
      "https://blog.yeon.world/product/new-article"
    );

    await expect(
      redirectArchivedPublicContentIfConfigured({
        channel: "blog",
        slugSegments: ["engineering", "old-article"],
      })
    ).rejects.toThrow(
      "PERMANENT_REDIRECT:https://blog.yeon.world/product/new-article"
    );
    expect(mockLoadArchivedRedirect).toHaveBeenCalledWith({
      channel: "blog",
      slug: "engineering/old-article",
    });
  });

  it("redirect가 없으면 현재 경로 처리를 계속한다", async () => {
    mockLoadArchivedRedirect.mockResolvedValue(null);

    await expect(
      redirectArchivedPublicContentIfConfigured({
        channel: "support",
        slugSegments: ["nexa", "guides", "missing"],
      })
    ).resolves.toBeUndefined();
    expect(mockPermanentRedirect).not.toHaveBeenCalled();
  });
});
