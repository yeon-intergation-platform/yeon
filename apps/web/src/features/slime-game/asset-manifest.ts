export type SheetAsset = {
  id: string;
  title: string;
  src: string;
  cell: string;
  purpose: string;
  evidence: string[];
};

export const SLIME_GAME_ASSETS = {
  slimeHero: "/slime-game/assets/slime_hero_sheet.png",
  effects: "/slime-game/assets/effects_sheet.png",
  forestTiles: "/slime-game/assets/forest_tiles_sheet.png",
  props: "/slime-game/assets/props_sheet.png",
  portal: "/slime-game/assets/portal_sheet.png",
  greenSlime: "/slime-game/assets/green_slime_enemy_sheet.png",
  bat: "/slime-game/assets/bat_enemy_sheet.png",
  mushroom: "/slime-game/assets/mushroom_enemy_sheet.png",
  itemsUi: "/slime-game/assets/items_ui_sheet.png",
  forestBackground: "/slime-game/assets/forest_background_sheet.png",
} as const;

export const SHEET_ASSET_MANIFEST: SheetAsset[] = [
  {
    id: "slime_hero_sheet",
    title: "핑크 슬라임 주인공",
    src: SLIME_GAME_ASSETS.slimeHero,
    cell: "64x64 / bottom-center",
    purpose: "플레이어 조작 상태 전체",
    evidence: [
      "idle/walk/jump/fall은 이동 상태에 직접 매핑",
      "melee_01은 근접 히트박스가 켜지는 프레임",
      "cast_01은 투사체가 생성되는 프레임",
      "climb_back은 사다리 상태에서만 사용하고 사다리 이미지와 합성하지 않음",
    ],
  },
  {
    id: "effects_sheet",
    title: "공격/피드백 이펙트",
    src: SLIME_GAME_ASSETS.effects,
    cell: "32x32 + 64x64",
    purpose: "캐릭터와 분리된 재사용 이펙트",
    evidence: [
      "slash_arc는 slime_melee_01과 동시에 표시",
      "pink_projectile은 slime_cast_01에서 생성",
      "hit_spark/projectile_impact는 명중 지점에 표시",
    ],
  },
  {
    id: "forest_tiles_sheet",
    title: "숲 맵 타일",
    src: SLIME_GAME_ASSETS.forestTiles,
    cell: "32x32 / top-left",
    purpose: "충돌 가능한 평지/발판 구성",
    evidence: [
      "grass/dirt/wood/stone은 platform collision과 1:1 매핑",
      "경사 타일은 초기 충돌 복잡도를 줄이기 위해 제외",
    ],
  },
  {
    id: "props_sheet",
    title: "맵 요소",
    src: SLIME_GAME_ASSETS.props,
    cell: "32x32 중심",
    purpose: "사다리, 상자, 장식, 포탈 받침",
    evidence: [
      "ladder_top/mid/bottom은 climbable trigger를 구성",
      "사다리에는 슬라임을 합성하지 않고 player climb_back 프레임만 전환",
    ],
  },
  {
    id: "portal_sheet",
    title: "포탈",
    src: SLIME_GAME_ASSETS.portal,
    cell: "96x128 / bottom-center",
    purpose: "맵 이동 트리거",
    evidence: ["포탈 중앙 48x80 영역이 플레이어와 겹치면 클리어 상태로 전환"],
  },
  {
    id: "green_slime_enemy_sheet",
    title: "초록 슬라임 몬스터",
    src: SLIME_GAME_ASSETS.greenSlime,
    cell: "48x48 / bottom-center",
    purpose: "초반 지상형 몬스터 AI",
    evidence: [
      "move/attack/hurt/dead가 순찰, 접촉 공격, 피격, 처치 상태에 매핑",
    ],
  },
  {
    id: "bat_enemy_sheet",
    title: "박쥐 몬스터",
    src: SLIME_GAME_ASSETS.bat,
    cell: "48x48 / center",
    purpose: "공중형 몬스터 AI",
    evidence: ["jump 대신 fly/dive/bite로 공중 몬스터 행동을 표현"],
  },
  {
    id: "mushroom_enemy_sheet",
    title: "버섯 몬스터",
    src: SLIME_GAME_ASSETS.mushroom,
    cell: "64x64 / bottom-center",
    purpose: "느린 지상형 몬스터 AI",
    evidence: ["walk/jump/attack/hurt/dead가 지상 추적형 몬스터 상태에 매핑"],
  },
  {
    id: "items_ui_sheet",
    title: "아이템/HUD",
    src: SLIME_GAME_ASSETS.itemsUi,
    cell: "32x32 + HUD 조각",
    purpose: "코인, 포션, 키, 체력/경험치 UI",
    evidence: ["coin은 수집 오브젝트, heart/hp_bar는 HUD 상태 표시"],
  },
  {
    id: "forest_background_sheet",
    title: "숲 배경",
    src: SLIME_GAME_ASSETS.forestBackground,
    cell: "가변 배경 조각",
    purpose: "충돌 없는 패럴랙스 배경",
    evidence: ["게임 월드 뒤 레이어에만 쓰고 collision에는 참여하지 않음"],
  },
];
