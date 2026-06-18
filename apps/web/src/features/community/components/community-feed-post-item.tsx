"use client";
import { useEffect, useState } from "react";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  YeonButton,
  YeonIcon,
  YeonLink,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { type ChatServiceFeedPost } from "../chat-service-api";
import {
  parseCommunityPost,
  serializeCommunityPost,
  type CommunityPostDraft,
} from "../community-post-format";
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
  const [editDraft, setEditDraft] = useState<CommunityPostDraft>(parsedPost);

  useEffect(() => {
    if (!isEditing) {
      setEditDraft(parseCommunityPost(post));
    }
  }, [isEditing, post.body]);

  return (
    <YeonSurface as="article" className="p-5">
      {isEditing ? (
        <FeedPostEditForm
          category={editDraft.category}
          title={editDraft.title}
          content={editDraft.content}
          isSubmitting={isUpdatingPost}
          onChangeCategory={(category) =>
            setEditDraft((current) => ({ ...current, category }))
          }
          onChangeTitle={(title) =>
            setEditDraft((current) => ({ ...current, title }))
          }
          onChangeContent={(content) =>
            setEditDraft((current) => ({ ...current, content }))
          }
          onCancel={() => setIsEditing(false)}
          onSubmit={async () => {
            const completed = await onUpdatePost(
              post.id,
              serializeCommunityPost(editDraft)
            );
            if (completed) {
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <>
          <YeonView
            className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${SHARED_FEATURE_CLASS.text13Secondary}`}
          >
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="font-bold text-[#111]"
            >
              {post.author.nickname}
            </YeonText>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              aria-hidden="true"
            >
              ·
            </YeonText>
            <YeonText
              as="time"
              variant="unstyled"
              tone="inherit"
              dateTime={post.createdAt}
            >
              {formatCommunityRelativeTime(post.createdAt)}
            </YeonText>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="ml-auto"
            >
              <CommunityCategoryBadge category={parsedPost.category} />
            </YeonText>
          </YeonView>

          <YeonLink
            href={`/community/posts/${post.id}`}
            className="mt-3 block no-underline"
          >
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className="line-clamp-2 text-[18px] font-bold tracking-[-0.02em] text-[#111]"
            >
              {parsedPost.title}
            </YeonText>
            {parsedPost.content && parsedPost.content !== parsedPost.title ? (
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="mt-2 line-clamp-2 whitespace-pre-wrap text-[15px] leading-[1.65] text-[#666]"
              >
                {parsedPost.content}
              </YeonText>
            ) : null}
          </YeonLink>
        </>
      )}

      {postError ? (
        <YeonText
          variant="caption"
          tone="danger"
          className="mt-2 font-semibold"
        >
          {postError}
        </YeonText>
      ) : null}

      <YeonView className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#e5e5e5] pt-3">
        <YeonButton
          type="button"
          onClick={onToggleReplies}
          disabled={isRepliesLoading}
          aria-expanded={expanded}
          variant="ghost"
          className="min-h-[44px] gap-1.5 px-3 py-2.5 text-[13px] font-bold"
        >
          <YeonIcon name="message-circle" size={16} />
          {post.replyCount > 0 ? `댓글 ${post.replyCount}` : "댓글 달기"}
        </YeonButton>
        <YeonView className="flex flex-wrap items-center gap-2">
          <YeonButton
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            disabled={isUpdatingPost || isDeletingPost}
            className="min-h-[44px] px-3 py-2.5 text-[12px] font-bold"
          >
            수정
          </YeonButton>
          <YeonButton
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              void onDeletePost(post.id);
            }}
            disabled={isUpdatingPost || isDeletingPost}
            className="min-h-[44px] px-3 py-2.5 text-[12px] font-bold"
          >
            {isDeletingPost ? "삭제 중" : "삭제"}
          </YeonButton>
          {isRepliesLoading ? (
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="px-2 text-[12px] font-semibold text-[#666]"
            >
              댓글 불러오는 중
            </YeonText>
          ) : null}
        </YeonView>
      </YeonView>

      {replyError ? (
        <YeonText
          variant="caption"
          tone="danger"
          className="mt-2 font-semibold"
        >
          {replyError}
        </YeonText>
      ) : null}

      {expanded ? (
        <YeonView className="mt-4 space-y-2 border-t border-[#e5e5e5] pt-4">
          {isRepliesLoading ? (
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text13Secondary}
            >
              댓글을 불러오는 중...
            </YeonText>
          ) : null}

          {replies.length ? (
            <YeonView className="space-y-2">
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
            </YeonView>
          ) : null}

          <FeedPostReplyForm
            postId={post.id}
            replyDraft={replyDraft}
            isSubmitting={isSubmittingReply}
            onChange={(value) => onChangeReplyDraft(post.id, value)}
            onSubmit={() => onSubmitReply(post.id)}
          />
        </YeonView>
      ) : null}
    </YeonSurface>
  );
}
