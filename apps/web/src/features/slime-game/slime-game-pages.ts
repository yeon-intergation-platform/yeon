export const SLIME_VALIDATION_PAGE_IDS = [
  "actions",
  "collision",
  "combat",
] as const;

export type SlimeValidationPageId = (typeof SLIME_VALIDATION_PAGE_IDS)[number];

export type SlimeValidationPageDefinition = {
  id: SlimeValidationPageId;
  pageNumber: number;
  title: string;
  shortTitle: string;
  description: string;
};

export const SLIME_VALIDATION_PAGES: Record<
  SlimeValidationPageId,
  SlimeValidationPageDefinition
> = {
  actions: {
    id: "actions",
    pageNumber: 1,
    title: "액션프레임 검증",
    shortTitle: "액션",
    description: "idle, walk, jump, attack 프레임과 입력 전이를 확인합니다.",
  },
  collision: {
    id: "collision",
    pageNumber: 2,
    title: "지형 충돌 검증",
    shortTitle: "충돌",
    description: "바닥, 벽, 발판, 천장 AABB 접촉을 확인합니다.",
  },
  combat: {
    id: "combat",
    pageNumber: 3,
    title: "히트박스 검증",
    shortTitle: "전투",
    description: "공격 active frame과 몬스터 hurtbox 피해 판정을 확인합니다.",
  },
};

export const SLIME_VALIDATION_PAGE_LIST = SLIME_VALIDATION_PAGE_IDS.map(
  (id) => SLIME_VALIDATION_PAGES[id]
);

export function getSlimeValidationPageIndex(pageId: SlimeValidationPageId) {
  return SLIME_VALIDATION_PAGE_IDS.indexOf(pageId);
}

export function getSlimeValidationPageByOffset({
  pageId,
  offset,
}: {
  pageId: SlimeValidationPageId;
  offset: number;
}) {
  const currentIndex = getSlimeValidationPageIndex(pageId);
  const nextIndex = Math.max(
    0,
    Math.min(SLIME_VALIDATION_PAGE_IDS.length - 1, currentIndex + offset)
  );
  return SLIME_VALIDATION_PAGE_IDS[nextIndex] ?? pageId;
}
