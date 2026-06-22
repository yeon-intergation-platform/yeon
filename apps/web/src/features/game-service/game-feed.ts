// GameMonetize Feed 어댑터. Feed JSON(전 필드 string)을 yeon GameEntry로 변환한다.
//
// 확정된 Feed 사실(2026-06-22 실측):
// - 엔드포인트: https://gamemonetize.com/feed.php?format=0&page={n}&type=html5&amount={k}
// - category=All / company=All 을 넣으면 [] 반환 → 두 파라미터는 생략하고 수집 후 필터.
// - 임베드 URL = item.url = https://html5.gamemonetize.co/{hash}/ (.co)
// - description/instructions 에 HTML 엔티티 포함 → 디코딩 필요.
// - Cloudflare rate-limit(error code: 1015) 존재 → 반드시 서버 캐싱(revalidate)으로만 호출.
//
// 이 모듈은 순수 함수(스키마/매핑/디코드)와 캐싱 fetch만 제공한다. 서버 컴포넌트에서만
// 호출하고(클라이언트 번들 금지), 데이터 접근 조합은 game-source.ts가 담당한다.

import { z } from "zod";
import {
  GAME_CATEGORIES,
  GAME_PROVIDER,
  type GameCategory,
  type GameEntry,
} from "./game-catalog";

// zod v4 문자열 포맷 API 버전 차이를 피하려 http(s) URL은 정규식으로 직접 검증한다.
const httpUrlSchema = z.string().regex(/^https?:\/\//i, "http(s) URL이 아닙니다");

export const gameMonetizeFeedItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  instructions: z.string().default(""),
  url: httpUrlSchema,
  category: z.string().default(""),
  tags: z.string().default(""),
  thumb: httpUrlSchema,
  width: z.string().default("800"),
  height: z.string().default("600"),
});

export type GameMonetizeFeedItem = z.infer<typeof gameMonetizeFeedItemSchema>;

export const gameMonetizeFeedSchema = z.array(z.unknown());

// GameMonetize 표준 카테고리 → yeon GameCategory. 누락/공백은 arcade로 fallback.
const GAMEMONETIZE_CATEGORY_MAP: Record<string, GameCategory> = {
  puzzle: GAME_CATEGORIES.puzzle,
  hypercasual: GAME_CATEGORIES.casual,
  arcade: GAME_CATEGORIES.arcade,
  adventure: GAME_CATEGORIES.adventure,
  shooting: GAME_CATEGORIES.shooting,
  racing: GAME_CATEGORIES.racing,
  sports: GAME_CATEGORIES.sports,
  soccer: GAME_CATEGORIES.sports,
  action: GAME_CATEGORIES.action,
  stickman: GAME_CATEGORIES.action,
  boys: GAME_CATEGORIES.action,
  "3d": GAME_CATEGORIES.action,
  girls: GAME_CATEGORIES.casual,
  cooking: GAME_CATEGORIES.casual,
  clicker: GAME_CATEGORIES.arcade,
  multiplayer: GAME_CATEGORIES.io,
  ".io": GAME_CATEGORIES.io,
  io: GAME_CATEGORIES.io,
};

export function mapFeedCategory(rawCategory: string): GameCategory {
  return (
    GAMEMONETIZE_CATEGORY_MAP[rawCategory.trim().toLowerCase()] ??
    GAME_CATEGORIES.arcade
  );
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

// Feed 본문의 HTML 엔티티를 디코딩한다(서버/클라이언트 무관, DOM 비의존).
export function decodeHtmlEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, body: string) => {
    if (body[0] === "#") {
      const codePoint =
        body[1]?.toLowerCase() === "x"
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);
      if (Number.isFinite(codePoint) && codePoint > 0) {
        return String.fromCodePoint(codePoint);
      }
      return match;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

function normalizeText(input: string): string {
  return decodeHtmlEntities(input).replace(/\s+/g, " ").trim();
}

function toSummary(description: string): string {
  const text = normalizeText(description);
  if (!text) return "브라우저에서 바로 즐기는 게임입니다.";
  const firstSentence = text.split(/(?<=[.!?])\s/)[0] ?? text;
  if (firstSentence.length <= 90) return firstSentence;
  return `${firstSentence.slice(0, 88).trimEnd()}…`;
}

// 조작법은 Feed instructions를 줄/구분자 기준으로 쪼갠다. 비면 기본 안내.
function toControls(instructions: string): readonly string[] {
  const text = normalizeText(instructions);
  if (!text) return ["마우스/탭으로 조작"];
  const parts = text
    .split(/(?:^|\s)[-•]\s|\.\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const controls = parts.length > 0 ? parts : [text];
  return controls.slice(0, 4);
}

// title을 URL slug로 만들고 id를 붙여 충돌을 막는다(예: "Magic Knife" + 80434 → magic-knife-80434).
export function toGameSlug(title: string, id: string): string {
  const base = normalizeText(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base ? `${base}-${id}` : `game-${id}`;
}

export function mapFeedItemToGame(item: GameMonetizeFeedItem): GameEntry {
  const width = Number.parseInt(item.width, 10) || 800;
  const height = Number.parseInt(item.height, 10) || 600;

  return {
    slug: toGameSlug(item.title, item.id),
    title: normalizeText(item.title),
    summary: toSummary(item.description),
    description: normalizeText(item.description).slice(0, 600),
    controls: toControls(item.instructions),
    category: mapFeedCategory(item.category),
    provider: GAME_PROVIDER,
    embedUrl: item.url,
    thumbUrl: item.thumb,
    orientation: height > width ? "portrait" : "landscape",
  };
}

// 검증을 통과한 항목만 GameEntry로 변환한다(Fail-soft: 잘못된 레코드는 건너뛴다).
export function mapFeedPayloadToGames(payload: unknown): GameEntry[] {
  const rawList = gameMonetizeFeedSchema.safeParse(payload);
  if (!rawList.success) return [];

  const games: GameEntry[] = [];
  for (const raw of rawList.data) {
    const parsed = gameMonetizeFeedItemSchema.safeParse(raw);
    if (parsed.success) games.push(mapFeedItemToGame(parsed.data));
  }
  return games;
}

const DEFAULT_FEED_URL =
  "https://gamemonetize.com/feed.php?format=0&page=1&type=html5&amount=200";

// 허브에 노출할 동적 게임 상한. Feed는 한 페이지에 수천 건을 줄 수 있어 잘라낸다.
export const GAME_FEED_LIMIT = 180;

// rate-limit·과대 응답 대비로 12시간 서버 캐시. 운영에서 더 줄일 필요 없으면 유지.
export const GAME_FEED_REVALIDATE_SECONDS = 60 * 60 * 12;

function resolveFeedUrl(): string {
  return process.env.GAMEMONETIZE_FEED_URL?.trim() || DEFAULT_FEED_URL;
}

// GameMonetize Feed를 서버에서 캐싱 fetch 해 GameEntry[]로 반환한다.
// 실패(네트워크/1015/파싱)는 빈 배열로 degrade 한다 — 호출부는 curated로 fallback.
export async function fetchGameFeed(): Promise<GameEntry[]> {
  try {
    const response = await fetch(resolveFeedUrl(), {
      headers: { accept: "application/json" },
      next: { revalidate: GAME_FEED_REVALIDATE_SECONDS },
    });
    if (!response.ok) return [];

    const payload = (await response.json()) as unknown;
    return mapFeedPayloadToGames(payload).slice(0, GAME_FEED_LIMIT);
  } catch {
    return [];
  }
}
