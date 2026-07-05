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
  metadataTitle: string;
  metadataDescription: string;
  metadataLocale: string;
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
  swfOverlayLoading: string;
  swfOverlayDescription: string;
  fullscreen: string;
  gameIntro: string;
  controls: string;
  source: string;
  dateLocale: string;
  like: {
    loadError: string;
    loginRequired: string;
    actionFailed: string;
    likeLabel: string;
    unlikeLabel: string;
  };
  favorite: {
    loadError: string;
    loginRequired: string;
    actionFailed: string;
    addLabel: string;
    removeLabel: string;
    activeLabel: string;
    inactiveLabel: string;
  };
  comments: {
    heading: string;
    count: (count: number) => string;
    loadError: string;
    contentRequired: string;
    nicknameRequired: string;
    passwordRequired: string;
    submitFailed: string;
    passwordPrompt: string;
    revealFailed: string;
    deleteConfirm: string;
    deleteFailed: string;
    likeLoginRequired: string;
    likeFailed: string;
    nicknamePlaceholder: string;
    passwordPlaceholder: string;
    contentPlaceholder: string;
    secretLabel: string;
    submitting: string;
    submit: string;
    latest: string;
    popular: string;
    empty: string;
    guest: string;
    secretComment: string;
    likeLabel: string;
    revealWithPassword: string;
    delete: string;
  };
  profileMenu: Partial<YeonProductProfileMenuLabels>;
};

const GAME_SERVICE_TEXT: Record<GameServiceLanguage, GameServiceText> = {
  ko: {
    headerBrand: "YEON 게임",
    navAriaLabel: "YEON 게임 서비스 이동",
    metadataTitle: "게임 - 브라우저에서 바로 즐기는 게임 모음",
    metadataDescription:
      "설치 없이 브라우저에서 바로 플레이할 수 있는 게임을 한곳에 모은 YEON 게임 허브입니다.",
    metadataLocale: "ko_KR",
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
    swfOverlayLoading: "게임을 불러오는 중...",
    swfOverlayDescription: "용량이 커서 잠시 걸릴 수 있어요",
    fullscreen: "전체화면",
    gameIntro: "게임 소개",
    controls: "조작법",
    source: "출처",
    dateLocale: "ko-KR",
    like: {
      loadError: "좋아요 정보를 불러오지 못했습니다.",
      loginRequired: "좋아요는 로그인 후 이용할 수 있어요.",
      actionFailed: "좋아요를 처리하지 못했어요.",
      likeLabel: "좋아요",
      unlikeLabel: "좋아요 취소",
    },
    favorite: {
      loadError: "찜 목록을 불러오지 못했습니다.",
      loginRequired: "찜은 로그인 후 이용할 수 있어요.",
      actionFailed: "찜을 처리하지 못했어요.",
      addLabel: "찜하기",
      removeLabel: "찜 취소",
      activeLabel: "찜함",
      inactiveLabel: "찜",
    },
    comments: {
      heading: "댓글",
      count: (count) => `${count}개`,
      loadError: "댓글을 불러오지 못했습니다.",
      contentRequired: "댓글 내용을 입력해 주세요.",
      nicknameRequired: "닉네임을 입력해 주세요.",
      passwordRequired: "비밀번호는 4자 이상이어야 합니다.",
      submitFailed: "댓글을 등록하지 못했습니다.",
      passwordPrompt: "비밀번호를 입력하세요",
      revealFailed: "확인하지 못했습니다.",
      deleteConfirm: "댓글을 삭제할까요?",
      deleteFailed: "삭제하지 못했습니다.",
      likeLoginRequired: "좋아요는 로그인 후 이용할 수 있어요.",
      likeFailed: "좋아요를 처리하지 못했어요.",
      nicknamePlaceholder: "닉네임",
      passwordPlaceholder: "비밀번호",
      contentPlaceholder: "댓글을 남겨보세요",
      secretLabel: "비밀댓글",
      submitting: "등록 중...",
      submit: "등록",
      latest: "최신순",
      popular: "인기순",
      empty: "첫 댓글을 남겨보세요!",
      guest: "게스트",
      secretComment: "비밀 댓글입니다.",
      likeLabel: "좋아요",
      revealWithPassword: "비밀번호로 보기",
      delete: "삭제",
    },
    profileMenu: PLATFORM_PROFILE_MENU_LABELS.ko,
  },
  en: {
    headerBrand: "YEON Games",
    navAriaLabel: "YEON game service navigation",
    metadataTitle: "Games - Instant browser games",
    metadataDescription:
      "YEON Games collects browser games you can play instantly without installing anything.",
    metadataLocale: "en_US",
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
    swfOverlayLoading: "Loading game...",
    swfOverlayDescription: "Large games can take a moment to start.",
    fullscreen: "Fullscreen",
    gameIntro: "About this game",
    controls: "Controls",
    source: "Source",
    dateLocale: "en-US",
    like: {
      loadError: "Could not load like information.",
      loginRequired: "Sign in to like games.",
      actionFailed: "Could not update the like.",
      likeLabel: "Like",
      unlikeLabel: "Unlike",
    },
    favorite: {
      loadError: "Could not load favorites.",
      loginRequired: "Sign in to save favorites.",
      actionFailed: "Could not update favorites.",
      addLabel: "Add to favorites",
      removeLabel: "Remove from favorites",
      activeLabel: "Saved",
      inactiveLabel: "Save",
    },
    comments: {
      heading: "Comments",
      count: (count) => `${count} ${count === 1 ? "comment" : "comments"}`,
      loadError: "Could not load comments.",
      contentRequired: "Enter a comment.",
      nicknameRequired: "Enter a nickname.",
      passwordRequired: "Password must be at least 4 characters.",
      submitFailed: "Could not post the comment.",
      passwordPrompt: "Enter the password",
      revealFailed: "Could not verify it.",
      deleteConfirm: "Delete this comment?",
      deleteFailed: "Could not delete the comment.",
      likeLoginRequired: "Sign in to like comments.",
      likeFailed: "Could not update the like.",
      nicknamePlaceholder: "Nickname",
      passwordPlaceholder: "Password",
      contentPlaceholder: "Write a comment",
      secretLabel: "Secret comment",
      submitting: "Posting...",
      submit: "Post",
      latest: "Latest",
      popular: "Popular",
      empty: "Be the first to comment.",
      guest: "Guest",
      secretComment: "Secret comment.",
      likeLabel: "Like",
      revealWithPassword: "Reveal with password",
      delete: "Delete",
    },
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
