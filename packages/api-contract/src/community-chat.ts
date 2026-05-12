import { z } from "zod";

export const communityChatGuestSessionIdSchema = z
  .string()
  .trim()
  .min(8)
  .max(128);

export const communityChatGuestNicknameSchema = z
  .string()
  .trim()
  .min(1)
  .max(40);

export const communityChatMessageDtoSchema = z.object({
  id: z.string().uuid(),
  senderId: z.string().min(1).max(160),
  senderNickname: z.string().min(1).max(40),
  body: z.string().min(1).max(1000),
  createdAt: z.string().datetime(),
});

export const communityChatListMessagesResponseSchema = z.object({
  messages: z.array(communityChatMessageDtoSchema),
});

export const communityChatSendMessageBodySchema = z.object({
  body: z.string().trim().min(1).max(1000),
  guestSessionId: communityChatGuestSessionIdSchema.optional(),
  guestNickname: communityChatGuestNicknameSchema.optional(),
  senderNickname: communityChatGuestNicknameSchema.optional(),
});

export const communityChatSendMessageResponseSchema = z.object({
  message: communityChatMessageDtoSchema,
});

export type CommunityChatMessageDto = z.infer<
  typeof communityChatMessageDtoSchema
>;
export type CommunityChatListMessagesResponse = z.infer<
  typeof communityChatListMessagesResponseSchema
>;
export type CommunityChatSendMessageBody = z.infer<
  typeof communityChatSendMessageBodySchema
>;
export type CommunityChatSendMessageResponse = z.infer<
  typeof communityChatSendMessageResponseSchema
>;
