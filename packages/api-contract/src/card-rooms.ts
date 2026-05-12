import { z } from "zod";

export const CARD_ROOM_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

export const CARD_ROOM_STATUS = {
  WAITING: "waiting",
  ANSWERING: "answering",
  PASSED: "passed",
  GIVEN_UP: "given_up",
  REVEALED: "revealed",
  FINISHED: "finished",
} as const;

export const CARD_ROOM_ROLE = {
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
  CARD_ROOM_STATUS.ANSWERING,
  CARD_ROOM_STATUS.PASSED,
  CARD_ROOM_STATUS.GIVEN_UP,
  CARD_ROOM_STATUS.REVEALED,
  CARD_ROOM_STATUS.FINISHED,
]);
export type CardRoomStatus = z.infer<typeof cardRoomStatusSchema>;

export const cardRoomRoleSchema = z.enum([
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
});
export type CardRoomResponse = z.infer<typeof cardRoomResponseSchema>;

export const cardRoomParticipantResponseSchema = z.object({
  participant: cardRoomParticipantDtoSchema,
  room: cardRoomDetailDtoSchema,
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
