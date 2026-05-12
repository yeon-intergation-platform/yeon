"use client";

import { useCallback, useMemo, useState } from "react";
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { chatServiceApi, type ChatServiceFeedPost } from "../chat-service-api";
import {
  readCommunityGuestNickname,
  writeCommunityGuestNickname,
} from "../community-guest-identity";
import { communityQueryKeys } from "./community-query-keys";

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

export type FeedActorInput = Partial<FeedActor>;

function toFeedActorPayload(input: FeedActorInput) {
  return {
    guestNickname: input.guestNickname?.trim() ?? "",
    guestPassword: input.guestPassword?.trim() ?? "",
  };
}

type UseCommunityFeedOptions = {
  initialPosts?: ChatServiceFeedPost[];
};

type FeedPostsResponse = Awaited<
  ReturnType<typeof chatServiceApi.listFeedPosts>
>;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function updateFeedPostsCache(
  queryClient: QueryClient,
  update: (posts: ChatServiceFeedPost[]) => ChatServiceFeedPost[]
) {
  queryClient.setQueryData<FeedPostsResponse>(
    communityQueryKeys.feedPosts(),
    (current) => {
      if (!current) return current;

      return {
        ...current,
        posts: update(current.posts),
      };
    }
  );
}

export function useCommunityFeed(options: UseCommunityFeedOptions = {}) {
  const queryClient = useQueryClient();
  const initialFeedPosts = options.initialPosts
    ? { posts: options.initialPosts }
    : undefined;
  const {
    data: postsData,
    error: postsQueryError,
    isLoading: isPostsQueryLoading,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: communityQueryKeys.feedPosts(),
    queryFn: chatServiceApi.listFeedPosts,
    initialData: initialFeedPosts,
  });
  const posts = postsData ? postsData.posts : [];
  const [postsLocalError, setPostsLocalError] = useState<ErrorState>(null);
  const [replyDrafts, setReplyDrafts] = useState<ReplyDrafts>({});
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
  const [guestNickname, setGuestNicknameState] = useState(
    readCommunityGuestNickname
  );
  const [guestPassword, setGuestPassword] = useState("");

  const setGuestNickname = useCallback((nickname: string) => {
    setGuestNicknameState(nickname);
    writeCommunityGuestNickname(nickname);
  }, []);

  const actorPayload = useMemo(() => {
    const currentActor = toFeedActorPayload({ guestNickname, guestPassword });

    return currentActor.guestNickname && currentActor.guestPassword
      ? currentActor
      : {};
  }, [guestNickname, guestPassword]);

  const resolveActorPayload = useCallback(
    (actor?: FeedActorInput) => {
      if (!actor) return actorPayload;

      const currentActor = toFeedActorPayload(actor);
      return currentActor.guestNickname && currentActor.guestPassword
        ? currentActor
        : actorPayload;
    },
    [actorPayload]
  );

  const createPostMutation = useMutation({
    mutationFn: ({
      body,
      actor,
    }: {
      body: string;
      actor: ReturnType<typeof resolveActorPayload>;
    }) => chatServiceApi.createFeedPost(body, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: communityQueryKeys.feedPosts(),
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({
      postId,
      body,
      actor,
    }: {
      postId: string;
      body: string;
      actor: ReturnType<typeof resolveActorPayload>;
    }) => chatServiceApi.updateFeedPost(postId, body, actor),
    onSuccess: (response, variables) => {
      updateFeedPostsCache(queryClient, (currentPosts) =>
        currentPosts.map((post) =>
          post.id === variables.postId ? response.post : post
        )
      );
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: ({
      postId,
      actor,
    }: {
      postId: string;
      actor: ReturnType<typeof resolveActorPayload>;
    }) => chatServiceApi.deleteFeedPost(postId, actor),
    onSuccess: (_response, variables) => {
      updateFeedPostsCache(queryClient, (currentPosts) =>
        currentPosts.filter((post) => post.id !== variables.postId)
      );
    },
  });

  const loadPosts = useCallback(async () => {
    setPostsLocalError(null);
    await refetchPosts();
  }, [refetchPosts]);

  const createPost = useCallback(
    async (body: string, actor?: FeedActorInput) => {
      const trimmedBody = body.trim();
      if (!trimmedBody) {
        setPostsLocalError("글 내용을 입력해주세요.");
        return;
      }

      setPostsLocalError(null);

      try {
        await createPostMutation.mutateAsync({
          body: trimmedBody,
          actor: resolveActorPayload(actor),
        });
      } catch (error) {
        setPostsLocalError(getErrorMessage(error, "글 작성에 실패했습니다."));
        throw error;
      }
    },
    [createPostMutation, resolveActorPayload]
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
    async (postId: string, actor?: FeedActorInput) => {
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
        await chatServiceApi.createFeedReply(
          postId,
          draft,
          resolveActorPayload(actor)
        );
        setReplyDrafts((previous) => ({
          ...previous,
          [postId]: "",
        }));
        updateFeedPostsCache(queryClient, (currentPosts) =>
          currentPosts.map((post) =>
            post.id === postId
              ? { ...post, replyCount: post.replyCount + 1 }
              : post
          )
        );
        await loadReplies(postId);
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
    [loadReplies, queryClient, replyDrafts, resolveActorPayload]
  );

  const updatePost = useCallback(
    async (postId: string, body: string, actor?: FeedActorInput) => {
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
        await updatePostMutation.mutateAsync({
          postId,
          body: trimmedBody,
          actor: resolveActorPayload(actor),
        });
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
    [resolveActorPayload, updatePostMutation]
  );

  const deletePost = useCallback(
    async (postId: string, actor?: FeedActorInput) => {
      setIsDeletingPost((previous) => ({
        ...previous,
        [postId]: true,
      }));
      setPostErrors((previous) => ({
        ...previous,
        [postId]: null,
      }));

      try {
        await deletePostMutation.mutateAsync({
          postId,
          actor: resolveActorPayload(actor),
        });
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
    [deletePostMutation, resolveActorPayload]
  );

  const deleteReply = useCallback(
    async (postId: string, replyId: string, actor?: FeedActorInput) => {
      setIsDeletingReply((previous) => ({
        ...previous,
        [replyId]: true,
      }));
      setReplyDeleteErrors((previous) => ({
        ...previous,
        [replyId]: null,
      }));

      try {
        await chatServiceApi.deleteFeedReply(
          postId,
          replyId,
          resolveActorPayload(actor)
        );
        updateFeedPostsCache(queryClient, (currentPosts) =>
          currentPosts.map((post) =>
            post.id === postId
              ? { ...post, replyCount: Math.max(0, post.replyCount - 1) }
              : post
          )
        );
        await loadReplies(postId);
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
    [loadReplies, queryClient, resolveActorPayload]
  );

  const clear = useCallback(() => {
    queryClient.setQueryData<FeedPostsResponse>(
      communityQueryKeys.feedPosts(),
      {
        posts: [],
      }
    );
    setPostsLocalError(null);
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
  }, [queryClient]);

  const postsError =
    postsLocalError ??
    (postsQueryError
      ? getErrorMessage(postsQueryError, "커뮤니티 글을 불러오지 못했습니다.")
      : null);

  return {
    posts,
    isPostsLoading: isPostsQueryLoading,
    postsError,
    isCreatingPost: createPostMutation.isPending,
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
