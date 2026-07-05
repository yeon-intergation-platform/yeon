import { z } from "zod";

export const userRoleBodySchema = z.enum(["admin", "user"]);

export const userDtoSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1).max(80).nullable(),
  role: z.string().trim().min(1).max(32),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  emailVerifiedAt: z.string().datetime().nullable().default(null),
  sessionCount: z.number().int().nonnegative().default(0),
  identityProviders: z.array(z.string().trim().min(1)).default([]),
  cardDeckCount: z.number().int().nonnegative().default(0),
  typingDeckCount: z.number().int().nonnegative().default(0),
});

export const listUsersResponseSchema = z.object({
  users: z.array(userDtoSchema),
});

export const createUserBodySchema = z.object({
  email: z.string().trim().email(),
  displayName: z.string().trim().min(1).max(80).optional(),
});

export const createUserResponseSchema = z.object({
  user: userDtoSchema,
});

export const updateUserBodySchema = z.object({
  displayName: z.string().trim().max(80).nullable().optional(),
});

export const updateUserRoleBodySchema = z.object({
  role: userRoleBodySchema,
});

export const updateUserResponseSchema = z.object({
  user: userDtoSchema,
});

export const invalidateUserSessionsResponseSchema = z.object({
  userId: z.string().uuid(),
  invalidatedSessions: z.number().int().nonnegative(),
});

export const deleteUserResponseSchema = z.object({
  userId: z.string().uuid(),
  deleted: z.boolean(),
  invalidatedSessions: z.number().int().nonnegative(),
});

export const withdrawUserBodySchema = z.object({
  confirmation: z.string().trim().min(1),
});

export type UserDto = z.infer<typeof userDtoSchema>;
export type ListUsersResponse = z.infer<typeof listUsersResponseSchema>;
export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
export type UpdateUserRoleBody = z.infer<typeof updateUserRoleBodySchema>;
export type UpdateUserResponse = z.infer<typeof updateUserResponseSchema>;
export type InvalidateUserSessionsResponse = z.infer<
  typeof invalidateUserSessionsResponseSchema
>;
export type DeleteUserResponse = z.infer<typeof deleteUserResponseSchema>;
export type WithdrawUserBody = z.infer<typeof withdrawUserBodySchema>;
