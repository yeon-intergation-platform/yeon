import { describe, expect, it } from "vitest";
import {
  getPublicContentSupportHomeProblemEntries,
  getPublicContentSupportHomeServiceEntries,
} from "./public-content-support-home";

describe("public content support home", () => {
  it("support 홈 주요 문제 진입은 실제 공개 support 글만 우선순위대로 만든다", () => {
    const entries = getPublicContentSupportHomeProblemEntries();

    expect(entries.map((entry) => entry.prompt)).toEqual([
      "NEXA를 서버에 추가해야 해요",
      "NEXA 봇이 답하지 않아요",
      "디스코드 권한이 맞는지 확인하고 싶어요",
      "타자연습을 바로 시작하고 싶어요",
      "플래시카드 덱을 만들고 싶어요",
      "커뮤니티에 글을 쓰고 싶어요",
    ]);
    expect(entries[0]).toMatchObject({
      categoryLabel: "가이드",
      href: "https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
      serviceLabel: "NEXA",
    });
    expect(entries.every((entry) => entry.article.channel === "support")).toBe(
      true
    );
  });

  it("support 홈 주요 문제 진입 개수를 제한할 수 있다", () => {
    expect(
      getPublicContentSupportHomeProblemEntries({ limit: 3 }).map(
        (entry) => entry.href
      )
    ).toEqual([
      "https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
      "https://support.yeon.world/nexa/troubleshooting/bot-not-responding",
      "https://support.yeon.world/nexa/guides/discord-bot-permissions",
    ]);
    expect(
      getPublicContentSupportHomeProblemEntries({ limit: 0 })
    ).toHaveLength(0);
  });

  it("support 홈 서비스 진입 카드는 실제 서비스 collection을 2/3열 UI에 넘길 데이터로 만든다", () => {
    const entries = getPublicContentSupportHomeServiceEntries();

    expect(entries.map((entry) => entry.service)).toEqual([
      "nexa",
      "typing",
      "card",
      "community",
      "account",
    ]);
    expect(entries[0]).toMatchObject({
      href: "https://support.yeon.world/nexa",
      label: "NEXA",
    });
    expect(entries.every((entry) => entry.articleCount > 0)).toBe(true);
    expect(entries.every((entry) => entry.description.length > 0)).toBe(true);
  });
});
