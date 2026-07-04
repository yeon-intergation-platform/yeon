import type { YeonProductProfileMenuLabels } from "@yeon/ui";
import {
  GAME_COLLECTIONS,
  GAME_REGIONS,
  getGameTags,
  type GameCategory,
  type GameCollection,
  type GameEntry,
  type GameHubTab,
  type GameRegion,
} from "./game-catalog";
import {
  PLATFORM_LANGUAGES,
  PLATFORM_PROFILE_MENU_LABELS,
  type PlatformLanguage,
} from "@/lib/platform-language";

export type GameServiceLanguage = PlatformLanguage;

type GameServiceText = {
  headerBrand: string;
  navAriaLabel: string;
  heroTitle: string;
  heroDescription: string;
  searchPlaceholder: string;
  searchLabel: string;
  searchSubmitLabel: string;
  featuredBadge: string;
  playLabel: string;
  more: string;
  recent: string;
  favorites: string;
  featured: string;
  retro: string;
  popular: string;
  viewAll: string;
  allGames: string;
  empty: string;
  count: (count: number) => string;
  searchHeading: (query: string) => string;
  categoryHeading: (categoryLabel: string) => string;
  previous: string;
  next: string;
  backToList: string;
  startGame: string;
  openNewTab: string;
  openNewTabLink: string;
  swfLoading: string;
  fullscreen: string;
  gameIntro: string;
  controls: string;
  source: string;
  profileMenu: Partial<YeonProductProfileMenuLabels>;
};

const GAME_SERVICE_TEXT: Record<GameServiceLanguage, GameServiceText> = {
  ko: {
    headerBrand: "YEON 게임",
    navAriaLabel: "YEON 게임 서비스 이동",
    heroTitle: "바로 즐기는 게임 모음",
    heroDescription: "설치 없이 브라우저에서 바로 플레이할 수 있어요!",
    searchPlaceholder: "게임을 검색해보세요",
    searchLabel: "게임 검색",
    searchSubmitLabel: "검색",
    featuredBadge: "추천",
    playLabel: "플레이하기",
    more: "더보기",
    recent: "최근 플레이",
    favorites: "찜한 게임",
    featured: "운영자 추천",
    retro: "추억의 플래시 게임",
    popular: "인기 게임",
    viewAll: "전체 게임 보러가기",
    allGames: "전체 게임",
    empty: "표시할 게임이 없습니다. 곧 추가될 예정이에요.",
    count: (count) => `${count}개`,
    searchHeading: (query) => `'${query}' 검색 결과`,
    categoryHeading: (categoryLabel) => `${categoryLabel} 게임`,
    previous: "이전",
    next: "다음",
    backToList: "게임 목록",
    startGame: "게임 시작",
    openNewTab: "게임이 보이지 않으면",
    openNewTabLink: "새 탭에서 열기",
    swfLoading:
      "용량이 큰 추억의 플래시 게임입니다. 처음 불러올 때 잠시 기다려 주세요.",
    fullscreen: "전체화면",
    gameIntro: "게임 소개",
    controls: "조작법",
    source: "출처",
    profileMenu: PLATFORM_PROFILE_MENU_LABELS.ko,
  },
  en: {
    headerBrand: "YEON Games",
    navAriaLabel: "YEON game service navigation",
    heroTitle: "Instant Browser Games",
    heroDescription: "Play curated browser games without installing anything.",
    searchPlaceholder: "Search games",
    searchLabel: "Search games",
    searchSubmitLabel: "Search",
    featuredBadge: "Featured",
    playLabel: "Play",
    more: "More",
    recent: "Recently played",
    favorites: "Favorites",
    featured: "Editor picks",
    retro: "Retro games",
    popular: "Popular games",
    viewAll: "View all games",
    allGames: "All games",
    empty: "No games to show yet. More games are coming soon.",
    count: (count) => `${count} games`,
    searchHeading: (query) => `Search results for '${query}'`,
    categoryHeading: (categoryLabel) => `${categoryLabel} games`,
    previous: "Previous",
    next: "Next",
    backToList: "Game list",
    startGame: "Start game",
    openNewTab: "If the game does not appear,",
    openNewTabLink: "open it in a new tab",
    swfLoading:
      "This is a larger retro Flash game. Please wait a moment while it loads.",
    fullscreen: "Fullscreen",
    gameIntro: "About this game",
    controls: "Controls",
    source: "Source",
    profileMenu: PLATFORM_PROFILE_MENU_LABELS.en,
  },
};

const CATEGORY_LABELS: Record<
  GameServiceLanguage,
  Record<GameCategory, string>
> = {
  ko: {
    arcade: "아케이드",
    puzzle: "퍼즐",
    action: "액션",
    shooting: "슈팅",
    racing: "레이싱",
    sports: "스포츠",
    adventure: "어드벤처",
    casual: "캐주얼",
    io: "IO 게임",
  },
  en: {
    arcade: "Arcade",
    puzzle: "Puzzle",
    action: "Action",
    shooting: "Shooting",
    racing: "Racing",
    sports: "Sports",
    adventure: "Adventure",
    casual: "Casual",
    io: "IO",
  },
};

const COLLECTION_LABELS: Record<
  GameServiceLanguage,
  Record<GameCollection, string>
> = {
  ko: {
    featured: "운영자 추천",
    retro: "추억의 플래시 게임",
    popular: "인기 게임",
    rpgmaker: "쯔꾸르 게임",
    twoPlayer: "2인용 게임",
  },
  en: {
    featured: "Editor picks",
    retro: "Retro games",
    popular: "Popular games",
    rpgmaker: "RPG Maker games",
    twoPlayer: "Two-player games",
  },
};

const REGION_LABELS: Record<GameServiceLanguage, Record<GameRegion, string>> = {
  ko: {
    kr: "🇰🇷 한국",
    us: "🇺🇸 미국",
    global: "인기",
  },
  en: {
    kr: "🇰🇷 Korea",
    us: "🇺🇸 United States",
    global: "Popular",
  },
};

const HUB_TABS: Record<GameServiceLanguage, readonly GameHubTab[]> = {
  ko: [
    { key: "all", label: "전체", type: "all" },
    {
      key: "featured",
      label: "추천",
      type: "collection",
      collection: GAME_COLLECTIONS.featured,
    },
    {
      key: "retro",
      label: "추억게임",
      type: "collection",
      collection: GAME_COLLECTIONS.retro,
    },
    {
      key: "popular",
      label: "인기게임",
      type: "collection",
      collection: GAME_COLLECTIONS.popular,
    },
    {
      key: "rpgmaker",
      label: "쯔꾸르",
      type: "collection",
      collection: GAME_COLLECTIONS.rpgmaker,
    },
    { key: "puzzle", label: "퍼즐", type: "category", category: "puzzle" },
    { key: "action", label: "액션", type: "category", category: "action" },
    {
      key: "shooting",
      label: "슈팅",
      type: "category",
      category: "shooting",
    },
    { key: "racing", label: "레이싱", type: "category", category: "racing" },
    { key: "sports", label: "스포츠", type: "category", category: "sports" },
    {
      key: "arcade",
      label: "아케이드",
      type: "category",
      category: "arcade",
    },
    { key: "casual", label: "캐주얼", type: "category", category: "casual" },
    {
      key: "twoPlayer",
      label: "2인용",
      type: "collection",
      collection: GAME_COLLECTIONS.twoPlayer,
    },
  ],
  en: [
    { key: "all", label: "All", type: "all" },
    {
      key: "featured",
      label: "Picks",
      type: "collection",
      collection: GAME_COLLECTIONS.featured,
    },
    {
      key: "retro",
      label: "Retro",
      type: "collection",
      collection: GAME_COLLECTIONS.retro,
    },
    {
      key: "popular",
      label: "Popular",
      type: "collection",
      collection: GAME_COLLECTIONS.popular,
    },
    {
      key: "rpgmaker",
      label: "RPG Maker",
      type: "collection",
      collection: GAME_COLLECTIONS.rpgmaker,
    },
    { key: "puzzle", label: "Puzzle", type: "category", category: "puzzle" },
    { key: "action", label: "Action", type: "category", category: "action" },
    {
      key: "shooting",
      label: "Shooting",
      type: "category",
      category: "shooting",
    },
    { key: "racing", label: "Racing", type: "category", category: "racing" },
    { key: "sports", label: "Sports", type: "category", category: "sports" },
    { key: "arcade", label: "Arcade", type: "category", category: "arcade" },
    { key: "casual", label: "Casual", type: "category", category: "casual" },
    {
      key: "twoPlayer",
      label: "Two player",
      type: "collection",
      collection: GAME_COLLECTIONS.twoPlayer,
    },
  ],
};

const ENGLISH_TAGS: Record<string, readonly string[]> = {
  "snake-io": ["IO", "Multiplayer"],
  "smash-karts": ["Racing", "Multiplayer"],
  "bullet-force": ["FPS", "Multiplayer"],
  "2048": ["Numbers", "Brain game"],
  hextris: ["Blocks", "Reflex"],
  "monster-stomper": ["Rhythm", "Platformer"],
  "impostor-sort-puzzle": ["Sorting", "Logic"],
  "duo-match-3d": ["Matching", "Speed"],
  "astro-chickens": ["Space", "Shooter"],
  "magic-knife": ["Casual", "One tap"],
  "extreme-car-racing": ["Highway", "Speed"],
  "basketball-goat": ["Basketball", "Casual"],
  "commando-gun-shooting": ["FPS", "Missions"],
  "farming-mini-puzzle": ["Farm", "Relaxing"],
  "dream-wedding-dress-up": ["Dress up", "Style"],
  "moto-x3m": ["Motorbike", "Stunts"],
  "drift-hunters": ["Drifting", "Tuning"],
  "paper-io-2": ["IO", "Territory"],
  "count-masters-stickman-games": ["Runner", "Crowd"],
  "tiny-fishing": ["Fishing", "Relaxing"],
  "short-life": ["Ragdoll", "Traps"],
  "getaway-shootout": ["Two player", "Party"],
  "rooftop-snipers": ["Two player", "Duel"],
  "fireboy-and-watergirl-the-forest-temple": ["Two player", "Co-op", "Puzzle"],
  "cubes-2048-io": ["IO", "Numbers"],
  "geometry-dash-online": ["Rhythm", "Reflex"],
  "helix-jump": ["One tap", "Falling"],
  "uno-online-four-colors": ["Cards", "Board game"],
  "manhwa-character-rpg-3": ["RPG", "Retro"],
};

const ENGLISH_CONTROLS_BY_CATEGORY: Record<GameCategory, readonly string[]> = {
  arcade: ["Use the keyboard, mouse, or touch controls shown in the game."],
  puzzle: ["Use the mouse, keyboard, or touch controls shown in the game."],
  action: [
    "Move with the keyboard or on-screen controls.",
    "Use the game UI to attack or interact.",
  ],
  shooting: [
    "Move with WASD or the on-screen controls.",
    "Aim and shoot with the mouse or touch controls.",
  ],
  racing: ["Use arrow keys, WASD, or the on-screen driving controls."],
  sports: ["Aim and play with the mouse or touch controls shown in the game."],
  adventure: ["Move and interact with the controls shown inside the game."],
  casual: ["Use the mouse or touch controls shown in the game."],
  io: ["Move with the mouse, keyboard, or touch controls shown in the game."],
};

const HANGUL_PATTERN = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;
const TITLE_WORD_OVERRIDES: Record<string, string> = {
  io: "IO",
  rpg: "RPG",
  fps: "FPS",
  x3m: "X3M",
  "3d": "3D",
  "2048": "2048",
};

function toEnglishTitleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => {
      const override = TITLE_WORD_OVERRIDES[word];
      if (override) return override;
      return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
    })
    .join(" ");
}

function getEnglishGameTitle(game: GameEntry) {
  return HANGUL_PATTERN.test(game.title)
    ? toEnglishTitleFromSlug(game.slug)
    : game.title;
}

export function getGameServiceText(language: GameServiceLanguage) {
  return GAME_SERVICE_TEXT[language];
}

export function getLocalizedGameCategoryLabel(
  category: GameCategory,
  language: GameServiceLanguage
) {
  return CATEGORY_LABELS[language][category];
}

export function getLocalizedGameCollectionLabel(
  collection: GameCollection,
  language: GameServiceLanguage
) {
  return COLLECTION_LABELS[language][collection];
}

export function getLocalizedGameRegionLabel(
  region: GameRegion,
  language: GameServiceLanguage
) {
  return REGION_LABELS[language][region];
}

export function getLocalizedGameHubTabs(language: GameServiceLanguage) {
  return HUB_TABS[language];
}

export function getLanguageDefaultGameRegion(
  language: GameServiceLanguage
): GameRegion {
  return language === PLATFORM_LANGUAGES.en ? GAME_REGIONS.us : GAME_REGIONS.kr;
}

export function getLocalizedGameTags(
  game: GameEntry,
  language: GameServiceLanguage
): string[] {
  if (language === PLATFORM_LANGUAGES.ko) {
    return getGameTags(game);
  }

  const base = getLocalizedGameCategoryLabel(game.category, language);
  const extra = ENGLISH_TAGS[game.slug];
  if (!extra) return [base];
  return [base, ...extra.filter((tag) => tag !== base)];
}

export function getLocalizedGameText(
  game: GameEntry,
  language: GameServiceLanguage
) {
  if (language === PLATFORM_LANGUAGES.ko) {
    return {
      title: game.title,
      summary: game.summary,
      description: game.description,
      controls: game.controls,
    };
  }

  const categoryLabel = getLocalizedGameCategoryLabel(
    game.category,
    language
  ).toLowerCase();
  const title = getEnglishGameTitle(game);
  return {
    title,
    summary: `Play ${title}, a ${categoryLabel} browser game selected for English-first players.`,
    description: `${title} runs directly in the browser. YEON Games keeps the surrounding interface in English and prioritizes the U.S. game collection so the entry point, controls, and navigation are easier to follow. Some embedded games may still show publisher-owned UI inside the player.`,
    controls: ENGLISH_CONTROLS_BY_CATEGORY[game.category],
  };
}
