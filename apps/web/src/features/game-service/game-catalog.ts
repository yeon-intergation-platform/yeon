// 게임 허브 카탈로그. 게임은 임베드를 공식 허용하고 광고 수익이 yeon에 귀속되는
// GameMonetize Publisher 게임만 등록한다(임베드 URL = https://html5.gamemonetize.co/{id}/).
//
// 이 파일의 CURATED_GAMES는 동기 소스다. SEO sitemap / generateStaticParams /
// JSON-LD 같은 정적 경로가 동기 함수(getGameSlugs/getListedGames/getGameBySlug)를
// 사용하므로, 간판(featured) 게임은 여기서 정적으로 관리한다. 허브의 대량 목록은
// game-source.ts가 GameMonetize Feed를 캐싱해 동적으로 덧붙인다.

export const GAME_CATEGORIES = {
  arcade: "arcade",
  puzzle: "puzzle",
  action: "action",
  shooting: "shooting",
  racing: "racing",
  sports: "sports",
  adventure: "adventure",
  casual: "casual",
  io: "io",
} as const;

export type GameCategory =
  (typeof GAME_CATEGORIES)[keyof typeof GAME_CATEGORIES];

export const GAME_CATEGORY_LABELS: Record<GameCategory, string> = {
  arcade: "아케이드",
  puzzle: "퍼즐",
  action: "액션",
  shooting: "슈팅",
  racing: "레이싱",
  sports: "스포츠",
  adventure: "어드벤처",
  casual: "캐주얼",
  io: "IO 게임",
};

// 허브 카테고리 탭 노출 순서(라벨 정의 순서와 분리해 UI 우선순위를 명시한다).
export const GAME_CATEGORY_ORDER: readonly GameCategory[] = [
  GAME_CATEGORIES.arcade,
  GAME_CATEGORIES.puzzle,
  GAME_CATEGORIES.action,
  GAME_CATEGORIES.shooting,
  GAME_CATEGORIES.racing,
  GAME_CATEGORIES.sports,
  GAME_CATEGORIES.adventure,
  GAME_CATEGORIES.casual,
  GAME_CATEGORIES.io,
];

export const GAME_PROVIDER = "GameMonetize (공식 임베드)";
export const CRAZYGAMES_PROVIDER = "CrazyGames (공식 임베드)";

export type GameEntry = {
  /** URL 식별자(/game-service/{slug}) */
  slug: string;
  title: string;
  /** 카드/메타용 한 줄 요약 */
  summary: string;
  /** 상세 본문 설명 */
  description: string;
  /** 조작법 */
  controls: readonly string[];
  category: GameCategory;
  /** 게임 출처(저작권/임베드 허용 주체) */
  provider: string;
  /**
   * 실행 방식. "iframe"(기본)은 embedUrl을 외부 임베드 iframe src로,
   * "swf"는 우리가 호스팅한 SWF 경로로 보고 Ruffle로 실행한다.
   */
  kind?: "iframe" | "swf";
  /** kind="iframe"이면 iframe src, kind="swf"이면 호스팅 SWF 경로 */
  embedUrl: string;
  /** 카드 썸네일/플레이 전 포스터 이미지 */
  thumbUrl: string;
  orientation: "landscape" | "portrait";
};

// 간판 게임(정적). CrazyGames 공식 임베드 + GameMonetize 실데이터를 한국어로 큐레이션했다.
// CrazyGames는 game.yeon.world 임베드 화이트리스트 등록을 전제로 유지한다.
export const CURATED_GAMES = [
  {
    slug: "snake-io",
    title: "Snake.io",
    summary: "다른 플레이어를 가두며 몸집을 키우는 실시간 IO 스네이크.",
    description:
      "먹이를 먹어 길이를 늘리고, 다른 뱀의 진로를 막아 처치합니다. 실시간으로 전 세계 플레이어와 경쟁하는 대표적인 IO 게임입니다.",
    controls: ["마우스로 방향 조절", "클릭/스페이스로 부스트"],
    category: GAME_CATEGORIES.io,
    provider: CRAZYGAMES_PROVIDER,
    embedUrl: "https://www.crazygames.com/embed/snake-io",
    thumbUrl:
      "https://imgs.crazygames.com/snake-io_16x9/20260302021932/snake-io_16x9-cover?metadata=none&quality=100&width=600&height=315&fit=crop",
    orientation: "landscape",
  },
  {
    slug: "smash-karts",
    title: "Smash Karts",
    summary: "아이템으로 상대를 폭파하는 3D 멀티 카트 배틀.",
    description:
      "카트를 몰며 맵의 아이템을 먹고 미사일·기관총으로 상대를 처치합니다. 정해진 시간 안에 가장 많이 처치한 플레이어가 승리하는 실시간 멀티 게임입니다.",
    controls: ["방향키 또는 WASD로 이동", "스페이스로 아이템 사용"],
    category: GAME_CATEGORIES.io,
    provider: CRAZYGAMES_PROVIDER,
    embedUrl: "https://www.crazygames.com/embed/smash-karts",
    thumbUrl:
      "https://imgs.crazygames.com/smash-karts_16x9/20260210123937/smash-karts_16x9-cover?metadata=none&quality=100&width=600&height=315&fit=crop",
    orientation: "landscape",
  },
  {
    slug: "bullet-force",
    title: "Bullet Force",
    summary: "팀 데스매치 중심의 3D 멀티플레이어 FPS.",
    description:
      "다양한 무기와 맵에서 실시간으로 다른 플레이어와 총격전을 벌입니다. 팀 데스매치, 컨퀘스트 등 여러 모드를 지원하는 본격 FPS입니다.",
    controls: ["WASD 이동, 마우스 조준", "좌클릭 사격, R 재장전"],
    category: GAME_CATEGORIES.shooting,
    provider: CRAZYGAMES_PROVIDER,
    embedUrl: "https://www.crazygames.com/embed/bullet-force-multiplayer",
    thumbUrl:
      "https://imgs.crazygames.com/bullet-force-multiplayer_16x9/20260213105606/bullet-force-multiplayer_16x9-cover?metadata=none&quality=100&width=600&height=315&fit=crop",
    orientation: "landscape",
  },
  {
    slug: "2048",
    title: "2048",
    summary: "같은 숫자 타일을 합쳐 2048을 만드는 중독성 퍼즐.",
    description:
      "방향키로 타일을 밀어 같은 숫자끼리 합칩니다. 보드가 가득 차기 전에 2048 타일을 만들면 승리입니다. 짧고 강한 집중이 필요한 클래식 퍼즐 게임입니다.",
    controls: ["방향키(↑↓←→)로 타일 이동", "모바일은 스와이프"],
    category: GAME_CATEGORIES.puzzle,
    provider: CRAZYGAMES_PROVIDER,
    embedUrl: "https://www.crazygames.com/embed/2048",
    thumbUrl:
      "https://imgs.crazygames.com/games/2048/cover_16x9-1707828856995.png?metadata=none&quality=100&width=600&height=315&fit=crop",
    orientation: "landscape",
  },
  {
    slug: "hextris",
    title: "Hextris",
    summary: "테트리스에서 영감을 받은 육각형 회전 퍼즐.",
    description:
      "중앙 육각형을 회전시켜 떨어지는 같은 색 블록을 맞춥니다. 같은 색이 연달아 쌓이면 사라집니다. 속도가 점점 빨라지는 반응형 아케이드 퍼즐입니다.",
    controls: ["좌/우 방향키 또는 화면 좌우 터치로 회전"],
    category: GAME_CATEGORIES.arcade,
    provider: CRAZYGAMES_PROVIDER,
    embedUrl: "https://www.crazygames.com/embed/hextris",
    thumbUrl: "",
    orientation: "landscape",
  },
  {
    slug: "monster-stomper",
    title: "Monster Stomper",
    summary: "강렬한 비트에 맞춰 발판을 밟고 내려찍는 아케이드 플랫포머.",
    description:
      "음악에 맞춰 떠 있는 발판 사이를 점프하고, 강력한 내려찍기로 정확히 착지하는 아케이드 플랫포머입니다. 슬로우 모션으로 낙하 지점을 계산하며 10개의 스테이지를 돌파하세요. 속도와 타이밍, 리듬 감각이 핵심입니다.",
    controls: ["탭/클릭으로 점프", "길게 눌러 내려찍기"],
    category: GAME_CATEGORIES.arcade,
    provider: GAME_PROVIDER,
    embedUrl: "https://html5.gamemonetize.co/8mv0fxseod6ttm0rddecmuofvtvgrke3/",
    thumbUrl:
      "https://img.gamemonetize.com/8mv0fxseod6ttm0rddecmuofvtvgrke3/512x384.jpg",
    orientation: "portrait",
  },
  {
    slug: "impostor-sort-puzzle",
    title: "Impostor Sort Puzzle",
    summary: "같은 색 캐릭터를 분류해 푸는 중독성 색깔 정렬 퍼즐.",
    description:
      "캐릭터를 색깔별로 정리해 단계를 풀어가는 색깔 정렬 퍼즐입니다. 규칙은 단순하지만 단계가 올라갈수록 머리를 써야 하는 두뇌·논리 퍼즐로, 짧은 집중이 필요한 캐주얼 퍼즐 게임입니다.",
    controls: ["마우스/탭으로 선택·이동"],
    category: GAME_CATEGORIES.puzzle,
    provider: GAME_PROVIDER,
    embedUrl: "https://html5.gamemonetize.co/gs0w9b20h717rjux9br455jr4fj2swe2/",
    thumbUrl:
      "https://img.gamemonetize.com/gs0w9b20h717rjux9br455jr4fj2swe2/512x384.jpg",
    orientation: "landscape",
  },
  {
    slug: "duo-match-3d",
    title: "Duo Match 3D",
    summary: "제한 시간 안에 같은 짝을 찾아 골대에 넣는 스피드 매칭 퍼즐.",
    description:
      "같은 모양 두 개를 찾아 시간이 다 가기 전에 골대에 넣는 스피드 매칭 퍼즐입니다. 빠르게 연속으로 맞출수록 최대 x20까지 점수 배수가 올라갑니다. 2분만 하려다 한 시간을 보내게 되는 짧고 강한 게임입니다.",
    controls: ["마우스 클릭 또는 탭으로 짝 선택"],
    category: GAME_CATEGORIES.puzzle,
    provider: GAME_PROVIDER,
    embedUrl: "https://html5.gamemonetize.co/673vfpai43mknmn3imhsv0k149qydtn9/",
    thumbUrl:
      "https://img.gamemonetize.com/673vfpai43mknmn3imhsv0k149qydtn9/512x384.jpg",
    orientation: "landscape",
  },
  {
    slug: "astro-chickens",
    title: "Astro Chickens",
    summary: "10개 환경을 누비며 외계 닭떼를 격추하는 우주선 슈팅 액션.",
    description:
      "우주선을 조종해 끝없이 몰려오는 외계 닭떼를 격추하는 슈팅 액션입니다. 적을 처치해 코인을 모으고 파워업을 획득하며, 다섯 번째 웨이브마다 보스가 등장합니다. 결승선은 없고 더 높은 점수만 있습니다.",
    controls: ["마우스로 이동·조준", "스페이스 또는 우클릭으로 특수 능력"],
    category: GAME_CATEGORIES.action,
    provider: GAME_PROVIDER,
    embedUrl: "https://html5.gamemonetize.co/6jwaemwcybdksn8n7yuqfs416vcevd9u/",
    thumbUrl:
      "https://img.gamemonetize.com/6jwaemwcybdksn8n7yuqfs416vcevd9u/512x384.jpg",
    orientation: "landscape",
  },
  {
    slug: "magic-knife",
    title: "Magic Knife",
    summary: "던진 칼이 되돌아오는 한 손 캐주얼 액션.",
    description:
      "칼을 던지면 다시 손으로 돌아오는 간단한 캐주얼 액션입니다. 적의 머리를 한두 번 탭해 한 번의 투척으로 여러 적을 처치하세요. 누구나 바로 즐길 수 있는 가벼운 게임입니다.",
    controls: ["적을 탭/클릭해 칼 던지기"],
    category: GAME_CATEGORIES.shooting,
    provider: GAME_PROVIDER,
    embedUrl: "https://html5.gamemonetize.co/hp0gxzl1kc29lx4ayopwwumtjxbv59hw/",
    thumbUrl:
      "https://img.gamemonetize.com/hp0gxzl1kc29lx4ayopwwumtjxbv59hw/512x384.jpg",
    orientation: "landscape",
  },
  {
    slug: "extreme-car-racing",
    title: "Extreme Car Racing",
    summary: "교통체증과 경찰 추격을 피해 질주하는 하이웨이 레이싱.",
    description:
      "끝없이 이어지는 고속도로에서 교통 차량과 장애물을 피하며 경찰 추격을 따돌리는 스피드 레이싱입니다. 빠른 판단과 조작이 핵심이며, 최대한 오래 살아남아 운전 실력을 한계까지 밀어붙이세요.",
    controls: ["좌우 조작으로 차선 변경", "마우스/탭 또는 방향키"],
    category: GAME_CATEGORIES.racing,
    provider: GAME_PROVIDER,
    embedUrl: "https://html5.gamemonetize.co/aw97e3jihnd8b0txhj0ngq4353xi0zh3/",
    thumbUrl:
      "https://img.gamemonetize.com/aw97e3jihnd8b0txhj0ngq4353xi0zh3/512x384.jpg",
    orientation: "landscape",
  },
  {
    slug: "basketball-goat",
    title: "Basketball GOAT",
    summary: "부드러운 조작과 사실적인 공 물리의 캐주얼 농구.",
    description:
      "코트에 올라 최고의 농구 선수가 될 수 있는지 증명하는 캐주얼 스포츠 게임입니다. 빠른 템포의 농구 액션과 실력 기반 플레이, 사실적인 공 물리로 누구나 부담 없이 즐길 수 있습니다.",
    controls: ["마우스/탭으로 슛 조준·발사"],
    category: GAME_CATEGORIES.sports,
    provider: GAME_PROVIDER,
    embedUrl: "https://html5.gamemonetize.co/5wnj7eq5j718vi5zur2rm64ld4jguwl7/",
    thumbUrl:
      "https://img.gamemonetize.com/5wnj7eq5j718vi5zur2rm64ld4jguwl7/512x384.jpg",
    orientation: "landscape",
  },
  {
    slug: "commando-gun-shooting",
    title: "Commando Gun Shooting",
    summary: "네 가지 모드를 오가며 임무를 수행하는 1인칭 슈팅.",
    description:
      "폭발적인 임무와 긴박한 교전이 이어지는 1인칭 슈팅 게임입니다. 적 소탕, 폭탄 해체, 인질 구출 등 네 가지 전투 모드에서 사격 실력과 전략을 시험하세요.",
    controls: ["마우스로 조준·사격", "화면 버튼으로 이동·재장전"],
    category: GAME_CATEGORIES.adventure,
    provider: GAME_PROVIDER,
    embedUrl: "https://html5.gamemonetize.co/t2a672cdfu2471c0ek19v6fr26za27z7/",
    thumbUrl:
      "https://img.gamemonetize.com/t2a672cdfu2471c0ek19v6fr26za27z7/512x384.jpg",
    orientation: "landscape",
  },
  {
    slug: "farming-mini-puzzle",
    title: "Farming Mini Puzzle",
    summary: "농장을 가꾸며 퍼즐을 푸는 잔잔한 캐주얼 퍼즐.",
    description:
      "다채로운 농장을 배경으로 퍼즐을 풀고 농사 과제를 완료하는 잔잔한 캐주얼 퍼즐입니다. 문제 해결 능력을 기르며 편안하게 즐길 수 있는 두뇌 게임입니다.",
    controls: ["마우스/탭으로 조작"],
    category: GAME_CATEGORIES.puzzle,
    provider: GAME_PROVIDER,
    embedUrl: "https://html5.gamemonetize.co/8kx80mxkw6oud0cmw1viet49amwkw671/",
    thumbUrl:
      "https://img.gamemonetize.com/8kx80mxkw6oud0cmw1viet49amwkw671/512x384.jpg",
    orientation: "landscape",
  },
  {
    slug: "dream-wedding-dress-up",
    title: "Dream Wedding Dress Up",
    summary: "드레스와 소품을 골라 신부를 꾸미는 드레스업 캐주얼.",
    description:
      "네 가지 웨딩 테마에서 드레스, 헤어, 액세서리를 조합해 나만의 신부 룩을 완성하는 드레스업 게임입니다. 완성한 신부와 기념 사진을 찍으며 그날의 분위기를 연출하세요.",
    controls: ["마우스/탭으로 아이템 선택"],
    category: GAME_CATEGORIES.casual,
    provider: GAME_PROVIDER,
    embedUrl: "https://html5.gamemonetize.co/mu0skxjyuys27ciet1gptxee8jgcm3z7/",
    thumbUrl:
      "https://img.gamemonetize.com/mu0skxjyuys27ciet1gptxee8jgcm3z7/512x384.jpg",
    orientation: "landscape",
  },
  {
    slug: "manhwa-character-rpg-3",
    title: "만화캐릭RPG 시즌3",
    summary: "주전자닷컴의 추억의 만화 캐릭터 RPG(만캐알). 제작자 허락받아 보존합니다.",
    description:
      "바버플금님이 제작하고 주전자닷컴이 배급한 추억의 플래시 RPG '만화캐릭RPG(만캐알) 시즌3'입니다. 제작자 바버플금님의 사용 허락을 받아, Ruffle로 원작 그대로 보존·실행합니다. 키보드와 마우스로 캐릭터를 조작하며 진행하는 RPG입니다.",
    controls: ["키보드 방향키·단축키로 이동·전투", "마우스로 메뉴 조작"],
    category: GAME_CATEGORIES.adventure,
    provider: "제작: 바버플금 · 배급: 주전자닷컴 (제작자 사용 허락)",
    kind: "swf",
    embedUrl: "/games/manhwa-character-rpg-3.swf",
    thumbUrl: "",
    orientation: "landscape",
  },
] as const satisfies readonly GameEntry[];

// 기존 임포트(GAME_CATALOG) 호환 유지.
export const GAME_CATALOG = CURATED_GAMES;

export function getListedGames(): readonly GameEntry[] {
  return CURATED_GAMES;
}

export function getGameBySlug(slug: string): GameEntry | null {
  return CURATED_GAMES.find((game) => game.slug === slug) ?? null;
}

export function getGameSlugs(): readonly string[] {
  return CURATED_GAMES.map((game) => game.slug);
}

// GameMonetize 임베드 URL(https://html5.gamemonetize.co/{hash}/)에서 게임 식별 해시를
// 뽑아 중복 판정 키로 쓴다. curated와 feed가 같은 게임을 가리킬 때 한 번만 노출한다.
export function getGameEmbedKey(embedUrl: string): string {
  const match = embedUrl.match(/gamemonetize\.co\/([^/]+)/i);
  return (match?.[1] ?? embedUrl).toLowerCase();
}

// 국가 취향 추천. 무명 대량 게임을 무분별하게 노출하지 않고, 국가별로 검증된 게임을
// 상단(featured)에 큐레이션한다. 한국/미국 토글로 전환하며, 초기값은 접속 국가로 정한다.
export const GAME_REGIONS = {
  kr: "kr",
  us: "us",
  global: "global",
} as const;

export type GameRegion = (typeof GAME_REGIONS)[keyof typeof GAME_REGIONS];

export const GAME_REGION_LABELS: Record<GameRegion, string> = {
  kr: "🇰🇷 한국 인기",
  us: "🇺🇸 미국 인기",
  global: "인기 게임",
};

// 국가별 추천 슬롯(노출 순서대로). 합법 임베드가 검증된 curated 게임만 올린다.
// 한국 취향 게임 풀 확대(물불 등 임베드 검증)는 백로그 2차에서 이어서 채운다.
const REGION_FEATURED_SLUGS: Record<GameRegion, readonly string[]> = {
  kr: [
    "manhwa-character-rpg-3",
    "snake-io",
    "2048",
    "smash-karts",
    "impostor-sort-puzzle",
    "duo-match-3d",
    "dream-wedding-dress-up",
    "hextris",
  ],
  us: [
    "bullet-force",
    "extreme-car-racing",
    "basketball-goat",
    "astro-chickens",
    "commando-gun-shooting",
    "magic-knife",
    "smash-karts",
    "snake-io",
  ],
  global: [
    "snake-io",
    "2048",
    "bullet-force",
    "smash-karts",
    "extreme-car-racing",
    "monster-stomper",
    "impostor-sort-puzzle",
    "basketball-goat",
  ],
};

export function isGameRegion(value: string | null | undefined): value is GameRegion {
  return value === "kr" || value === "us" || value === "global";
}

// 접속 국가 코드(Cloudflare CF-IPCountry 등)를 추천 region으로 정규화한다. 한국만 kr, 그 외 us.
export function resolveRegionFromCountry(
  countryCode: string | null | undefined
): GameRegion {
  return countryCode?.trim().toUpperCase() === "KR"
    ? GAME_REGIONS.kr
    : GAME_REGIONS.us;
}

// region별 추천 게임(curated에서 슬롯 순서대로). 존재하지 않는 slug는 건너뛴다.
export function getFeaturedGamesForRegion(region: GameRegion): GameEntry[] {
  return REGION_FEATURED_SLUGS[region]
    .map((slug) => getGameBySlug(slug))
    .filter((game): game is GameEntry => game !== null);
}
