export const communityQueryKeys = {
  all: ["community"] as const,
  chat: () => [...communityQueryKeys.all, "chat"] as const,
  chatMessages: () => [...communityQueryKeys.chat(), "messages"] as const,
  feed: () => [...communityQueryKeys.all, "feed"] as const,
  feedPosts: () => [...communityQueryKeys.feed(), "posts"] as const,
  feedReplies: (postId: string) =>
    [...communityQueryKeys.feed(), "replies", postId] as const,
  presence: () => [...communityQueryKeys.all, "presence"] as const,
  presenceHeartbeat: (sessionId: string) =>
    [...communityQueryKeys.presence(), "heartbeat", sessionId] as const,
};
