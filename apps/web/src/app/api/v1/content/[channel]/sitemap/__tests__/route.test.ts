import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetchPublicContentSitemapFromSpring = vi.fn();

vi.mock("@/server/public-content-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/public-content-spring-client")
  >("@/server/public-content-spring-client");

  return {
    ...actual,
    fetchPublicContentSitemapFromSpring: (...args: unknown[]) =>
      mockFetchPublicContentSitemapFromSpring(...args),
  };
});
import { GET } from "../route";

describe("api/v1/content/[channel]/sitemap route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET은 channel별 Spring sitemap을 반환한다", async () => {
    mockFetchPublicContentSitemapFromSpring.mockResolvedValue({
      entries: [
        {
          url: "https://support.yeon.world",
          lastModified: "2026-06-17T00:00:00.000Z",
          changeFrequency: "weekly",
          priority: 0.7,
        },
      ],
    });

    const response = await GET(
      new NextRequest("http://localhost/api/v1/content/support/sitemap"),
      { params: Promise.resolve({ channel: "support" }) }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      entries: [
        {
          url: "https://support.yeon.world",
          lastModified: "2026-06-17T00:00:00.000Z",
          changeFrequency: "weekly",
          priority: 0.7,
        },
      ],
    });
    expect(mockFetchPublicContentSitemapFromSpring).toHaveBeenCalledWith(
      "support"
    );
  });

  it("GET은 잘못된 channel path를 400으로 거절한다", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/v1/content/invalid/sitemap"),
      { params: Promise.resolve({ channel: "invalid" }) }
    );

    expect(response.status).toBe(400);
    expect(mockFetchPublicContentSitemapFromSpring).not.toHaveBeenCalled();
  });
});
