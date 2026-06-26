import { describe, expect, it } from "vitest";
import {
  GAME_CATALOG,
  GAME_CATEGORY_LABELS,
  getGameSlugs,
} from "@/features/game-service/game-catalog";
import { generateMetadata, generateStaticParams } from "../route-metadata";

describe("game detail route metadata", () => {
  it("generateStaticParams는 카탈로그 전체 slug를 반환한다", () => {
    expect(generateStaticParams()).toEqual(
      getGameSlugs().map((gameSlug) => ({ gameSlug }))
    );
  });

  it("generateMetadata는 상세 canonical과 검색 메타를 game host 기준으로 만든다", async () => {
    const game = GAME_CATALOG[0];
    const canonical = `https://game.yeon.world/${game.slug}`;
    const metadata = await generateMetadata({
      params: Promise.resolve({ gameSlug: game.slug }),
    });

    expect(metadata).toMatchObject({
      description: game.summary,
      alternates: { canonical },
      robots: { index: true, follow: true },
      openGraph: {
        url: canonical,
        description: game.summary,
        type: "website",
        locale: "ko_KR",
      },
      twitter: {
        description: game.summary,
      },
    });
    expect(metadata.title).toContain(game.title);
    expect(metadata.title).toContain(GAME_CATEGORY_LABELS[game.category]);
    expect(metadata.keywords).toContain(`${game.title} 게임`);
  });

  it("generateMetadata는 없는 slug면 noindex 대신 찾을 수 없음 제목만 반환한다", async () => {
    await expect(
      generateMetadata({
        params: Promise.resolve({ gameSlug: "missing-game" }),
      })
    ).resolves.toEqual({ title: "게임을 찾을 수 없습니다 | YEON" });
  });
});
