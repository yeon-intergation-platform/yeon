// 게임 허브 카탈로그(MVP는 정적). 외부에서 임베드를 허용하는 게임만 등록한다.
// 향후 GameDistribution 등 feed API 연동으로 자동 수집 가능.

export const GAME_CATEGORIES = {
  popular: "popular",
  arcade: "arcade",
  classic: "classic",
  html5: "html5",
  io: "io",
  puzzle: "puzzle",
} as const;

export type GameCategory =
  (typeof GAME_CATEGORIES)[keyof typeof GAME_CATEGORIES];

export const GAME_CATEGORY_LABELS: Record<GameCategory, string> = {
  popular: "인기 게임",
  arcade: "오락실",
  classic: "고전",
  html5: "HTML5",
  io: "IO 게임",
  puzzle: "퍼즐",
};

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
  /** 임베드 허용 iframe URL */
  embedUrl: string;
  orientation: "landscape" | "portrait";
};

// 게임은 임베드를 공식 허용하는 CrazyGames embed(/embed/{slug})를 사용한다.
// 새 게임 추가는 작동 확인된 embedUrl을 가진 항목을 배열에 넣기만 하면 된다.
export const GAME_CATALOG = [
  {
    slug: "2048",
    title: "2048",
    summary: "같은 숫자 타일을 합쳐 2048을 만드는 중독성 퍼즐.",
    description:
      "방향키로 타일을 밀어 같은 숫자끼리 합칩니다. 보드가 가득 차기 전에 2048 타일을 만들면 승리입니다. 짧고 강한 집중이 필요한 클래식 퍼즐 게임입니다.",
    controls: ["방향키(↑↓←→)로 타일 이동", "모바일은 스와이프"],
    category: GAME_CATEGORIES.puzzle,
    provider: "CrazyGames (공식 임베드)",
    embedUrl: "https://www.crazygames.com/embed/2048",
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
    provider: "CrazyGames (공식 임베드)",
    embedUrl: "https://www.crazygames.com/embed/hextris",
    orientation: "landscape",
  },
  {
    slug: "snake-io",
    title: "Snake.io",
    summary: "다른 플레이어를 가두며 몸집을 키우는 실시간 IO 스네이크.",
    description:
      "먹이를 먹어 길이를 늘리고, 다른 뱀의 진로를 막아 처치합니다. 실시간으로 전 세계 플레이어와 경쟁하는 대표적인 IO 게임입니다.",
    controls: ["마우스로 방향 조절", "클릭/스페이스로 부스트"],
    category: GAME_CATEGORIES.io,
    provider: "CrazyGames (공식 임베드)",
    embedUrl: "https://www.crazygames.com/embed/snake-io",
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
    provider: "CrazyGames (공식 임베드)",
    embedUrl: "https://www.crazygames.com/embed/smash-karts",
    orientation: "landscape",
  },
  {
    slug: "bullet-force",
    title: "Bullet Force",
    summary: "팀 데스매치 중심의 3D 멀티플레이어 FPS.",
    description:
      "다양한 무기와 맵에서 실시간으로 다른 플레이어와 총격전을 벌입니다. 팀 데스매치, 컨퀘스트 등 여러 모드를 지원하는 본격 FPS입니다.",
    controls: ["WASD 이동, 마우스 조준", "좌클릭 사격, R 재장전"],
    category: GAME_CATEGORIES.html5,
    provider: "CrazyGames (공식 임베드)",
    embedUrl: "https://www.crazygames.com/embed/bullet-force-multiplayer",
    orientation: "landscape",
  },
] as const satisfies readonly GameEntry[];

export function getListedGames(): readonly GameEntry[] {
  return GAME_CATALOG;
}

export function getGameBySlug(slug: string): GameEntry | null {
  return GAME_CATALOG.find((game) => game.slug === slug) ?? null;
}

export function getGameSlugs(): readonly string[] {
  return GAME_CATALOG.map((game) => game.slug);
}
