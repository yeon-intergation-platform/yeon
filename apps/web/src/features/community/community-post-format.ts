import { type ChatServiceFeedPost } from "./chat-service-api";

export const COMMUNITY_CATEGORIES = [
  "전체",
  "잡담",
  "타자친구 모집",
  "카드친구 모집",
  "관리자에게 아무말/조언",
] as const;

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];
export type WritableCommunityCategory = Exclude<CommunityCategory, "전체">;
export type CommunityPostDraft = {
  category: WritableCommunityCategory;
  title: string;
  content: string;
};

export const COMMUNITY_POST_TITLE_MAX_LENGTH = 80;
export const COMMUNITY_POST_CONTENT_MAX_LENGTH = 280;
export const COMMUNITY_POST_DRAFT_MAX_LENGTH =
  COMMUNITY_POST_TITLE_MAX_LENGTH + COMMUNITY_POST_CONTENT_MAX_LENGTH;
export const COMMUNITY_REPLY_CONTENT_MAX_LENGTH = 400;
export const COMMUNITY_CHAT_MESSAGE_MAX_LENGTH = 1000;

export const WRITABLE_CATEGORIES = COMMUNITY_CATEGORIES.filter(
  (category): category is WritableCommunityCategory => category !== "전체"
);

export function serializeCommunityPost(input: CommunityPostDraft) {
  return `[${input.category}] ${input.title.trim()}\n${input.content.trim()}`;
}

export function canSubmitCommunityPostDraft(input: {
  title: string;
  content: string;
  isSubmitting: boolean;
}) {
  return (
    !input.isSubmitting &&
    Boolean(input.title.trim()) &&
    Boolean(input.content.trim()) &&
    input.title.length <= COMMUNITY_POST_TITLE_MAX_LENGTH &&
    input.content.length <= COMMUNITY_POST_CONTENT_MAX_LENGTH &&
    input.title.length + input.content.length <= COMMUNITY_POST_DRAFT_MAX_LENGTH
  );
}

export function canSubmitCommunityReplyDraft(input: {
  replyDraft: string;
  isSubmitting: boolean;
}) {
  return (
    !input.isSubmitting &&
    Boolean(input.replyDraft.trim()) &&
    input.replyDraft.length <= COMMUNITY_REPLY_CONTENT_MAX_LENGTH
  );
}

export function canSendCommunityChatMessage(input: {
  messageBody: string;
  isSendingMessage: boolean;
}) {
  return (
    !input.isSendingMessage &&
    Boolean(input.messageBody.trim()) &&
    input.messageBody.length <= COMMUNITY_CHAT_MESSAGE_MAX_LENGTH
  );
}

export function parseCommunityPost(post: Pick<ChatServiceFeedPost, "body">) {
  const normalizedBody = post.body.trim();
  const match = normalizedBody.match(/^\[(.+?)\]\s*(.+?)(?:\n([\s\S]*))?$/);
  const matchedCategory = match?.[1];
  const category = WRITABLE_CATEGORIES.includes(
    matchedCategory as WritableCommunityCategory
  )
    ? (matchedCategory as WritableCommunityCategory)
    : "잡담";
  const title = match?.[2]?.trim() || normalizedBody.split("\n")[0] || "글";
  const content =
    match?.[3]?.trim() ||
    normalizedBody.split("\n").slice(1).join("\n").trim() ||
    normalizedBody;

  return { category, title, content };
}
