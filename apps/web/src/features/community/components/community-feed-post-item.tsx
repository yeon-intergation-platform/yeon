"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

import { type ChatServiceFeedPost } from "../chat-service-api";
import { parseCommunityPost } from "../community-post-format";
import { FeedPostEditForm, FeedPostReplyForm } from "./community-feed-forms";
import {
  CommunityCategoryBadge,
  formatCommunityRelativeTime,
} from "./community-feed-meta";
import { FeedReplyItem } from "./community-feed-reply-item";

export function FeedPostItem(props: {
  post: ChatServiceFeedPost;
  expanded: boolean;
  replies: ChatServiceFeedPost[];
  isRepliesLoading: boolean;
  replyError: string | null;
  replyDraft: string;
  isSubmittingReply: boolean;
  postError: string | null;
  isUpdatingPost: boolean;
  isDeletingPost: boolean;
  isDeletingReply: Record<string, boolean>;
  replyDeleteErrors: Record<string, string | null>;
  onToggleReplies: () => void;
  onChangeReplyDraft: (postId: string, value: string) => void;
  onSubmitReply: (postId: string) => Promise<void>;
  onUpdatePost: (postId: string, body: string) => Promise<boolean>;
  onDeletePost: (postId: string) => Promise<boolean>;
  onDeleteReply: (postId: string, replyId: string) => Promise<boolean>;
}) {
  const {
    post,
    expanded,
    replies,
    isRepliesLoading,
    replyError,
    replyDraft,
    isSubmittingReply,
    postError,
    isUpdatingPost,
    isDeletingPost,
    isDeletingReply,
    replyDeleteErrors,
    onToggleReplies,
    onChangeReplyDraft,
    onSubmitReply,
    onUpdatePost,
    onDeletePost,
    onDeleteReply,
  } = props;
  const parsedPost = parseCommunityPost(post);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(post.body);

  useEffect(() => {
    if (!isEditing) {
      setEditDraft(post.body);
    }
  }, [isEditing, post.body]);

  return (
    <article className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      {isEditing ? (
        <FeedPostEditForm
          draft={editDraft}
          isSubmitting={isUpdatingPost}
          onChange={setEditDraft}
          onCancel={() => setIsEditing(false)}
          onSubmit={async () => {
            const completed = await onUpdatePost(post.id, editDraft);
            if (completed) {
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <>
          <div
            className={`flex flex-wrap items-center gap-2 ${SHARED_FEATURE_CLASS.text13Secondary}`}
          >
            <span className="font-bold text-[#111827]">
              {post.author.nickname}
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.createdAt}>
              {formatCommunityRelativeTime(post.createdAt)}
            </time>
            <CommunityCategoryBadge category={parsedPost.category} />
          </div>

          <Link
            href={`/community/posts/${post.id}`}
            className="mt-3 block no-underline"
          >
            <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#111827]">
              {parsedPost.title}
            </h2>
            {parsedPost.content ? (
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[1.65] text-[#374151]">
                {parsedPost.content}
              </p>
            ) : null}
          </Link>
        </>
      )}

      {postError ? (
        <p className="mt-2 text-[12px] text-red-600">{postError}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#f3f4f6] pt-3">
        <button
          type="button"
          onClick={onToggleReplies}
          disabled={isRepliesLoading}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[13px] font-bold text-[#4b5563] transition-colors hover:bg-[#f3f4f6] disabled:text-[#9ca3af]"
        >
          <MessageCircle size={16} aria-hidden="true" />
          댓글 {post.replyCount}
        </button>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={isUpdatingPost || isDeletingPost}
            className="rounded-xl px-2 py-1.5 text-[12px] font-bold text-[#4b5563] transition-colors hover:bg-[#f3f4f6] hover:text-[#111827] disabled:text-[#9ca3af]"
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => {
              void onDeletePost(post.id);
            }}
            disabled={isUpdatingPost || isDeletingPost}
            className="rounded-xl px-2 py-1.5 text-[12px] font-bold text-red-600 transition-colors hover:bg-red-50 disabled:text-[#9ca3af]"
          >
            {isDeletingPost ? "삭제 중" : "삭제"}
          </button>
          {isRepliesLoading ? (
            <span className="px-2 text-[12px] font-semibold text-[#6b7280]">
              댓글 불러오는 중
            </span>
          ) : null}
        </div>
      </div>

      {replyError ? (
        <p className="mt-2 text-[12px] text-red-600">{replyError}</p>
      ) : null}

      {expanded ? (
        <div className="mt-4 space-y-2 border-t border-[#f3f4f6] pt-4">
          {isRepliesLoading ? (
            <p className={SHARED_FEATURE_CLASS.text13Secondary}>
              댓글을 불러오는 중...
            </p>
          ) : null}

          {replies.length ? (
            <div className="space-y-2">
              {replies.map((reply) => (
                <FeedReplyItem
                  key={reply.id}
                  reply={reply}
                  isDeleting={!!isDeletingReply[reply.id]}
                  deleteError={replyDeleteErrors[reply.id] ?? null}
                  onDelete={() => {
                    void onDeleteReply(post.id, reply.id);
                  }}
                />
              ))}
            </div>
          ) : null}

          <FeedPostReplyForm
            postId={post.id}
            replyDraft={replyDraft}
            isSubmitting={isSubmittingReply}
            onChange={(value) => onChangeReplyDraft(post.id, value)}
            onSubmit={() => onSubmitReply(post.id)}
          />
        </div>
      ) : null}
    </article>
  );
}
