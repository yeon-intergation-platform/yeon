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

export const WRITABLE_CATEGORIES = COMMUNITY_CATEGORIES.filter(
  (category): category is WritableCommunityCategory => category !== "전체"
);

export function serializeCommunityPost(input: CommunityPostDraft) {
  return `[${input.category}] ${input.title.trim()}\n${input.content.trim()}`;
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
