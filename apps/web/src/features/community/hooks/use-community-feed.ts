"use client";

import { useCallback, useMemo, useState } from "react";

import { chatServiceApi, type ChatServiceFeedPost } from "../chat-service-api";

type ErrorState = string | null;

type ReplyDrafts = Record<string, string>;
type RepliesByPost = Record<string, ChatServiceFeedPost[]>;

type LoadingByPost = Record<string, boolean>;
type ErrorByPost = Record<string, ErrorState>;

type ExpandedByPost = Record<string, boolean>;
type SubmittingByPost = Record<string, boolean>;

type FeedActor = {
  guestNickname: string;
  guestPassword: string;
};

type FeedActorInput = Partial<FeedActor>;

function toFeedActorPayload(input: FeedActorInput) {
  return {
    guestNickname: input.guestNickname?.trim() ?? "",
    guestPassword: input.guestPassword?.trim() ?? "",
  };
}

export function useCommunityFeed() {
  const [posts, setPosts] = useState<ChatServiceFeedPost[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<ErrorState>(null);
  const [replyDrafts, setReplyDrafts] = useState<ReplyDrafts>({});
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState<SubmittingByPost>(
    {}
  );
  const [isUpdatingPost, setIsUpdatingPost] = useState<LoadingByPost>({});
  const [isDeletingPost, setIsDeletingPost] = useState<LoadingByPost>({});
  const [isDeletingReply, setIsDeletingReply] = useState<LoadingByPost>({});
  const [postErrors, setPostErrors] = useState<ErrorByPost>({});
  const [expandedReplies, setExpandedReplies] = useState<ExpandedByPost>({});
  const [repliesByPost, setRepliesByPost] = useState<RepliesByPost>({});
  const [isRepliesLoading, setIsRepliesLoading] = useState<LoadingByPost>({});
  const [replyErrors, setReplyErrors] = useState<ErrorByPost>({});
  const [replyDeleteErrors, setReplyDeleteErrors] = useState<ErrorByPost>({});
  const [guestNickname, setGuestNickname] = useState("");
  const [guestPassword, setGuestPassword] = useState("");

  const actorPayload = useMemo(() => {
    const currentActor = toFeedActorPayload({ guestNickname, guestPassword });

    return currentActor.guestNickname && currentActor.guestPassword
      ? currentActor
      : {};
  }, [guestNickname, guestPassword]);

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

  const createPost = useCallback(
    async (body: string) => {
      const trimmedBody = body.trim();
      if (!trimmedBody) {
        setPostsError("글 내용을 입력해주세요.");
        return;
      }

      setIsCreatingPost(true);
      setPostsError(null);

      try {
        await chatServiceApi.createFeedPost(trimmedBody, actorPayload);
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
    },
    [actorPayload, loadPosts]
  );

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
          error instanceof Error
            ? error.message
            : "댓글 목록을 불러오지 못했습니다.",
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
    [loadReplies]
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
        await chatServiceApi.createFeedReply(postId, draft, actorPayload);
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
    [actorPayload, loadPosts, loadReplies, replyDrafts]
  );

  const updatePost = useCallback(
    async (postId: string, body: string) => {
      const trimmedBody = body.trim();
      if (!trimmedBody) {
        setPostErrors((previous) => ({
          ...previous,
          [postId]: "수정할 내용을 입력해주세요.",
        }));
        return;
      }

      setIsUpdatingPost((previous) => ({
        ...previous,
        [postId]: true,
      }));
      setPostErrors((previous) => ({
        ...previous,
        [postId]: null,
      }));

      try {
        await chatServiceApi.updateFeedPost(postId, trimmedBody, actorPayload);
        await loadPosts();
      } catch (error) {
        setPostErrors((previous) => ({
          ...previous,
          [postId]:
            error instanceof Error ? error.message : "글 수정에 실패했습니다.",
        }));
        throw error;
      } finally {
        setIsUpdatingPost((previous) => ({
          ...previous,
          [postId]: false,
        }));
      }
    },
    [actorPayload, loadPosts]
  );

  const deletePost = useCallback(
    async (postId: string) => {
      setIsDeletingPost((previous) => ({
        ...previous,
        [postId]: true,
      }));
      setPostErrors((previous) => ({
        ...previous,
        [postId]: null,
      }));

      try {
        await chatServiceApi.deleteFeedPost(postId, actorPayload);
        await loadPosts();
      } catch (error) {
        setPostErrors((previous) => ({
          ...previous,
          [postId]:
            error instanceof Error ? error.message : "글 삭제에 실패했습니다.",
        }));
        throw error;
      } finally {
        setIsDeletingPost((previous) => ({
          ...previous,
          [postId]: false,
        }));
      }
    },
    [actorPayload, loadPosts]
  );

  const deleteReply = useCallback(
    async (postId: string, replyId: string) => {
      setIsDeletingReply((previous) => ({
        ...previous,
        [replyId]: true,
      }));
      setReplyDeleteErrors((previous) => ({
        ...previous,
        [replyId]: null,
      }));

      try {
        await chatServiceApi.deleteFeedReply(postId, replyId, actorPayload);
        await Promise.all([loadReplies(postId), loadPosts()]);
      } catch (error) {
        setReplyDeleteErrors((previous) => ({
          ...previous,
          [replyId]:
            error instanceof Error
              ? error.message
              : "답글 삭제에 실패했습니다.",
        }));
        throw error;
      } finally {
        setIsDeletingReply((previous) => ({
          ...previous,
          [replyId]: false,
        }));
      }
    },
    [actorPayload, loadPosts, loadReplies]
  );

  const clear = useCallback(() => {
    setPosts([]);
    setPostsError(null);
    setReplyDrafts({});
    setRepliesByPost({});
    setExpandedReplies({});
    setReplyErrors({});
    setReplyDeleteErrors({});
    setPostErrors({});
    setIsRepliesLoading({});
    setIsSubmittingReply({});
    setIsUpdatingPost({});
    setIsDeletingPost({});
    setIsDeletingReply({});
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
    postErrors,
    isUpdatingPost,
    isDeletingPost,
    isDeletingReply,
    replyDeleteErrors,
    guestNickname,
    guestPassword,
    setGuestNickname,
    setGuestPassword,
    loadPosts,
    createPost,
    toggleReplies,
    loadReplies,
    setReplyDraft,
    submitReply,
    updatePost,
    deletePost,
    deleteReply,
    clear,
  };
}

export type UseCommunityFeedReturn = ReturnType<typeof useCommunityFeed>;
