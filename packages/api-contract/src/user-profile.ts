import { z } from "zod";

// 사용자 프로필(닉네임·아바타) 갱신 계약. root 계정(public.users) display_name/avatar_url을 갱신한다.
// avatarUrl은 절대 URL만 허용한다(세션 authUserDto avatarUrl이 .url()이므로 정합 유지).

export const userProfileResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;

export const updateUserProfileRequestSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  // 빈 문자열/누락은 "아바타 없음"(null)로 정규화한다.
  avatarUrl: z.string().max(2048).nullable().optional(),
});
export type UpdateUserProfileRequest = z.infer<
  typeof updateUserProfileRequestSchema
>;
