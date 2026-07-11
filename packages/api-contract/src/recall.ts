import { z } from "zod";
import {
  CARD_BULK_IMPORT_MAX_ITEMS,
  CARD_REVIEW_DIFFICULTIES,
  CARD_TEXT_MAX_LENGTH,
  cardDeckDtoSchema,
  cardDeckItemDtoSchema,
  cardReviewDifficultySchema,
  createCardDeckItemBodySchema,
} from "./card-decks";

export const RECALL_GRADE_VERDICTS = {
  pass: "pass",
  fail: "fail",
} as const;

export const RECALL_GRADE_PASS_SCORE = 70;
export const RECALL_AI_DECK_MAX_ITEMS = 30;
export const RECALL_AI_SOURCE_MAX_LENGTH = 20_000;
export const RECALL_AI_INSTRUCTION_MAX_LENGTH = 1_000;
export const RECALL_ATTEMPT_HISTORY_MAX_LIMIT = 100;

export const RECALL_API_PATHS = {
  attempts(deckId: string, itemId: string) {
    return `/api/v1/card-decks/${encodeURIComponent(deckId)}/items/${encodeURIComponent(itemId)}/recall-attempts`;
  },
  attemptHistory(deckId: string, limit = 20) {
    const search = new URLSearchParams({ limit: String(limit) });
    return `/api/v1/card-decks/${encodeURIComponent(deckId)}/recall-attempts?${search.toString()}`;
  },
  aiDeckPreviews: "/api/v1/card-decks/ai-previews",
  createDeckWithItems: "/api/v1/card-decks/bulk",
} as const;

export const recallGradeVerdictSchema = z.enum([
  RECALL_GRADE_VERDICTS.pass,
  RECALL_GRADE_VERDICTS.fail,
]);
export type RecallGradeVerdict = z.infer<typeof recallGradeVerdictSchema>;

export const createRecallAttemptBodySchema = z.object({
  userAnswer: z.string().trim().min(1).max(CARD_TEXT_MAX_LENGTH),
  idempotencyKey: z.string().uuid(),
});
export type CreateRecallAttemptBody = z.infer<
  typeof createRecallAttemptBodySchema
>;

export const recallGradeResponseSchema = z.object({
  attemptId: z.string().min(1),
  score: z.number().int().min(0).max(100),
  verdict: recallGradeVerdictSchema,
  missedPoints: z.array(z.string().min(1).max(1_000)).max(30),
  feedback: z.string().max(4_000),
  reviewDifficulty: cardReviewDifficultySchema,
  lastReviewedAt: z.string().datetime(),
  nextReviewAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});
export type RecallGradeResponse = z.infer<typeof recallGradeResponseSchema>;

export const recallAttemptDtoSchema = recallGradeResponseSchema.extend({
  deckId: z.string().min(1),
  itemId: z.string().min(1),
  question: z.string().min(1).max(CARD_TEXT_MAX_LENGTH),
  answer: z.string().min(1).max(CARD_TEXT_MAX_LENGTH),
  userAnswer: z.string().min(1).max(CARD_TEXT_MAX_LENGTH),
});
export type RecallAttemptDto = z.infer<typeof recallAttemptDtoSchema>;

export const recallAttemptListQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(RECALL_ATTEMPT_HISTORY_MAX_LIMIT)
    .default(20),
});
export type RecallAttemptListQuery = z.infer<
  typeof recallAttemptListQuerySchema
>;

export const recallAttemptListResponseSchema = z.object({
  attempts: z.array(recallAttemptDtoSchema),
});
export type RecallAttemptListResponse = z.infer<
  typeof recallAttemptListResponseSchema
>;

export const createCardDeckAiPreviewBodySchema = z.object({
  idempotencyKey: z.string().uuid(),
  sourceText: z.string().trim().min(1).max(RECALL_AI_SOURCE_MAX_LENGTH),
  instruction: z
    .string()
    .trim()
    .max(RECALL_AI_INSTRUCTION_MAX_LENGTH)
    .nullish(),
  itemCount: z.number().int().min(1).max(RECALL_AI_DECK_MAX_ITEMS),
});
export type CreateCardDeckAiPreviewBody = z.infer<
  typeof createCardDeckAiPreviewBodySchema
>;

export const cardDeckAiDraftItemSchema = z.object({
  frontText: z.string().trim().min(1).max(CARD_TEXT_MAX_LENGTH),
  backText: z.string().trim().min(1).max(CARD_TEXT_MAX_LENGTH),
});
export type CardDeckAiDraftItem = z.infer<typeof cardDeckAiDraftItemSchema>;

export const cardDeckAiPreviewResponseSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2_000).nullable(),
  items: z
    .array(cardDeckAiDraftItemSchema)
    .min(1)
    .max(RECALL_AI_DECK_MAX_ITEMS),
});
export type CardDeckAiPreviewResponse = z.infer<
  typeof cardDeckAiPreviewResponseSchema
>;

export const createCardDeckWithItemsBodySchema = z.object({
  idempotencyKey: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2_000).nullish(),
  items: z
    .array(createCardDeckItemBodySchema)
    .min(1)
    .max(CARD_BULK_IMPORT_MAX_ITEMS),
});
export type CreateCardDeckWithItemsBody = z.infer<
  typeof createCardDeckWithItemsBodySchema
>;

export const createCardDeckWithItemsResponseSchema = z.object({
  deck: cardDeckDtoSchema,
  items: z.array(cardDeckItemDtoSchema).min(1),
});
export type CreateCardDeckWithItemsResponse = z.infer<
  typeof createCardDeckWithItemsResponseSchema
>;

export const RECALL_REVIEW_DIFFICULTY_BY_VERDICT = {
  [RECALL_GRADE_VERDICTS.pass]: CARD_REVIEW_DIFFICULTIES.good,
  [RECALL_GRADE_VERDICTS.fail]: CARD_REVIEW_DIFFICULTIES.hard,
} as const;
