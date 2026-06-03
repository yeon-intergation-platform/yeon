import { z } from "zod";

export const TYPING_DECK_TITLE_MAX_LENGTH = 120;
export const TYPING_DECK_DESCRIPTION_MAX_LENGTH = 2000;
export const TYPING_PASSAGE_TEXT_MAX_LENGTH = 4000;
export const TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS = 100;

export const TYPING_DECK_LANGUAGE_TAGS = {
  ko: "ko",
  en: "en",
  mixed: "mixed",
  code: "code",
} as const;

export const TYPING_DECK_VISIBILITY = {
  private: "private",
  public: "public",
} as const;

export const TYPING_DECK_SOURCE = {
  default: "default",
  user: "user",
} as const;

export const TYPING_PASSAGE_TEXT_TYPES = {
  short: "short",
  long: "long",
  code: "code",
} as const;

export const TYPING_PASSAGE_DIFFICULTIES = {
  easy: "easy",
  normal: "normal",
  hard: "hard",
} as const;

export const TYPING_DECK_LIST_SCOPES = {
  default: "default",
  mine: "mine",
  public: "public",
  all: "all",
} as const;

export const typingDeckLanguageTagSchema = z.enum([
  TYPING_DECK_LANGUAGE_TAGS.ko,
  TYPING_DECK_LANGUAGE_TAGS.en,
  TYPING_DECK_LANGUAGE_TAGS.mixed,
  TYPING_DECK_LANGUAGE_TAGS.code,
]);
export type TypingDeckLanguageTag = z.infer<typeof typingDeckLanguageTagSchema>;

export const typingDeckVisibilitySchema = z.enum([
  TYPING_DECK_VISIBILITY.private,
  TYPING_DECK_VISIBILITY.public,
]);
export type TypingDeckVisibility = z.infer<typeof typingDeckVisibilitySchema>;

export const typingDeckSourceSchema = z.enum([
  TYPING_DECK_SOURCE.default,
  TYPING_DECK_SOURCE.user,
]);
export type TypingDeckSource = z.infer<typeof typingDeckSourceSchema>;

export const typingPassageTextTypeSchema = z.enum([
  TYPING_PASSAGE_TEXT_TYPES.short,
  TYPING_PASSAGE_TEXT_TYPES.long,
  TYPING_PASSAGE_TEXT_TYPES.code,
]);
export type TypingPassageTextType = z.infer<typeof typingPassageTextTypeSchema>;

export const typingPassageDifficultySchema = z.enum([
  TYPING_PASSAGE_DIFFICULTIES.easy,
  TYPING_PASSAGE_DIFFICULTIES.normal,
  TYPING_PASSAGE_DIFFICULTIES.hard,
]);
export type TypingPassageDifficulty = z.infer<
  typeof typingPassageDifficultySchema
>;

export const typingDeckListScopeSchema = z.enum([
  TYPING_DECK_LIST_SCOPES.default,
  TYPING_DECK_LIST_SCOPES.mine,
  TYPING_DECK_LIST_SCOPES.public,
  TYPING_DECK_LIST_SCOPES.all,
]);
export type TypingDeckListScope = z.infer<typeof typingDeckListScopeSchema>;

const booleanQuerySchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }
  if (value === "true" || value === "1") {
    return true;
  }
  if (value === "false" || value === "0") {
    return false;
  }
  return value;
}, z.boolean());

export const typingDeckListQuerySchema = z.object({
  scope: typingDeckListScopeSchema.default(TYPING_DECK_LIST_SCOPES.all),
  languageTag: typingDeckLanguageTagSchema.optional(),
  includeDefaults: booleanQuerySchema.optional().default(false),
});
export type TypingDeckListQuery = z.infer<typeof typingDeckListQuerySchema>;

export const createTypingDeckBodySchema = z.object({
  title: z.string().min(1).max(TYPING_DECK_TITLE_MAX_LENGTH),
  description: z.string().max(TYPING_DECK_DESCRIPTION_MAX_LENGTH).nullish(),
  languageTag: typingDeckLanguageTagSchema,
  visibility: typingDeckVisibilitySchema.default(
    TYPING_DECK_VISIBILITY.private
  ),
});
export type CreateTypingDeckBody = z.infer<typeof createTypingDeckBodySchema>;

export const updateTypingDeckBodySchema = z.object({
  title: z.string().min(1).max(TYPING_DECK_TITLE_MAX_LENGTH).optional(),
  description: z.string().max(TYPING_DECK_DESCRIPTION_MAX_LENGTH).nullish(),
  languageTag: typingDeckLanguageTagSchema.optional(),
  visibility: typingDeckVisibilitySchema.optional(),
});
export type UpdateTypingDeckBody = z.infer<typeof updateTypingDeckBodySchema>;

export const createTypingDeckPassageBodySchema = z.object({
  title: z.string().min(1).max(TYPING_DECK_TITLE_MAX_LENGTH).nullish(),
  prompt: z.string().min(1).max(TYPING_PASSAGE_TEXT_MAX_LENGTH),
  textType: typingPassageTextTypeSchema.default(
    TYPING_PASSAGE_TEXT_TYPES.short
  ),
  difficulty: typingPassageDifficultySchema.default(
    TYPING_PASSAGE_DIFFICULTIES.normal
  ),
  sortOrder: z.number().int().optional(),
});
export type CreateTypingDeckPassageBody = z.infer<
  typeof createTypingDeckPassageBodySchema
>;

export const createTypingDeckPassagesBodySchema = z.object({
  passages: z
    .array(createTypingDeckPassageBodySchema)
    .min(1)
    .max(TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS),
});
export type CreateTypingDeckPassagesBody = z.infer<
  typeof createTypingDeckPassagesBodySchema
>;

export const updateTypingDeckPassageBodySchema = z.object({
  title: z.string().min(1).max(TYPING_DECK_TITLE_MAX_LENGTH).nullish(),
  prompt: z.string().min(1).max(TYPING_PASSAGE_TEXT_MAX_LENGTH).optional(),
  textType: typingPassageTextTypeSchema.optional(),
  difficulty: typingPassageDifficultySchema.optional(),
  sortOrder: z.number().int().optional(),
});
export type UpdateTypingDeckPassageBody = z.infer<
  typeof updateTypingDeckPassageBodySchema
>;

export const createTypingRaceSeedBodySchema = z.object({
  passageId: z.string().min(1).optional(),
});
export type CreateTypingRaceSeedBody = z.infer<
  typeof createTypingRaceSeedBodySchema
>;

export const typingDeckDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  languageTag: typingDeckLanguageTagSchema,
  visibility: typingDeckVisibilitySchema,
  source: typingDeckSourceSchema,
  passageCount: z.number().int().nonnegative(),
  isOwner: z.boolean(),
  canEdit: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type TypingDeckDto = z.infer<typeof typingDeckDtoSchema>;

export const typingDeckPassageDtoSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  prompt: z.string(),
  textType: typingPassageTextTypeSchema,
  difficulty: typingPassageDifficultySchema,
  sortOrder: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type TypingDeckPassageDto = z.infer<typeof typingDeckPassageDtoSchema>;

export const typingRaceSeedVisibilitySchema = z.enum([
  TYPING_DECK_SOURCE.default,
  TYPING_DECK_VISIBILITY.public,
  TYPING_DECK_VISIBILITY.private,
]);
export type TypingRaceSeedVisibility = z.infer<
  typeof typingRaceSeedVisibilitySchema
>;

export const typingRaceSeedDtoSchema = z.object({
  passageId: z.string(),
  prompt: z.string(),
  roundLabel: z.string(),
  seedToken: z.string().min(1).optional(),
  deckId: z.string(),
  deckVisibility: typingRaceSeedVisibilitySchema,
  lobbyDeckTitle: z.string(),
  participantDeckTitle: z.string(),
  languageTag: typingDeckLanguageTagSchema,
  // 인증된 시드 발급 시에만 BFF 가 내려주는 로그인 사용자 식별자/검증 토큰.
  // race-server 가 userToken 을 검증해 통과할 때만 userId 를 신뢰(경험치 적립). 비로그인은 둘 다 생략.
  userId: z.string().min(1).optional(),
  userToken: z.string().min(1).optional(),
});
export type TypingRaceSeedDto = z.infer<typeof typingRaceSeedDtoSchema>;

export const typingDeckListResponseSchema = z.object({
  decks: z.array(typingDeckDtoSchema),
});
export type TypingDeckListResponse = z.infer<
  typeof typingDeckListResponseSchema
>;

export const typingDeckResponseSchema = z.object({
  deck: typingDeckDtoSchema,
});
export type TypingDeckResponse = z.infer<typeof typingDeckResponseSchema>;

export const typingDeckDetailResponseSchema = z.object({
  deck: typingDeckDtoSchema,
  passages: z.array(typingDeckPassageDtoSchema),
});
export type TypingDeckDetailResponse = z.infer<
  typeof typingDeckDetailResponseSchema
>;

export const typingDeckPassageResponseSchema = z.object({
  passage: typingDeckPassageDtoSchema,
});
export type TypingDeckPassageResponse = z.infer<
  typeof typingDeckPassageResponseSchema
>;

export const createTypingDeckPassagesResponseSchema = z.object({
  passages: z.array(typingDeckPassageDtoSchema),
});
export type CreateTypingDeckPassagesResponse = z.infer<
  typeof createTypingDeckPassagesResponseSchema
>;

export const typingRaceSeedResponseSchema = z.object({
  raceSeed: typingRaceSeedDtoSchema,
});
export type TypingRaceSeedResponse = z.infer<
  typeof typingRaceSeedResponseSchema
>;
