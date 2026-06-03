import { z } from "zod";

export const CARD_ROOM_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

// 방 수준 라이프사이클만 표현한다(finding 20). 카드 단위 진행 상태(정답 공개/결과)는
// status가 아니라 currentCardRevealed / currentCardResult로 분리한다.
export const CARD_ROOM_STATUS = {
  WAITING: "waiting",
  IN_PROGRESS: "in_progress",
  FINISHED: "finished",
  CLOSED: "closed",
} as const;

export const CARD_ROOM_ROLE = {
  // finding 21: 역할 미배정(UNASSIGNED)을 1급 상태로 표현한다. startRoom 검증에서 막힌다.
  UNASSIGNED: "UNASSIGNED",
  MEMORIZER: "MEMORIZER",
  CHECKER: "CHECKER",
} as const;

export const CARD_ROOM_RESULT = {
  OK: "OK",
  GIVE_UP: "GIVE_UP",
  HINTED_OK: "HINTED_OK",
} as const;

export const cardRoomVisibilitySchema = z.enum([
  CARD_ROOM_VISIBILITY.PUBLIC,
  CARD_ROOM_VISIBILITY.PRIVATE,
]);
export type CardRoomVisibility = z.infer<typeof cardRoomVisibilitySchema>;

export const cardRoomStatusSchema = z.enum([
  CARD_ROOM_STATUS.WAITING,
  CARD_ROOM_STATUS.IN_PROGRESS,
  CARD_ROOM_STATUS.FINISHED,
  CARD_ROOM_STATUS.CLOSED,
]);
export type CardRoomStatus = z.infer<typeof cardRoomStatusSchema>;

export const cardRoomRoleSchema = z.enum([
  CARD_ROOM_ROLE.UNASSIGNED,
  CARD_ROOM_ROLE.MEMORIZER,
  CARD_ROOM_ROLE.CHECKER,
]);
export type CardRoomRole = z.infer<typeof cardRoomRoleSchema>;

export const cardRoomResultSchema = z.enum([
  CARD_ROOM_RESULT.OK,
  CARD_ROOM_RESULT.GIVE_UP,
  CARD_ROOM_RESULT.HINTED_OK,
]);
export type CardRoomResult = z.infer<typeof cardRoomResultSchema>;

export const cardRoomProfileSchema = z.object({
  nickname: z.string().min(1).max(40),
  characterId: z.string().min(1).max(80),
});
export type CardRoomProfile = z.infer<typeof cardRoomProfileSchema>;

export const cardRoomSnapshotItemSchema = z.object({
  frontText: z.string().min(1).max(2000),
  backText: z.string().min(1).max(2000),
});
export type CardRoomSnapshotItem = z.infer<typeof cardRoomSnapshotItemSchema>;

export const createCardRoomBodySchema = z
  .object({
    title: z.string().min(1).max(80),
    visibility: cardRoomVisibilitySchema.default(CARD_ROOM_VISIBILITY.PUBLIC),
    deckId: z.string().min(1).max(120).optional(),
    guestDeck: z
      .object({
        title: z.string().min(1).max(120),
        items: z.array(cardRoomSnapshotItemSchema).min(1).max(200),
      })
      .optional(),
    profile: cardRoomProfileSchema,
  })
  .refine((value) => Boolean(value.deckId) !== Boolean(value.guestDeck), {
    message: "deckId 또는 guestDeck 중 하나만 필요합니다.",
  });
export type CreateCardRoomBody = z.infer<typeof createCardRoomBodySchema>;

export const joinCardRoomBodySchema = z.object({
  profile: cardRoomProfileSchema,
  role: cardRoomRoleSchema.optional(),
});
export type JoinCardRoomBody = z.infer<typeof joinCardRoomBodySchema>;

export const updateCardRoomParticipantBodySchema = z.object({
  profile: cardRoomProfileSchema.optional(),
  role: cardRoomRoleSchema.optional(),
  isReady: z.boolean().optional(),
});
export type UpdateCardRoomParticipantBody = z.infer<
  typeof updateCardRoomParticipantBodySchema
>;

export const createCardRoomMessageBodySchema = z.object({
  content: z.string().min(1).max(500),
});
export type CreateCardRoomMessageBody = z.infer<
  typeof createCardRoomMessageBodySchema
>;

export const submitCardRoomResultBodySchema = z.object({
  cardId: z.string().min(1).max(120),
  result: cardRoomResultSchema,
});
export type SubmitCardRoomResultBody = z.infer<
  typeof submitCardRoomResultBodySchema
>;

export const cardRoomParticipantDtoSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  characterId: z.string(),
  role: cardRoomRoleSchema,
  isHost: z.boolean(),
  isReady: z.boolean(),
  joinedAt: z.string().datetime(),
});
export type CardRoomParticipantDto = z.infer<
  typeof cardRoomParticipantDtoSchema
>;

export const cardRoomCardDtoSchema = z.object({
  id: z.string(),
  frontText: z.string(),
  backText: z.string(),
  orderIndex: z.number().int().nonnegative(),
});
export type CardRoomCardDto = z.infer<typeof cardRoomCardDtoSchema>;

export const cardRoomMessageDtoSchema = z.object({
  id: z.string(),
  senderParticipantId: z.string().nullable(),
  senderNickname: z.string().nullable(),
  content: z.string(),
  messageType: z.enum(["user", "system"]),
  createdAt: z.string().datetime(),
});
export type CardRoomMessageDto = z.infer<typeof cardRoomMessageDtoSchema>;

export const cardRoomResultDtoSchema = z.object({
  id: z.string(),
  cardId: z.string(),
  participantId: z.string(),
  result: cardRoomResultSchema,
  createdAt: z.string().datetime(),
});
export type CardRoomResultDto = z.infer<typeof cardRoomResultDtoSchema>;

export const cardRoomSummaryDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  deckTitle: z.string(),
  hostLabel: z.string(),
  visibility: cardRoomVisibilitySchema,
  status: cardRoomStatusSchema,
  currentCardIndex: z.number().int().nonnegative(),
  cardCount: z.number().int().nonnegative(),
  memorizerCount: z.number().int().nonnegative(),
  checkerCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CardRoomSummaryDto = z.infer<typeof cardRoomSummaryDtoSchema>;

export const cardRoomDetailDtoSchema = cardRoomSummaryDtoSchema.extend({
  // finding 20: 현재 카드의 진행 상태를 방 status와 분리해 노출한다.
  // currentCardRevealed: 정답이 공개됐는지(reveal). currentCardResult: 현재 카드의 확정 결과(null이면 미확정).
  currentCardRevealed: z.boolean(),
  currentCardResult: cardRoomResultSchema.nullable(),
  participants: z.array(cardRoomParticipantDtoSchema),
  cards: z.array(cardRoomCardDtoSchema),
  messages: z.array(cardRoomMessageDtoSchema),
  results: z.array(cardRoomResultDtoSchema),
});
export type CardRoomDetailDto = z.infer<typeof cardRoomDetailDtoSchema>;

export const cardRoomListResponseSchema = z.object({
  rooms: z.array(cardRoomSummaryDtoSchema),
});
export type CardRoomListResponse = z.infer<typeof cardRoomListResponseSchema>;

export const cardRoomResponseSchema = z.object({
  room: cardRoomDetailDtoSchema,
  participant: cardRoomParticipantDtoSchema.optional(),
  // 방 생성 시 방장도 입장 응답과 동일하게 (roomId, participantId) 소유 증명 토큰을
  // 함께 받아, 재입장 없이 곧바로 race-server 실시간에 연결할 수 있게 한다.
  participantToken: z.string().nullish(),
});
export type CardRoomResponse = z.infer<typeof cardRoomResponseSchema>;

export const cardRoomParticipantResponseSchema = z.object({
  participant: cardRoomParticipantDtoSchema,
  room: cardRoomDetailDtoSchema,
  // race-server가 참가자 가장(impersonation)을 차단하기 위해 검증하는 소유 증명 토큰.
  // 백엔드 시크릿 미설정 환경에서는 null이며, 하위호환을 위해 nullish 처리한다.
  participantToken: z.string().nullish(),
});
export type CardRoomParticipantResponse = z.infer<
  typeof cardRoomParticipantResponseSchema
>;

export const cardRoomMessagesResponseSchema = z.object({
  messages: z.array(cardRoomMessageDtoSchema),
});
export type CardRoomMessagesResponse = z.infer<
  typeof cardRoomMessagesResponseSchema
>;

export const cardRoomResultResponseSchema = z.object({
  result: cardRoomResultDtoSchema,
  room: cardRoomDetailDtoSchema,
});
export type CardRoomResultResponse = z.infer<
  typeof cardRoomResultResponseSchema
>;
