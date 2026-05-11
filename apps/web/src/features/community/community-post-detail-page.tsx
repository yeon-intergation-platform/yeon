"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CommonProductHeader } from "@/components/product-shell/product-header";
import { parseCommunityPost } from "./community-page";
import { useCommunityFeed } from "./hooks/use-community-feed";

function formatKoreanDateTime(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

export function CommunityPostDetailPage({ postId }: { postId: string }) {
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
    loadPosts,
    loadReplies,
    setReplyDraft,
    submitReply,
    updatePost,
    deletePost,
    deleteReply,
  } = useCommunityFeed();
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");

  const post = useMemo(
    () => posts.find((candidate) => candidate.id === postId) ?? null,
    [postId, posts]
  );
  const replies = repliesByPost[postId] ?? [];

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (post) {
      setEditDraft(post.body);
      void loadReplies(post.id);
    }
  }, [loadReplies, post]);

  const parsedPost = post ? parseCommunityPost(post) : null;

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <CommonProductHeader activeService="community" />

      <main className="mx-auto max-w-[900px] px-4 py-6 md:px-8">
        <Link
          href="/community"
          className="text-[13px] font-semibold text-[#666] no-underline hover:text-[#111]"
        >
          ← 커뮤니티로 돌아가기
        </Link>

        {isPostsLoading ? (
          <p className="mt-6 text-[13px] text-[#777]">글을 불러오는 중...</p>
        ) : null}

        {postsError ? (
          <p className="mt-6 text-[13px] text-red-600">{postsError}</p>
        ) : null}

        {post && parsedPost ? (
          <article className="mt-4 rounded-2xl border border-[#e7e7e7] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-[12px] font-semibold text-[#555]">
                {parsedPost.category}
              </span>
              <p className="text-[12px] text-[#777]">
                {post.author.nickname} · {formatKoreanDateTime(post.createdAt)}
              </p>
            </div>

            <h1 className="mt-4 text-[24px] font-black tracking-[-0.03em] text-[#111] md:text-[30px]">
              {parsedPost.title}
            </h1>

            {isEditing ? (
              <div className="mt-4 space-y-3">
                <textarea
                  value={editDraft}
                  onChange={(event) => setEditDraft(event.target.value)}
                  rows={6}
                  maxLength={400}
                  className="w-full rounded-xl border border-[#ddd] px-3 py-2 text-[14px] outline-none focus:border-[#111]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-[#ddd] px-3 py-2 text-[12px] font-semibold text-[#333]"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    disabled={!!isUpdatingPost[post.id] || !editDraft.trim()}
                    onClick={() => {
                      void updatePost(post.id, editDraft).then(() =>
                        setIsEditing(false)
                      );
                    }}
                    className="rounded-xl bg-[#111] px-3 py-2 text-[12px] font-semibold text-white disabled:bg-[#d0d0d0]"
                  >
                    {isUpdatingPost[post.id] ? "저장 중" : "저장"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-[1.8] text-[#333]">
                {parsedPost.content}
              </p>
            )}

            {postErrors[post.id] ? (
              <p className="mt-3 text-[12px] text-red-600">
                {postErrors[post.id]}
              </p>
            ) : null}

            <div className="mt-5 flex gap-3 border-t border-[#f0f0f0] pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-[12px] font-semibold text-[#555] underline-offset-4 hover:underline"
              >
                수정
              </button>
              <button
                type="button"
                disabled={!!isDeletingPost[post.id]}
                onClick={() => {
                  void deletePost(post.id);
                }}
                className="text-[12px] font-semibold text-red-600 underline-offset-4 hover:underline disabled:text-[#aaa]"
              >
                {isDeletingPost[post.id] ? "삭제 중" : "삭제"}
              </button>
            </div>
          </article>
        ) : null}

        {post ? (
          <section className="mt-4 rounded-2xl border border-[#e7e7e7] bg-white p-5">
            <h2 className="text-[17px] font-black tracking-[-0.02em] text-[#111]">
              댓글 {post.replyCount}
            </h2>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <input
                value={guestNickname}
                onChange={(event) => setGuestNickname(event.target.value)}
                placeholder="닉네임 입력"
                maxLength={40}
                className="h-9 rounded-xl border border-[#ddd] px-3 text-[13px] outline-none focus:border-[#111]"
              />
              <input
                value={guestPassword}
                onChange={(event) => setGuestPassword(event.target.value)}
                placeholder="수정/삭제용 비밀번호"
                type="password"
                maxLength={128}
                className="h-9 rounded-xl border border-[#ddd] px-3 text-[13px] outline-none focus:border-[#111]"
              />
            </div>

            <form
              className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_70px]"
              onSubmit={(event) => {
                event.preventDefault();
                void submitReply(post.id);
              }}
            >
              <textarea
                value={replyDrafts[post.id] ?? ""}
                onChange={(event) => setReplyDraft(post.id, event.target.value)}
                rows={2}
                maxLength={400}
                placeholder="댓글을 입력하세요"
                className="min-h-[70px] rounded-xl border border-[#ddd] px-3 py-2 text-[13px] outline-none focus:border-[#111]"
              />
              <button
                type="submit"
                disabled={
                  !!isSubmittingReply[post.id] ||
                  !(replyDrafts[post.id] ?? "").trim()
                }
                className="h-10 rounded-xl bg-[#111] px-3 text-[12px] font-semibold text-white disabled:bg-[#d0d0d0]"
              >
                {isSubmittingReply[post.id] ? "등록 중" : "등록"}
              </button>
            </form>

            {replyErrors[post.id] ? (
              <p className="mt-2 text-[12px] text-red-600">
                {replyErrors[post.id]}
              </p>
            ) : null}

            <div className="mt-4 space-y-2">
              {isRepliesLoading[post.id] ? (
                <p className="text-[12px] text-[#777]">댓글을 불러오는 중...</p>
              ) : null}
              {replies.map((reply) => (
                <div
                  key={reply.id}
                  className="rounded-xl border border-[#ededed] bg-[#fafafa] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold text-[#555]">
                      {reply.author.nickname}
                    </p>
                    <p className="text-[11px] text-[#999]">
                      {formatKoreanDateTime(reply.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-[13px] leading-[1.6] text-[#111]">
                    {reply.body}
                  </p>
                  <button
                    type="button"
                    disabled={!!isDeletingReply[reply.id]}
                    onClick={() => {
                      void deleteReply(post.id, reply.id);
                    }}
                    className="mt-2 text-[12px] font-semibold text-red-600 underline-offset-4 hover:underline disabled:text-[#aaa]"
                  >
                    {isDeletingReply[reply.id] ? "삭제 중" : "삭제"}
                  </button>
                  {replyDeleteErrors[reply.id] ? (
                    <p className="mt-1 text-[12px] text-red-600">
                      {replyDeleteErrors[reply.id]}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
