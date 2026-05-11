"use client";

import { useEffect, useState } from "react";

import { CommunityChatWidget } from "./components/community-chat-widget";
import { useCommunityFeed } from "./hooks/use-community-feed";
import { type ChatServiceFeedPost } from "./chat-service-api";

function formatKoreanDateTime(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(isoDate));
}

function FeedPostActions(props: {
  post: ChatServiceFeedPost;
  isRepliesExpanded: boolean;
  isRepliesLoading: boolean;
  onToggleReplies: () => void;
}) {
  const { post, isRepliesExpanded, isRepliesLoading, onToggleReplies } = props;

  return (
    <button
      type="button"
      onClick={onToggleReplies}
      className="text-[12px] font-semibold text-[#444] underline-offset-4 hover:underline"
      aria-expanded={isRepliesExpanded}
      aria-label="댓글 열기/닫기"
    >
      {isRepliesExpanded
        ? "댓글 닫기"
        : `${post.replyCount}개 댓글 보기${isRepliesLoading ? " (불러오는 중)" : ""}`}
    </button>
  );
}

function FeedPostReplyForm(props: {
  postId: string;
  replyDraft: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void>;
}) {
  const { postId, replyDraft, isSubmitting, onChange, onSubmit } = props;

  return (
    <form
      className="mt-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <div className="flex items-start gap-2">
        <label htmlFor={`community-reply-${postId}`} className="sr-only">
          댓글 입력
        </label>
        <textarea
          id={`community-reply-${postId}`}
          value={replyDraft}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          maxLength={400}
          placeholder="댓글을 입력하세요"
          className="min-h-[72px] w-full resize-y rounded-xl border border-[#ddd] px-3 py-2 text-[13px] outline-none focus:border-[#111]"
        />
        <button
          type="submit"
          className="h-[40px] rounded-xl bg-[#111] px-4 text-[12px] font-semibold text-white disabled:bg-[#d0d0d0]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "등록 중" : "등록"}
        </button>
      </div>
    </form>
  );
}

function FeedPostItem(props: {
  post: ChatServiceFeedPost;
  expanded: boolean;
  replies: ChatServiceFeedPost[];
  isRepliesLoading: boolean;
  replyError: string | null;
  replyDraft: string;
  isSubmittingReply: boolean;
  onToggleReplies: () => void;
  onChangeReplyDraft: (postId: string, value: string) => void;
  onSubmitReply: (postId: string) => Promise<void>;
}) {
  const {
    post,
    expanded,
    replies,
    isRepliesLoading,
    replyError,
    replyDraft,
    isSubmittingReply,
    onToggleReplies,
    onChangeReplyDraft,
    onSubmitReply,
  } = props;

  return (
    <article className="rounded-2xl border border-[#e7e7e7] bg-[#fafafa] p-4">
      <p className="text-[14px] leading-[1.7] text-[#111]">{post.body}</p>
      <p className="mt-2 text-[11px] leading-[1.4] text-[#777]">
        {post.author.nickname} · {formatKoreanDateTime(post.createdAt)}
      </p>

      <div className="mt-3">
        <FeedPostActions
          post={post}
          isRepliesExpanded={expanded}
          isRepliesLoading={isRepliesLoading}
          onToggleReplies={onToggleReplies}
        />

        {replyError ? (
          <p className="mt-2 text-[12px] text-red-600">{replyError}</p>
        ) : null}

        {expanded ? (
          <div className="mt-3 space-y-3">
            {isRepliesLoading ? (
              <p className="text-[12px] text-[#777]">댓글을 불러오는 중...</p>
            ) : null}

            {!replies.length ? (
              <p className="text-[12px] text-[#777]">아직 댓글이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="rounded-xl border border-[#ededed] bg-white p-3"
                  >
                    <p className="text-[13px] leading-[1.6] text-[#111]">
                      {reply.body}
                    </p>
                    <p className="mt-1 text-[11px] text-[#777]">
                      {reply.author.nickname} · {formatKoreanDateTime(reply.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <FeedPostReplyForm
              postId={post.id}
              replyDraft={replyDraft}
              isSubmitting={isSubmittingReply}
              onChange={(value) => onChangeReplyDraft(post.id, value)}
              onSubmit={() => onSubmitReply(post.id)}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function CommunityPage() {
  const {
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
    setReplyDraft,
    submitReply,
  } = useCommunityFeed();

  const [postBody, setPostBody] = useState("");

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <main className="mx-auto flex max-w-[1300px] flex-col gap-6 px-6 py-10 md:px-10">
        <section>
          <p className="text-[12px] font-semibold text-[#666]">커뮤니티</p>
          <h1 className="mt-2 text-[30px] font-black tracking-[-0.04em] text-[#111] md:text-[40px]">
            커뮤니티 공간
          </h1>
          <p className="mt-2 max-w-[680px] text-[14px] leading-[1.7] text-[#666]">
            실시간 채팅과 글/댓글이 함께 보이는 공간입니다.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,_1fr)_420px]">
          <div className="order-2 min-h-0 space-y-4 rounded-2xl border border-[#e7e7e7] bg-[#fff] p-4">
            <div className="space-y-3">
              <h2 className="text-[20px] font-semibold text-[#111]">커뮤니티 글</h2>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const trimmed = postBody.trim();
                  if (!trimmed) {
                    return;
                  }

                  void createPost(trimmed).then(() => {
                    setPostBody("");
                  });
                }}
                className="space-y-2"
              >
                <label htmlFor="community-post-input" className="sr-only">
                  새 글 입력
                </label>
                <textarea
                  id="community-post-input"
                  value={postBody}
                  onChange={(event) => setPostBody(event.target.value)}
                  rows={4}
                  maxLength={400}
                  placeholder="커뮤니티에 공유할 글을 남겨보세요"
                  className="w-full rounded-2xl border border-[#ddd] px-3 py-3 text-[14px] outline-none focus:border-[#111]"
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-[#777]">{postBody.length}/400</p>
                  <button
                    type="submit"
                    disabled={isCreatingPost || !postBody.trim()}
                    className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white disabled:bg-[#d0d0d0]"
                  >
                    {isCreatingPost ? "작성 중" : "글 작성"}
                  </button>
                </div>
              </form>

              {postsError ? (
                <p className="text-[12px] text-red-600">{postsError}</p>
              ) : null}
            </div>

            <div className="space-y-3">
              <h3 className="text-[16px] font-semibold text-[#111]">최신 글</h3>

              {isPostsLoading ? <p className="text-[12px] text-[#777]">글 목록을 불러오는 중...</p> : null}

              {!posts.length && !isPostsLoading ? (
                <p className="text-[13px] text-[#777]">
                  아직 글이 없습니다. 첫 글을 남겨보세요.
                </p>
              ) : null}

              <div className="space-y-3">
                {posts.map((post) => (
                  <FeedPostItem
                    key={post.id}
                    post={post}
                    expanded={!!expandedReplies[post.id]}
                    replies={repliesByPost[post.id] ?? []}
                    isRepliesLoading={!!isRepliesLoading[post.id]}
                    replyError={replyErrors[post.id] ?? null}
                    replyDraft={replyDrafts[post.id] ?? ""}
                    isSubmittingReply={!!isSubmittingReply[post.id]}
                    onToggleReplies={() => {
                      toggleReplies(post.id);
                    }}
                    onChangeReplyDraft={(postId, value) => {
                      setReplyDraft(postId, value);
                    }}
                    onSubmitReply={async (postId) => {
                      await submitReply(postId);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <section className="order-1" aria-label="커뮤니티 실시간 채팅">
            <CommunityChatWidget
              variant="full"
              className="min-h-[560px]"
            />
          </section>
        </section>
      </main>
    </div>
  );
}
