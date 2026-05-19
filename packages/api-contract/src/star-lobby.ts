import { z } from "zod";

export const STAR_LOBBY_ROOM_STATUS = {
  OBSERVED: "observed",
  DISAPPEARED: "disappeared",
} as const;

export const STAR_LOBBY_ALERT_MATCH_STATUS = {
  MATCHED: "matched",
  SUPPRESSED: "suppressed",
} as const;

export const STAR_LOBBY_LIVE_EVENT_TYPE = {
  ROOM_OBSERVED: "room_observed",
  ROOM_DISAPPEARED: "room_disappeared",
  ALERT_MATCHED: "alert_matched",
} as const;

export const starLobbyRoomStatusSchema = z.enum([
  STAR_LOBBY_ROOM_STATUS.OBSERVED,
  STAR_LOBBY_ROOM_STATUS.DISAPPEARED,
]);
export type StarLobbyRoomStatus = z.infer<typeof starLobbyRoomStatusSchema>;

export const starLobbyAlertMatchStatusSchema = z.enum([
  STAR_LOBBY_ALERT_MATCH_STATUS.MATCHED,
  STAR_LOBBY_ALERT_MATCH_STATUS.SUPPRESSED,
]);
export type StarLobbyAlertMatchStatus = z.infer<
  typeof starLobbyAlertMatchStatusSchema
>;

export const starLobbyLiveEventTypeSchema = z.enum([
  STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_OBSERVED,
  STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_DISAPPEARED,
  STAR_LOBBY_LIVE_EVENT_TYPE.ALERT_MATCHED,
]);
export type StarLobbyLiveEventType = z.infer<
  typeof starLobbyLiveEventTypeSchema
>;

export const starLobbyKeywordSchema = z.string().trim().min(1).max(80);
export type StarLobbyKeyword = z.infer<typeof starLobbyKeywordSchema>;

export const starLobbyObservedRoomDtoSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(160),
  currentPlayers: z.number().int().min(0).max(12).nullable(),
  maxPlayers: z.number().int().min(1).max(12).nullable(),
  status: starLobbyRoomStatusSchema,
  observedAt: z.string().datetime(),
  lastSeenAt: z.string().datetime(),
  disappearedAt: z.string().datetime().nullable(),
  matchedKeywords: z.array(starLobbyKeywordSchema),
  rawText: z.string().max(1000).nullable(),
});
export type StarLobbyObservedRoomDto = z.infer<
  typeof starLobbyObservedRoomDtoSchema
>;

export const starLobbyAlertRuleDtoSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(80),
  includeKeywords: z.array(starLobbyKeywordSchema).min(1).max(20),
  excludeKeywords: z.array(starLobbyKeywordSchema).max(20),
  minPlayers: z.number().int().min(0).max(12).nullable(),
  maxPlayers: z.number().int().min(1).max(12).nullable(),
  enabled: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type StarLobbyAlertRuleDto = z.infer<typeof starLobbyAlertRuleDtoSchema>;

export const starLobbyObservationRoomBodySchema = z.object({
  title: z.string().trim().min(1).max(160),
  currentPlayers: z.number().int().min(0).max(12).nullable().optional(),
  maxPlayers: z.number().int().min(1).max(12).nullable().optional(),
  rawText: z.string().max(1000).nullable().optional(),
});
export type StarLobbyObservationRoomBody = z.infer<
  typeof starLobbyObservationRoomBodySchema
>;

export const ingestStarLobbyObservationBodySchema = z.object({
  observedAt: z.string().datetime().optional(),
  rooms: z.array(starLobbyObservationRoomBodySchema).max(300),
});
export type IngestStarLobbyObservationBody = z.infer<
  typeof ingestStarLobbyObservationBodySchema
>;

export const createStarLobbyAlertRuleBodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  includeKeywords: z.array(starLobbyKeywordSchema).min(1).max(20),
  excludeKeywords: z.array(starLobbyKeywordSchema).max(20).default([]),
  minPlayers: z.number().int().min(0).max(12).nullable().optional(),
  maxPlayers: z.number().int().min(1).max(12).nullable().optional(),
});
export type CreateStarLobbyAlertRuleBody = z.infer<
  typeof createStarLobbyAlertRuleBodySchema
>;

export const updateStarLobbyAlertRuleBodySchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  includeKeywords: z.array(starLobbyKeywordSchema).min(1).max(20).optional(),
  excludeKeywords: z.array(starLobbyKeywordSchema).max(20).optional(),
  minPlayers: z.number().int().min(0).max(12).nullable().optional(),
  maxPlayers: z.number().int().min(1).max(12).nullable().optional(),
  enabled: z.boolean().optional(),
});
export type UpdateStarLobbyAlertRuleBody = z.infer<
  typeof updateStarLobbyAlertRuleBodySchema
>;

export const starLobbyAlertMatchDtoSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  roomId: z.string(),
  status: starLobbyAlertMatchStatusSchema,
  matchedKeyword: starLobbyKeywordSchema.nullable(),
  suppressedKeyword: starLobbyKeywordSchema.nullable(),
  matchedAt: z.string().datetime(),
});
export type StarLobbyAlertMatchDto = z.infer<
  typeof starLobbyAlertMatchDtoSchema
>;

export const starLobbyRoomListResponseSchema = z.object({
  rooms: z.array(starLobbyObservedRoomDtoSchema),
  observedAt: z.string().datetime().nullable(),
});
export type StarLobbyRoomListResponse = z.infer<
  typeof starLobbyRoomListResponseSchema
>;

export const starLobbyAlertRuleListResponseSchema = z.object({
  rules: z.array(starLobbyAlertRuleDtoSchema),
});
export type StarLobbyAlertRuleListResponse = z.infer<
  typeof starLobbyAlertRuleListResponseSchema
>;

export const starLobbyAlertRuleMutationResponseSchema = z.object({
  rule: starLobbyAlertRuleDtoSchema,
});
export type StarLobbyAlertRuleMutationResponse = z.infer<
  typeof starLobbyAlertRuleMutationResponseSchema
>;

export const starLobbyAlertRuleDeletionResponseSchema = z.object({
  deletedRuleId: z.string(),
});
export type StarLobbyAlertRuleDeletionResponse = z.infer<
  typeof starLobbyAlertRuleDeletionResponseSchema
>;

export const starLobbyObservationIngestResponseSchema = z.object({
  rooms: z.array(starLobbyObservedRoomDtoSchema),
  matches: z.array(starLobbyAlertMatchDtoSchema),
  observedAt: z.string().datetime(),
});
export type StarLobbyObservationIngestResponse = z.infer<
  typeof starLobbyObservationIngestResponseSchema
>;

export const starLobbyLiveEventDtoSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_OBSERVED),
    room: starLobbyObservedRoomDtoSchema,
  }),
  z.object({
    type: z.literal(STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_DISAPPEARED),
    room: starLobbyObservedRoomDtoSchema,
  }),
  z.object({
    type: z.literal(STAR_LOBBY_LIVE_EVENT_TYPE.ALERT_MATCHED),
    room: starLobbyObservedRoomDtoSchema,
    match: starLobbyAlertMatchDtoSchema,
    rule: starLobbyAlertRuleDtoSchema,
  }),
]);
export type StarLobbyLiveEventDto = z.infer<typeof starLobbyLiveEventDtoSchema>;
