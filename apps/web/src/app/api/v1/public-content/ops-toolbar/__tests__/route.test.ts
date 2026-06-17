import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentAdminUser = vi.fn();

vi.mock("@/server/auth/admin", () => ({
  getCurrentAdminUser: (...args: unknown[]) => mockGetCurrentAdminUser(...args),
}));

import { GET } from "../route";

describe("api/v1/public-content/ops-toolbar route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("관리자 세션이 없으면 toolbar model을 반환하지 않는다", async () => {
    mockGetCurrentAdminUser.mockResolvedValue(null);

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/public-content/ops-toolbar?channel=support&slug=nexa/guides/add-nexa-discord-bot"
      )
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
  });

  it("관리자 세션이 있으면 읽기 전용 toolbar model을 반환한다", async () => {
    mockGetCurrentAdminUser.mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "owner@yeon.world",
    });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/public-content/ops-toolbar?channel=support&slug=nexa/guides/add-nexa-discord-bot"
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        actions: [
          expect.objectContaining({ kind: "preview", label: "draft 보기" }),
          expect.objectContaining({ kind: "seo", label: "SEO 검사" }),
          expect.objectContaining({ kind: "sitemap", label: "sitemap" }),
        ],
        robotsIndexable: false,
        sitemapIncluded: true,
      })
    );
  });
});
