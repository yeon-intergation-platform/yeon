import { beforeEach, describe, expect, it, vi } from "vitest";
import { getGameSlugs } from "@/features/game-service/game-catalog";
import robots from "../robots";
import sitemap from "../sitemap";

const mockGetYeonRequestHeaders = vi.fn();

vi.mock("@yeon/ui/runtime/YeonServerRequest", () => ({
  getYeonRequestHeaders: (...args: unknown[]) =>
    mockGetYeonRequestHeaders(...args),
}));

function setRequestHeaders(headers: Record<string, string>) {
  const normalizedHeaders = new Map(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  );

  mockGetYeonRequestHeaders.mockResolvedValue({
    get: (name: string) => normalizedHeaders.get(name.toLowerCase()) ?? null,
  });
}

describe("sitemap/robots app entrypoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sitemap은 x-forwarded-host를 우선해 game host sitemap을 반환한다", async () => {
    setRequestHeaders({
      host: "yeon.world",
      "x-forwarded-host": "game.yeon.world",
    });

    await expect(sitemap()).resolves.toEqual([
      {
        url: "https://game.yeon.world",
        changeFrequency: "weekly",
        priority: 0.8,
        lastModified: undefined,
      },
      ...getGameSlugs().map((slug) => ({
        url: `https://game.yeon.world/${slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        lastModified: undefined,
      })),
    ]);
  });

  it("robots는 x-forwarded-host를 우선해 해당 host의 sitemap을 안내한다", async () => {
    setRequestHeaders({
      host: "yeon.world",
      "x-forwarded-host": "game.yeon.world",
    });

    await expect(robots()).resolves.toMatchObject({
      sitemap: "https://game.yeon.world/sitemap.xml",
      host: "https://game.yeon.world",
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: expect.arrayContaining(["/api/", "/auth/", "/admin/"]),
      },
    });
  });

  it("알 수 없는 host는 sitemap을 비우고 robots를 noindex 처리한다", async () => {
    setRequestHeaders({
      host: "internal.local",
    });

    await expect(sitemap()).resolves.toEqual([]);
    await expect(robots()).resolves.toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
  });
});
