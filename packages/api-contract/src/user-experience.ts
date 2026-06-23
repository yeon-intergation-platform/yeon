import { z } from "zod";

// 경험치/레벨 도메인 계약. 백엔드(Java record + Jackson) 직렬화와 필드명·타입을 정확히 맞춘다.
// web/mobile가 동일 @yeon/api-contract/user-experience를 import해 추론 타입을 공유한다.

// 활동 유형 라벨(한국어). 백엔드 activityType 문자열 → 표시 라벨.
// as const + literal union(zod-contract 컨벤션) — 런타임 산출/트리쉐이킹 안정.
export const EXPERIENCE_ACTIVITY_LABELS = {
  deck_created: "카드덱 생성",
  card_room_finished: "카드방 학습 완료",
  typing_race_finished: "타자 레이스 완료",
  community_post: "커뮤니티 활동",
  daily_login: "출석",
  game_play: "게임 플레이",
} as const;
export type ExperienceActivityType = keyof typeof EXPERIENCE_ACTIVITY_LABELS;
export type ExperienceActivityLabels = typeof EXPERIENCE_ACTIVITY_LABELS;

// 현재 레벨/경험치 요약. 헤더 뱃지·프로필 패널 공용.
export const userExperienceViewSchema = z.object({
  level: z.number().int(),
  totalXp: z.number().int(),
  xpIntoLevel: z.number().int(),
  xpForNextLevel: z.number().int(),
  // 레벨 파생 보상 포인트(레벨업당 1000P). 1만 포인트 도달 시 관리자 문의로 현금 전환 안내.
  // 백엔드 배포 전 구 응답(필드 없음) 호환을 위해 기본값 0으로 둔다.
  points: z.number().int().default(0),
});
export type UserExperienceView = z.infer<typeof userExperienceViewSchema>;

// 경험치 적립 이력 1건.
export const experienceHistoryItemSchema = z.object({
  activityType: z.string(),
  xpAmount: z.number().int(),
  referenceId: z.string(),
  totalXpAfter: z.number().int(),
  createdAt: z.string(),
});
export type ExperienceHistoryItem = z.infer<typeof experienceHistoryItemSchema>;

export const experienceHistoryResponseSchema = z.object({
  items: z.array(experienceHistoryItemSchema),
});
export type ExperienceHistoryResponse = z.infer<
  typeof experienceHistoryResponseSchema
>;

// 관리자: 사용자 목록 1건(레벨/경험치/카드덱 수 포함).
export const adminUserItemSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string().nullable(),
  role: z.string(),
  level: z.number().int(),
  totalXp: z.number().int(),
  cardDeckCount: z.number().int(),
  createdAt: z.string(),
});
export type AdminUserItem = z.infer<typeof adminUserItemSchema>;

export const adminUserListResponseSchema = z.object({
  users: z.array(adminUserItemSchema),
});
export type AdminUserListResponse = z.infer<typeof adminUserListResponseSchema>;

// 관리자: 특정 사용자의 카드덱 1건.
export const adminCardDeckItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  itemCount: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AdminCardDeckItem = z.infer<typeof adminCardDeckItemSchema>;

export const adminUserCardDecksResponseSchema = z.object({
  cardDecks: z.array(adminCardDeckItemSchema),
});
export type AdminUserCardDecksResponse = z.infer<
  typeof adminUserCardDecksResponseSchema
>;
