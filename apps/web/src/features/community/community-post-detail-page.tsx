"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { useYeonRouter } from "@yeon/ui/runtime/YeonNavigation";
import { useEffect, useMemo, useState } from "react";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import {
  YeonBadge,
  YeonButton,
  YeonField,
  YeonSurface,
  YeonText,
  YeonForm,
  YeonView,
  YeonLink,
} from "@yeon/ui";
import { CommunityGuestIdentityConfirmModal } from "./components/community-guest-identity-confirm-modal";
import {
  canSkipCommunityGuestIdentityConfirm,
  type CommunityGuestIdentity,
} from "./community-guest-identity-confirm";
import { CommunityGuestIdentityCard } from "./components/community-guest-identity-card";
import { parseCommunityPost } from "./community-post-format";
import { useCommunityFeed } from "./hooks/use-community-feed";
import { type ChatServiceFeedPost } from "./chat-service-api";

function formatKoreanDateTime(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

type PendingGuestIdentityAction = {
  actionLabel: string;
  run: (identity: CommunityGuestIdentity) => Promise<void>;
  resolve: (completed: boolean) => void;
} | null;

export function CommunityPostDetailPage({
  postId,
  initialPost,
}: {
  postId: string;
  initialPost: ChatServiceFeedPost;
}) {
  const router = useYeonRouter();
  const {
    posts,
    isPostsLoading,
    postsError,
    guestNickname,
    guestPassword,
    setGuestNickname,
    setGuestPassword,
    repliesByPost,
    isRepliesLoading,
    replyErrors,
    replyDrafts,
    isSubmittingReply,
    isUpdatingPost,
    isDeletingPost,
    isDeletingReply,
    replyDeleteErrors,
    postErrors,
    loadReplies,
    setReplyDraft,
    submitReply,
    updatePost,
    deletePost,
    deleteReply,
  } = useCommunityFeed({ initialPosts: [initialPost] });
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [pendingGuestIdentityAction, setPendingGuestIdentityAction] =
    useState<PendingGuestIdentityAction>(null);

  const post = useMemo(
    () => posts.find((candidate) => candidate.id === postId) ?? null,
    [postId, posts]
  );
  const replies = repliesByPost[postId] ?? [];

  useEffect(() => {
    if (post) {
      setEditDraft(post.body);
      void loadReplies(post.id);
    }
  }, [loadReplies, post]);

  const parsedPost = post ? parseCommunityPost(post) : null;

  const runWithGuestIdentityConfirm = (
    actionLabel: string,
    run: (identity: CommunityGuestIdentity) => Promise<void>
  ) => {
    const currentIdentity = { guestNickname, guestPassword };

    if (canSkipCommunityGuestIdentityConfirm(currentIdentity)) {
      return run(currentIdentity).then(() => true);
    }

    return new Promise<boolean>((resolve) => {
      setPendingGuestIdentityAction({
        actionLabel,
        run,
        resolve,
      });
    });
  };

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="community" />

      <YeonView
        as="main"
        className="mx-auto grid w-full max-w-[1160px] gap-4 px-4 py-6 md:px-8 lg:grid-cols-[minmax(0,840px)_280px] lg:items-start"
      >
        <YeonView className="order-2 min-w-0 lg:order-1">
          <YeonLink
            href="/community"
            className={`no-underline hover:text-[#111] ${SHARED_FEATURE_CLASS.text13EmphasisMuted}`}
          >
            ← 커뮤니티로 돌아가기
          </YeonLink>

          {isPostsLoading ? (
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-6 text-[13px] text-[#666]"
            >
              글을 불러오는 중...
            </YeonText>
          ) : null}

          {postsError ? (
            <YeonText
              variant="caption"
              tone="danger"
              className="mt-6 font-semibold"
            >
              {postsError}
            </YeonText>
          ) : null}

          {post && parsedPost ? (
            <YeonSurface as="article" className="mt-4 p-5">
              <YeonView className="flex flex-wrap items-center justify-between gap-3">
                <YeonBadge className={SHARED_FEATURE_CLASS.text12EmphasisMuted}>
                  {parsedPost.category}
                </YeonBadge>
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className={SHARED_FEATURE_CLASS.text12Subtle}
                >
                  {post.author.nickname} ·{" "}
                  {formatKoreanDateTime(post.createdAt)}
                </YeonText>
              </YeonView>

              <YeonText
                as="h1"
                variant="unstyled"
                tone="inherit"
                className="mt-4 text-[24px] font-black tracking-[-0.03em] text-[#111] md:text-[30px]"
              >
                {parsedPost.title}
              </YeonText>

              {isEditing ? (
                <YeonView className="mt-4 space-y-3">
                  <YeonField
                    as="textarea"
                    value={editDraft}
                    onChange={(event) => setEditDraft(event.target.value)}
                    rows={6}
                    maxLength={400}
                    className="min-h-[160px]"
                  />
                  <YeonView className="flex justify-end gap-2">
                    <YeonButton
                      type="button"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      취소
                    </YeonButton>
                    <YeonButton
                      type="button"
                      size="sm"
                      variant="primary"
                      disabled={!!isUpdatingPost[post.id] || !editDraft.trim()}
                      onClick={() => {
                        void runWithGuestIdentityConfirm(
                          "글을 수정",
                          (identity) => updatePost(post.id, editDraft, identity)
                        ).then((completed) => {
                          if (completed) {
                            setIsEditing(false);
                          }
                        });
                      }}
                    >
                      {isUpdatingPost[post.id] ? "저장 중" : "저장"}
                    </YeonButton>
                  </YeonView>
                </YeonView>
              ) : (
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="mt-4 whitespace-pre-wrap text-[15px] leading-[1.8] text-[#111]"
                >
                  {parsedPost.content}
                </YeonText>
              )}

              {postErrors[post.id] ? (
                <YeonText
                  variant="caption"
                  tone="danger"
                  className="mt-3 font-semibold"
                >
                  {postErrors[post.id]}
                </YeonText>
              ) : null}

              <YeonView className="mt-5 flex gap-3 border-t border-[#e5e5e5] pt-4">
                <YeonButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className={`h-auto px-0 py-0 underline-offset-4 hover:underline ${SHARED_FEATURE_CLASS.text12EmphasisMuted}`}
                >
                  수정
                </YeonButton>
                <YeonButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={!!isDeletingPost[post.id]}
                  onClick={() => {
                    void runWithGuestIdentityConfirm("글을 삭제", (identity) =>
                      deletePost(post.id, identity)
                    ).then((completed) => {
                      if (completed) {
                        router.replace("/community");
                      }
                    });
                  }}
                  className="h-auto px-0 py-0 underline-offset-4 hover:underline"
                >
                  {isDeletingPost[post.id] ? "삭제 중" : "삭제"}
                </YeonButton>
              </YeonView>
            </YeonSurface>
          ) : null}

          {post ? (
            <YeonSurface as="section" className="mt-4 p-5">
              <YeonText
                as="h2"
                variant="unstyled"
                tone="inherit"
                className="text-[17px] font-black tracking-[-0.02em] text-[#111]"
              >
                댓글 {post.replyCount}
              </YeonText>

              <YeonForm
                className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_70px]"
                onSubmit={(event) => {
                  event.preventDefault();
                  void runWithGuestIdentityConfirm("댓글을 작성", (identity) =>
                    submitReply(post.id, identity)
                  );
                }}
              >
                <YeonField
                  as="textarea"
                  value={replyDrafts[post.id] ?? ""}
                  onChange={(event) =>
                    setReplyDraft(post.id, event.target.value)
                  }
                  rows={2}
                  maxLength={400}
                  placeholder="댓글을 입력하세요"
                  className="min-h-[70px]"
                />
                <YeonButton
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={
                    !!isSubmittingReply[post.id] ||
                    !(replyDrafts[post.id] ?? "").trim()
                  }
                  className="h-10"
                >
                  {isSubmittingReply[post.id] ? "등록 중" : "등록"}
                </YeonButton>
              </YeonForm>

              {replyErrors[post.id] ? (
                <YeonText
                  variant="caption"
                  tone="danger"
                  className="mt-2 font-semibold"
                >
                  {replyErrors[post.id]}
                </YeonText>
              ) : null}

              <YeonView className="mt-4 space-y-2">
                {isRepliesLoading[post.id] ? (
                  <YeonText
                    as="p"
                    variant="unstyled"
                    tone="inherit"
                    className={SHARED_FEATURE_CLASS.text12Subtle}
                  >
                    댓글을 불러오는 중...
                  </YeonText>
                ) : null}
                {replies.map((reply) => (
                  <YeonSurface
                    as="div"
                    key={reply.id}
                    variant="panel"
                    className="p-3"
                  >
                    <YeonView className="flex flex-wrap items-center justify-between gap-2">
                      <YeonText
                        as="p"
                        variant="unstyled"
                        tone="inherit"
                        className={`${SHARED_FEATURE_CLASS.text12EmphasisMuted}`}
                      >
                        {reply.author.nickname}
                      </YeonText>
                      <YeonText
                        as="p"
                        variant="unstyled"
                        tone="inherit"
                        className="text-[11px] text-[#aaa]"
                      >
                        {formatKoreanDateTime(reply.createdAt)}
                      </YeonText>
                    </YeonView>
                    <YeonText
                      as="p"
                      variant="unstyled"
                      tone="inherit"
                      className="mt-1 whitespace-pre-wrap text-[13px] leading-[1.6] text-[#111]"
                    >
                      {reply.body}
                    </YeonText>
                    <YeonButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={!!isDeletingReply[reply.id]}
                      onClick={() => {
                        void runWithGuestIdentityConfirm(
                          "댓글을 삭제",
                          (identity) => deleteReply(post.id, reply.id, identity)
                        );
                      }}
                      className="mt-2 h-auto px-0 py-0 underline-offset-4 hover:underline"
                    >
                      {isDeletingReply[reply.id] ? "삭제 중" : "삭제"}
                    </YeonButton>
                    {replyDeleteErrors[reply.id] ? (
                      <YeonText
                        variant="caption"
                        tone="danger"
                        className="mt-1 font-semibold"
                      >
                        {replyDeleteErrors[reply.id]}
                      </YeonText>
                    ) : null}
                  </YeonSurface>
                ))}
              </YeonView>
            </YeonSurface>
          ) : null}
        </YeonView>

        <YeonView
          as="aside"
          className="order-1 min-w-0 lg:sticky lg:top-20 lg:order-2"
          aria-label="게스트 인증"
        >
          <CommunityGuestIdentityCard
            guestNickname={guestNickname}
            guestPassword={guestPassword}
            onSaveIdentity={(identity) => {
              setGuestNickname(identity.guestNickname);
              setGuestPassword(identity.guestPassword);
            }}
          />
        </YeonView>
      </YeonView>

      <CommunityGuestIdentityConfirmModal
        isOpen={pendingGuestIdentityAction !== null}
        actionLabel={pendingGuestIdentityAction?.actionLabel ?? "수정/삭제"}
        guestNickname={guestNickname}
        guestPassword={guestPassword}
        onClose={() => {
          pendingGuestIdentityAction?.resolve(false);
          setPendingGuestIdentityAction(null);
        }}
        onConfirm={(identity) => {
          setGuestNickname(identity.guestNickname);
          setGuestPassword(identity.guestPassword);

          const pending = pendingGuestIdentityAction;
          setPendingGuestIdentityAction(null);
          void pending
            ?.run(identity)
            .then(() => {
              pending.resolve(true);
            })
            .catch(() => pending.resolve(false));
        }}
      />
    </YeonView>
  );
}
