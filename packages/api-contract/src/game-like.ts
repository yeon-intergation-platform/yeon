import { z } from "zod";

// 게임 좋아요 계약. count는 누구나 조회, liked는 현재 로그인 사용자 기준(비로그인=false).
export const gameLikeStatusSchema = z.object({
  count: z.number().int(),
  liked: z.boolean(),
});
export type GameLikeStatus = z.infer<typeof gameLikeStatusSchema>;

export const gameLikeRankingItemSchema = z.object({
  gameSlug: z.string(),
  count: z.number().int(),
});
export type GameLikeRankingItem = z.infer<typeof gameLikeRankingItemSchema>;

export const gameLikeRankingResponseSchema = z.object({
  items: z.array(gameLikeRankingItemSchema),
});
export type GameLikeRankingResponse = z.infer<
  typeof gameLikeRankingResponseSchema
>;

export const toggleGameLikeRequestSchema = z.object({
  gameSlug: z.string().regex(/^[a-z0-9-]{1,80}$/),
});
export type ToggleGameLikeRequest = z.infer<typeof toggleGameLikeRequestSchema>;
