"use client";

import { useCallback, useState } from "react";

import { chatServiceApi, type ChatServiceFeedPost } from "../chat-service-api";

type ErrorState = string | null;

type ReplyDrafts = Record<string, string>;
type RepliesByPost = Record<string, ChatServiceFeedPost[]>;

type LoadingByPost = Record<string, boolean>;
type ErrorByPost = Record<string, ErrorState>;

type ExpandedByPost = Record<string, boolean>;

type SubmittingByPost = Record<string, boolean>;

export function useCommunityFeed() {
  const [posts, setPosts] = useState<ChatServiceFeedPost[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<ErrorState>(null);
  const [replyDrafts, setReplyDrafts] = useState<ReplyDrafts>({});
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] =
    useState<SubmittingByPost>({});
  const [expandedReplies, setExpandedReplies] = useState<ExpandedByPost>({});
  const [repliesByPost, setRepliesByPost] = useState<RepliesByPost>({});
  const [isRepliesLoading, setIsRepliesLoading] = useState<LoadingByPost>({});
  const [replyErrors, setReplyErrors] = useState<ErrorByPost>({});

  const loadPosts = useCallback(async () => {
    setIsPostsLoading(true);
    setPostsError(null);

    try {
      const response = await chatServiceApi.listFeedPosts();
      setPosts(response.posts);
    } catch (error) {
      if (error instanceof Error) {
        setPostsError(error.message);
      } else {
        setPostsError("커뮤니티 글을 불러오지 못했습니다.");
      }
      setPosts([]);
    } finally {
      setIsPostsLoading(false);
    }
  }, []);

  const createPost = useCallback(async (body: string) => {
    const trimmedBody = body.trim();
    if (!trimmedBody) {
      setPostsError("글 내용을 입력해주세요.");
      return;
    }

    setIsCreatingPost(true);
    setPostsError(null);

    try {
      await chatServiceApi.createFeedPost(trimmedBody);
      await loadPosts();
    } catch (error) {
      if (error instanceof Error) {
        setPostsError(error.message);
      } else {
        setPostsError("글 작성에 실패했습니다.");
      }
      throw error;
    } finally {
      setIsCreatingPost(false);
    }
  }, [loadPosts]);

  const loadReplies = useCallback(async (postId: string) => {
    setIsRepliesLoading((previous) => ({
      ...previous,
      [postId]: true,
    }));
    setReplyErrors((previous) => ({
      ...previous,
      [postId]: null,
    }));

    try {
      const response = await chatServiceApi.listFeedReplies(postId);
      setRepliesByPost((previous) => ({
        ...previous,
        [postId]: response.replies,
      }));
    } catch (error) {
      setReplyErrors((previous) => ({
        ...previous,
        [postId]:
          error instanceof Error ? error.message : "댓글 목록을 불러오지 못했습니다.",
      }));
    } finally {
      setIsRepliesLoading((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  }, []);

  const setReplyDraft = useCallback((postId: string, value: string) => {
    setReplyDrafts((previous) => ({
      ...previous,
      [postId]: value,
    }));
  }, []);

  const toggleReplies = useCallback(
    (postId: string) => {
      setExpandedReplies((previous) => {
        const next = { ...previous, [postId]: !previous[postId] };

        if (next[postId]) {
          loadReplies(postId);
        }

        return next;
      });
    },
    [loadReplies],
  );

  const submitReply = useCallback(
    async (postId: string) => {
      const draft = (replyDrafts[postId] ?? "").trim();
      if (!draft) {
        setReplyErrors((previous) => ({
          ...previous,
          [postId]: "답글 내용을 입력해주세요.",
        }));
        return;
      }

      setIsSubmittingReply((previous) => ({
        ...previous,
        [postId]: true,
      }));
      setReplyErrors((previous) => ({
        ...previous,
        [postId]: null,
      }));

      try {
        await chatServiceApi.createFeedReply(postId, draft);
        setReplyDrafts((previous) => ({
          ...previous,
          [postId]: "",
        }));
        await Promise.all([loadReplies(postId), loadPosts()]);
      } catch (error) {
        setReplyErrors((previous) => ({
          ...previous,
          [postId]:
            error instanceof Error
              ? error.message
              : "답글 작성에 실패했습니다.",
        }));
        throw error;
      } finally {
        setIsSubmittingReply((previous) => ({
          ...previous,
          [postId]: false,
        }));
      }
    },
    [loadPosts, loadReplies, replyDrafts],
  );

  const clear = useCallback(() => {
    setPosts([]);
    setPostsError(null);
    setReplyDrafts({});
    setRepliesByPost({});
    setExpandedReplies({});
    setReplyErrors({});
    setIsRepliesLoading({});
    setIsSubmittingReply({});
  }, []);

  return {
    posts,
    isPostsLoading,
    postsError,
    isCreatingPost,
    expandedReplies,
    repliesByPost,
    isRepliesLoading,
    replyErrors,
    isSubmittingReply,
    replyDrafts,
    loadPosts,
    createPost,
    toggleReplies,
    loadReplies,
    setReplyDraft,
    submitReply,
    clear,
  };
}

export type UseCommunityFeedReturn = ReturnType<typeof useCommunityFeed>;
