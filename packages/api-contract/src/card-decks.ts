import { z } from "zod";

export const CARD_TEXT_MAX_LENGTH = 2000;
export const CARD_BULK_IMPORT_MAX_ITEMS = 100;
export const CARD_IMAGE_STORAGE_KEY_MAX_LENGTH = 512;

export const CARD_STUDY_MODES = {
  flashcard: "flashcard",
  review: "review",
} as const;
export const CARD_REVIEW_DIFFICULTIES = {
  hard: "hard",
  good: "good",
  easy: "easy",
} as const;

export const cardStudyModeSchema = z.enum([
  CARD_STUDY_MODES.flashcard,
  CARD_STUDY_MODES.review,
]);
export type CardStudyMode = z.infer<typeof cardStudyModeSchema>;

export const cardReviewDifficultySchema = z.enum([
  CARD_REVIEW_DIFFICULTIES.hard,
  CARD_REVIEW_DIFFICULTIES.good,
  CARD_REVIEW_DIFFICULTIES.easy,
]);
export type CardReviewDifficulty = z.infer<typeof cardReviewDifficultySchema>;

export const createCardDeckBodySchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).nullish(),
});
export type CreateCardDeckBody = z.infer<typeof createCardDeckBodySchema>;

export const updateCardDeckBodySchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).nullish(),
});
export type UpdateCardDeckBody = z.infer<typeof updateCardDeckBodySchema>;

export const createCardDeckItemBodySchema = z.object({
  frontText: z.string().min(1).max(CARD_TEXT_MAX_LENGTH),
  backText: z.string().min(1).max(CARD_TEXT_MAX_LENGTH),
  imageStorageKey: z
    .string()
    .min(1)
    .max(CARD_IMAGE_STORAGE_KEY_MAX_LENGTH)
    .nullish(),
});
export type CreateCardDeckItemBody = z.infer<
  typeof createCardDeckItemBodySchema
>;

export const createCardDeckItemsBodySchema = z.object({
  items: z
    .array(createCardDeckItemBodySchema)
    .min(1)
    .max(CARD_BULK_IMPORT_MAX_ITEMS),
});
export type CreateCardDeckItemsBody = z.infer<
  typeof createCardDeckItemsBodySchema
>;

export const updateCardDeckItemBodySchema = z.object({
  frontText: z.string().min(1).max(CARD_TEXT_MAX_LENGTH).optional(),
  backText: z.string().min(1).max(CARD_TEXT_MAX_LENGTH).optional(),
  imageStorageKey: z
    .string()
    .min(1)
    .max(CARD_IMAGE_STORAGE_KEY_MAX_LENGTH)
    .nullable()
    .optional(),
});
export type UpdateCardDeckItemBody = z.infer<
  typeof updateCardDeckItemBodySchema
>;

export const updateCardStudyPreferenceBodySchema = z.object({
  studyMode: cardStudyModeSchema,
});
export type UpdateCardStudyPreferenceBody = z.infer<
  typeof updateCardStudyPreferenceBodySchema
>;

export const reviewCardDeckItemBodySchema = z.object({
  difficulty: cardReviewDifficultySchema,
});
export type ReviewCardDeckItemBody = z.infer<
  typeof reviewCardDeckItemBodySchema
>;

export const cardDeckDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  itemCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CardDeckDto = z.infer<typeof cardDeckDtoSchema>;

export const cardDeckItemDtoSchema = z.object({
  id: z.string(),
  frontText: z.string(),
  backText: z.string(),
  imageStorageKey: z.string().nullable(),
  imageUrl: z.string().nullable(),
  reviewDifficulty: cardReviewDifficultySchema.nullable(),
  lastReviewedAt: z.string().datetime().nullable(),
  nextReviewAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CardDeckItemDto = z.infer<typeof cardDeckItemDtoSchema>;

export const cardDeckListResponseSchema = z.object({
  decks: z.array(cardDeckDtoSchema),
});
export type CardDeckListResponse = z.infer<typeof cardDeckListResponseSchema>;

export const cardDeckResponseSchema = z.object({
  deck: cardDeckDtoSchema,
});
export type CardDeckResponse = z.infer<typeof cardDeckResponseSchema>;

export const cardDeckItemResponseSchema = z.object({
  item: cardDeckItemDtoSchema,
});
export type CardDeckItemResponse = z.infer<typeof cardDeckItemResponseSchema>;

export const cardStudyPreferenceResponseSchema = z.object({
  studyMode: cardStudyModeSchema,
});
export type CardStudyPreferenceResponse = z.infer<
  typeof cardStudyPreferenceResponseSchema
>;

export const cardDeckDetailResponseSchema = z.object({
  deck: cardDeckDtoSchema,
  items: z.array(cardDeckItemDtoSchema),
  studyMode: cardStudyModeSchema,
});
export type CardDeckDetailResponse = z.infer<
  typeof cardDeckDetailResponseSchema
>;

export const createCardDeckItemsResponseSchema = z.object({
  items: z.array(cardDeckItemDtoSchema),
});
export type CreateCardDeckItemsResponse = z.infer<
  typeof createCardDeckItemsResponseSchema
>;
