import { z } from "zod";

// 게임 허브 댓글 도메인 계약. 백엔드(Java record + Jackson) 직렬화와 필드명·타입을 맞춘다.
// 비밀댓글 마스킹 시 content 는 null, canRevealWithPassword 로 게스트 비번 확인 가능 여부를 표시.

export const gameCommentSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  // 아바타는 외부/내부 URL 모두 가능하고 게스트는 null. .url() 대신 nullable string로 둔다.
  avatarUrl: z.string().nullable(),
  // 마스킹된 비밀댓글은 content=null.
  content: z.string().nullable(),
  isSecret: z.boolean(),
  isMine: z.boolean(),
  isGuest: z.boolean(),
  canRevealWithPassword: z.boolean(),
  canDelete: z.boolean(),
  likeCount: z.number().int(),
  likedByMe: z.boolean(),
  createdAt: z.string(),
});
export type GameComment = z.infer<typeof gameCommentSchema>;

export const commentLikeResponseSchema = z.object({
  likeCount: z.number().int(),
  likedByMe: z.boolean(),
});
export type CommentLikeResponse = z.infer<typeof commentLikeResponseSchema>;

// 댓글 정렬: 최신순 / 인기순(좋아요).
export const COMMENT_SORTS = { latest: "latest", popular: "popular" } as const;
export type CommentSort = (typeof COMMENT_SORTS)[keyof typeof COMMENT_SORTS];

export const gameCommentListResponseSchema = z.object({
  items: z.array(gameCommentSchema),
});
export type GameCommentListResponse = z.infer<
  typeof gameCommentListResponseSchema
>;

// 작성 요청. 로그인 사용자는 guestNickname/guestPassword 없이, 게스트는 둘 다 필수(백엔드 검증).
export const createGameCommentRequestSchema = z.object({
  gameSlug: z.string().regex(/^[a-z0-9-]{1,80}$/),
  content: z.string().min(1).max(1000),
  isSecret: z.boolean().default(false),
  guestNickname: z.string().max(40).optional(),
  guestPassword: z.string().max(72).optional(),
});
export type CreateGameCommentRequest = z.infer<
  typeof createGameCommentRequestSchema
>;

export const revealGameCommentResponseSchema = z.object({
  content: z.string(),
});
export type RevealGameCommentResponse = z.infer<
  typeof revealGameCommentResponseSchema
>;
