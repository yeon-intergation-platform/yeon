import { z } from "zod";

// 내 게임(찜·최근 플레이) 계약. 목록은 slug 배열로 내려오고, 웹이 카탈로그/피드로 GameEntry를 해석한다.
export const gameSlugListResponseSchema = z.object({
  slugs: z.array(z.string()),
});
export type GameSlugListResponse = z.infer<typeof gameSlugListResponseSchema>;

export const favoriteToggleResponseSchema = z.object({
  favorited: z.boolean(),
});
export type FavoriteToggleResponse = z.infer<
  typeof favoriteToggleResponseSchema
>;

export const gameSlugRequestSchema = z.object({
  gameSlug: z.string().regex(/^[a-z0-9-]{1,80}$/),
});
export type GameSlugRequest = z.infer<typeof gameSlugRequestSchema>;
