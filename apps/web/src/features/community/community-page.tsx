"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BarChart3,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share,
  ShieldCheck,
} from "lucide-react";

import { CommonProductHeader } from "@/components/product-shell/product-header";
import { type ChatServiceFeedPost } from "./chat-service-api";
import {
  CommunityGuestIdentityConfirmModal,
  isCommunityGuestIdentityConfirmDismissed,
  persistCommunityGuestIdentityConfirmDismissed,
  type CommunityGuestIdentity,
} from "./components/community-guest-identity-confirm-modal";
import { CommunityChatWidget } from "./components/community-chat-widget";
import { useCommunityFeed } from "./hooks/use-community-feed";

const COMMUNITY_CATEGORIES = [
  "전체",
  "잡담",
  "타자친구 모집",
  "카드친구 모집",
  "관리자에게 아무말/조언",
] as const;

const FEED_POST_METRICS = {
  repostSeed: 3,
  likeSeed: 11,
  viewSeed: 137,
} as const;

type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];
type WritableCommunityCategory = Exclude<CommunityCategory, "전체">;
type PendingGuestIdentityAction = {
  actionLabel: string;
  run: (identity: CommunityGuestIdentity) => Promise<void>;
  resolve: (completed: boolean) => void;
} | null;

const WRITABLE_CATEGORIES = COMMUNITY_CATEGORIES.filter(
  (category): category is WritableCommunityCategory => category !== "전체"
);

function getCategoryBadgeClassName(category: WritableCommunityCategory) {
  switch (category) {
    case "타자친구 모집":
      return "inline-flex items-center rounded-full border border-[#dcfce7] bg-[#f0fdf4] px-2 py-0.5 text-[11px] font-bold text-[#047857]";
    case "카드친구 모집":
      return "inline-flex items-center rounded-full border border-[#fef3c7] bg-[#fffbeb] px-2 py-0.5 text-[11px] font-bold text-[#92400e]";
    case "관리자에게 아무말/조언":
      return "inline-flex items-center rounded-full border border-[#f3e8ff] bg-[#faf5ff] px-2 py-0.5 text-[11px] font-bold text-[#7e22ce]";
    case "잡담":
    default:
      return "inline-flex items-center rounded-full border border-[#dbeafe] bg-[#eff6ff] px-2 py-0.5 text-[11px] font-bold text-[#1d4ed8]";
  }
}

function getAvatarFallbackClassName(seed: number, size: "normal" | "small") {
  const variant = seed % 4;

  if (size === "small") {
    switch (variant) {
      case 1:
        return "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fff4d7] via-[#fffaf0] to-[#ffe7a3] text-[14px] font-black text-[#92400e] shadow-inner";
      case 2:
        return "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ffe4ea] via-[#fff5f7] to-[#ffd4df] text-[14px] font-black text-[#be123c] shadow-inner";
      case 3:
        return "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e7fff0] via-[#f6fff9] to-[#c9f7d9] text-[14px] font-black text-[#047857] shadow-inner";
      default:
        return "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8f5ff] via-[#f7fbff] to-[#d9eaff] text-[14px] font-black text-[#1d4ed8] shadow-inner";
    }
  }

  switch (variant) {
    case 1:
      return "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fff4d7] via-[#fffaf0] to-[#ffe7a3] text-[18px] font-black text-[#92400e] shadow-inner";
    case 2:
      return "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ffe4ea] via-[#fff5f7] to-[#ffd4df] text-[18px] font-black text-[#be123c] shadow-inner";
    case 3:
      return "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e7fff0] via-[#f6fff9] to-[#c9f7d9] text-[18px] font-black text-[#047857] shadow-inner";
    default:
      return "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8f5ff] via-[#f7fbff] to-[#d9eaff] text-[18px] font-black text-[#1d4ed8] shadow-inner";
  }
}

function getTimelineActionButtonClassName(
  tone: "default" | "reply" | "repost" | "like"
) {
  switch (tone) {
    case "reply":
      return "group inline-flex items-center gap-1.5 rounded-full pr-2 text-[13px] font-semibold text-[#536471] transition-colors hover:bg-[#e8f5fd] hover:text-[#1d9bf0] disabled:cursor-not-allowed disabled:text-[#aab8c2]";
    case "repost":
      return "group inline-flex items-center gap-1.5 rounded-full pr-2 text-[13px] font-semibold text-[#536471] transition-colors hover:bg-[#def1eb] hover:text-[#00ba7c] disabled:cursor-not-allowed disabled:text-[#aab8c2]";
    case "like":
      return "group inline-flex items-center gap-1.5 rounded-full pr-2 text-[13px] font-semibold text-[#536471] transition-colors hover:bg-[#fce8f3] hover:text-[#f91880] disabled:cursor-not-allowed disabled:text-[#aab8c2]";
    case "default":
    default:
      return "group inline-flex items-center gap-1.5 rounded-full pr-2 text-[13px] font-semibold text-[#536471] transition-colors hover:bg-[#eff3f4] hover:text-[#0f1419] disabled:cursor-not-allowed disabled:text-[#aab8c2]";
  }
}

function formatKoreanDateTime(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(isoDate));
}

function formatRelativeTime(isoDate: string) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  return formatKoreanDateTime(isoDate);
}

function serializeCommunityPost(input: {
  category: WritableCommunityCategory;
  title: string;
  content: string;
}) {
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

function hashText(value: string) {
  return Array.from(value).reduce(
    (hash, character) => hash + character.charCodeAt(0),
    0
  );
}

function createAuthorHandle(nickname: string) {
  const normalized = nickname
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `@${normalized || "yeon_guest"}`;
}

function formatMetricCount(value: number) {
  if (value >= 1000) {
    const compact = value / 1000;
    return `${Number.isInteger(compact) ? compact.toFixed(0) : compact.toFixed(1)}K`;
  }

  return String(value);
}

function getPostMetrics(post: ChatServiceFeedPost) {
  const seed = hashText(post.id);
  return {
    replies: post.replyCount,
    reposts: Math.floor(seed / FEED_POST_METRICS.repostSeed) % 18,
    likes: post.replyCount * 4 + (seed % FEED_POST_METRICS.likeSeed),
    views: 220 + (seed % FEED_POST_METRICS.viewSeed) * 9,
  };
}

function FeedGuestIdentityForm(props: {
  guestNickname: string;
  guestPassword: string;
  onChangeNickname: (value: string) => void;
  onChangePassword: (value: string) => void;
  className?: string;
}) {
  const {
    guestNickname,
    guestPassword,
    onChangeNickname,
    onChangePassword,
    className,
  } = props;

  return (
    <div className={["grid gap-3", className].filter(Boolean).join(" ")}>
      <label className="text-[12px] font-semibold text-[#536471]">
        닉네임
        <input
          value={guestNickname}
          onChange={(event) => onChangeNickname(event.target.value)}
          placeholder="닉네임 입력"
          maxLength={40}
          className="mt-1 h-10 w-full rounded-full border border-[#cfd9de] bg-white px-4 text-[14px] font-normal text-[#0f1419] outline-none transition-colors focus:border-[#1d9bf0]"
        />
      </label>
      <label className="text-[12px] font-semibold text-[#536471]">
        비밀번호
        <input
          value={guestPassword}
          onChange={(event) => onChangePassword(event.target.value)}
          placeholder="수정/삭제용 비밀번호"
          type="password"
          maxLength={128}
          className="mt-1 h-10 w-full rounded-full border border-[#cfd9de] bg-white px-4 text-[14px] font-normal text-[#0f1419] outline-none transition-colors focus:border-[#1d9bf0]"
        />
      </label>
    </div>
  );
}

function AuthorAvatar({
  post,
  size = "normal",
}: {
  post: ChatServiceFeedPost;
  size?: "normal" | "small";
}) {
  const initial = post.author.nickname.trim().slice(0, 1) || "연";
  const imageClassName =
    size === "small"
      ? "h-9 w-9 rounded-full object-cover"
      : "h-12 w-12 rounded-full object-cover";

  if (post.author.avatarUrl) {
    return <img src={post.author.avatarUrl} alt="" className={imageClassName} />;
  }

  return (
    <div
      className={getAvatarFallbackClassName(hashText(post.author.id), size)}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

function CategoryBadge({ category }: { category: WritableCommunityCategory }) {
  return <span className={getCategoryBadgeClassName(category)}>{category}</span>;
}

function TimelineActionButton(props: {
  icon: ReactNode;
  label: string;
  count?: number;
  tone?: "default" | "reply" | "repost" | "like";
  onClick?: () => void;
  disabled?: boolean;
  expanded?: boolean;
}) {
  const { icon, label, count, tone = "default", onClick, disabled, expanded } =
    props;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-expanded={expanded}
      className={getTimelineActionButtonClassName(tone)}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-current/10">
        {icon}
      </span>
      {typeof count === "number" ? <span>{formatMetricCount(count)}</span> : null}
    </button>
  );
}

function FeedPostEditForm(props: {
  draft: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
}) {
  const { draft, isSubmitting, onChange, onCancel, onSubmit } = props;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
      className="rounded-2xl border border-[#cfd9de] bg-white p-3"
    >
      <textarea
        value={draft}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        maxLength={400}
        className="w-full resize-y rounded-2xl border border-[#cfd9de] bg-white px-4 py-3 text-[15px] leading-[1.55] text-[#0f1419] outline-none transition-colors focus:border-[#1d9bf0]"
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[12px] text-[#536471]">{draft.length}/400</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[#cfd9de] px-4 py-2 text-[13px] font-bold text-[#0f1419] transition-colors hover:bg-[#f7f9f9]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !draft.trim()}
            className="rounded-full bg-[#0f1419] px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#272c30] disabled:bg-[#cfd9de]"
          >
            {isSubmitting ? "저장 중" : "저장"}
          </button>
        </div>
      </div>
    </form>
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
      className="mt-4 grid grid-cols-[40px_minmax(0,1fr)] gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <div className="h-10 w-10 rounded-full bg-[#eff3f4]" aria-hidden="true" />
      <div className="rounded-2xl border border-[#cfd9de] bg-white p-3">
        <label htmlFor={`community-reply-${postId}`} className="sr-only">
          댓글 입력
        </label>
        <textarea
          id={`community-reply-${postId}`}
          value={replyDraft}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          maxLength={400}
          placeholder="답글을 게시하세요"
          className="min-h-[58px] w-full resize-y border-0 bg-transparent text-[15px] leading-[1.5] text-[#0f1419] outline-none placeholder:text-[#536471]"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            className="h-9 rounded-full bg-[#0f1419] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#272c30] disabled:bg-[#cfd9de]"
            disabled={isSubmitting || !replyDraft.trim()}
          >
            {isSubmitting ? "게시 중" : "답글"}
          </button>
        </div>
      </div>
    </form>
  );
}

function FeedReplyItem(props: {
  post: ChatServiceFeedPost;
  reply: ChatServiceFeedPost;
  isDeleting: boolean;
  deleteError: string | null;
  onDelete: () => void;
}) {
  const { post, reply, isDeleting, deleteError, onDelete } = props;

  return (
    <div className="grid grid-cols-[40px_minmax(0,1fr)] gap-3">
      <div className="relative flex justify-center">
        <div className="absolute -top-3 bottom-9 w-px bg-[#cfd9de]" />
        <AuthorAvatar post={reply} size="small" />
      </div>
      <div className="min-w-0 pb-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-[14px] leading-[1.35]">
          <span className="truncate font-black text-[#0f1419]">
            {reply.author.nickname}
          </span>
          <span className="truncate text-[#536471]">
            {createAuthorHandle(reply.author.nickname)}
          </span>
          <span className="text-[#536471]">·</span>
          <span className="text-[#536471]">{formatRelativeTime(reply.createdAt)}</span>
        </div>
        <p className="mt-1 text-[13px] text-[#536471]">
          <span>답글 대상 </span>
          <span className="text-[#1d9bf0]">{createAuthorHandle(post.author.nickname)}</span>
        </p>
        <p className="mt-1 whitespace-pre-wrap text-[15px] leading-[1.55] text-[#0f1419]">
          {reply.body}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <TimelineActionButton
            icon={<Heart size={16} />}
            label="답글 좋아요"
            count={hashText(reply.id) % 9}
            tone="like"
          />
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-full px-2 py-1 text-[12px] font-bold text-red-600 transition-colors hover:bg-red-50 disabled:text-[#aab8c2]"
          >
            {isDeleting ? "삭제 중" : "삭제"}
          </button>
        </div>
        {deleteError ? <p className="mt-1 text-[12px] text-red-600">{deleteError}</p> : null}
      </div>
    </div>
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
  const metrics = getPostMetrics(post);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(post.body);

  useEffect(() => {
    if (!isEditing) {
      setEditDraft(post.body);
    }
  }, [isEditing, post.body]);

  return (
    <article className="group grid grid-cols-[48px_minmax(0,1fr)] gap-3 border-b border-[#eff3f4] px-4 py-4 transition-colors hover:bg-[#f7f9f9]">
      <AuthorAvatar post={post} />
      <div className="min-w-0">
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
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-[15px] leading-[1.35]">
                  <span className="truncate font-black text-[#0f1419]">
                    {post.author.nickname}
                  </span>
                  <ShieldCheck size={17} className="shrink-0 text-[#1d9bf0]" aria-hidden="true" />
                  <span className="truncate text-[#536471]">
                    {createAuthorHandle(post.author.nickname)}
                  </span>
                  <span className="text-[#536471]">·</span>
                  <time className="text-[#536471]" dateTime={post.createdAt}>
                    {formatRelativeTime(post.createdAt)}
                  </time>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <CategoryBadge category={parsedPost.category} />
                  <span className="text-[12px] font-medium text-[#536471]">
                    YEON 커뮤니티에서 게시
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="-mr-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#536471] transition-colors hover:bg-[#e8f5fd] hover:text-[#1d9bf0]"
                aria-label="글 더보기"
              >
                <MoreHorizontal size={19} />
              </button>
            </div>

            <Link href={`/community/posts/${post.id}`} className="mt-2 block no-underline">
              <h2 className="whitespace-pre-wrap text-[20px] font-semibold leading-[1.35] tracking-[-0.02em] text-[#0f1419] group-hover:underline">
                {parsedPost.title}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-[16px] leading-[1.55] text-[#0f1419]">
                {parsedPost.content}
              </p>
            </Link>
          </>
        )}

        {postError ? <p className="mt-2 text-[12px] text-red-600">{postError}</p> : null}

        <div className="mt-3 flex max-w-[560px] items-center justify-between gap-2">
          <TimelineActionButton
            icon={<MessageCircle size={18} />}
            label={expanded ? "댓글 닫기" : "댓글 열기"}
            count={metrics.replies}
            tone="reply"
            onClick={onToggleReplies}
            disabled={isRepliesLoading}
            expanded={expanded}
          />
          <TimelineActionButton
            icon={<Repeat2 size={18} />}
            label="리포스트"
            count={metrics.reposts}
            tone="repost"
          />
          <TimelineActionButton
            icon={<Heart size={18} />}
            label="좋아요"
            count={metrics.likes}
            tone="like"
          />
          <TimelineActionButton
            icon={<BarChart3 size={18} />}
            label="조회수"
            count={metrics.views}
          />
          <div className="hidden items-center gap-1 sm:flex">
            <TimelineActionButton icon={<Bookmark size={18} />} label="북마크" />
            <TimelineActionButton icon={<Share size={18} />} label="공유" />
          </div>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={isUpdatingPost || isDeletingPost}
            className="rounded-full px-2 py-1 text-[12px] font-bold text-[#536471] transition-colors hover:bg-[#eff3f4] hover:text-[#0f1419] disabled:text-[#aab8c2]"
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => {
              void onDeletePost(post.id);
            }}
            disabled={isUpdatingPost || isDeletingPost}
            className="rounded-full px-2 py-1 text-[12px] font-bold text-red-600 transition-colors hover:bg-red-50 disabled:text-[#aab8c2]"
          >
            {isDeletingPost ? "삭제 중" : "삭제"}
          </button>
          {isRepliesLoading ? (
            <span className="px-2 text-[12px] font-semibold text-[#536471]">
              댓글 불러오는 중
            </span>
          ) : null}
        </div>

        {replyError ? <p className="mt-2 text-[12px] text-red-600">{replyError}</p> : null}

        {expanded ? (
          <div className="mt-4 border-t border-[#eff3f4] pt-4">
            {isRepliesLoading ? <p className="text-[13px] text-[#536471]">댓글을 불러오는 중...</p> : null}

            {replies.length ? (
              <div className="space-y-1">
                {replies.map((reply) => (
                  <FeedReplyItem
                    key={reply.id}
                    post={post}
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
      </div>
    </article>
  );
}

function WritePostPanel(props: {
  category: WritableCommunityCategory;
  title: string;
  content: string;
  isCreatingPost: boolean;
  guestNickname: string;
  onChangeCategory: (value: WritableCommunityCategory) => void;
  onChangeTitle: (value: string) => void;
  onChangeContent: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const {
    category,
    title,
    content,
    isCreatingPost,
    guestNickname,
    onChangeCategory,
    onChangeTitle,
    onChangeContent,
    onCancel,
    onSubmit,
  } = props;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="grid grid-cols-[48px_minmax(0,1fr)] gap-3 border-b border-[#eff3f4] bg-white px-4 py-4"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0f1419] to-[#536471] text-[18px] font-black text-white">
        {guestNickname.trim().slice(0, 1) || "연"}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <select
            value={category}
            onChange={(event) =>
              onChangeCategory(event.target.value as WritableCommunityCategory)
            }
            className="h-9 rounded-full border border-[#cfd9de] bg-white px-3 text-[13px] font-bold text-[#0f1419] outline-none transition-colors focus:border-[#1d9bf0]"
            aria-label="카테고리"
          >
            {WRITABLE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-[#cfd9de] bg-white px-4 py-2 text-[13px] font-bold text-[#0f1419] transition-colors hover:bg-[#f7f9f9]"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isCreatingPost || !title.trim() || !content.trim()}
              className="rounded-full bg-[#0f1419] px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#272c30] disabled:bg-[#cfd9de]"
            >
              {isCreatingPost ? "게시 중" : "게시"}
            </button>
          </div>
        </div>
        <input
          value={title}
          onChange={(event) => onChangeTitle(event.target.value)}
          placeholder="무슨 일이 일어나고 있나요? 제목을 적어주세요"
          maxLength={80}
          className="mt-3 w-full border-0 bg-transparent text-[20px] font-semibold tracking-[-0.02em] text-[#0f1419] outline-none placeholder:text-[#536471]"
        />
        <textarea
          value={content}
          onChange={(event) => onChangeContent(event.target.value)}
          placeholder="내용을 이어서 적어주세요"
          rows={4}
          maxLength={280}
          className="mt-2 w-full resize-y border-0 bg-transparent text-[16px] leading-[1.55] text-[#0f1419] outline-none placeholder:text-[#536471]"
        />
        <div className="border-t border-[#eff3f4] pt-3 text-[12px] font-semibold text-[#536471]">
          {title.length + content.length}/360
        </div>
      </div>
    </form>
  );
}

function SidebarPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#eff3f4] bg-[#f7f9f9] p-4">
      <h2 className="text-[18px] font-black tracking-[-0.03em] text-[#0f1419]">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
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
    setReplyDraft,
    submitReply,
    updatePost,
    deletePost,
    deleteReply,
  } = useCommunityFeed();

  const [selectedCategory, setSelectedCategory] =
    useState<CommunityCategory>("전체");
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [postCategory, setPostCategory] =
    useState<WritableCommunityCategory>("잡담");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [pendingGuestIdentityAction, setPendingGuestIdentityAction] =
    useState<PendingGuestIdentityAction>(null);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "전체") return posts;

    return posts.filter(
      (post) => parseCommunityPost(post).category === selectedCategory
    );
  }, [posts, selectedCategory]);

  const popularPosts = useMemo(() => {
    return [...posts].sort((a, b) => b.replyCount - a.replyCount).slice(0, 4);
  }, [posts]);

  const recentReplies = useMemo(() => {
    return Object.values(repliesByPost)
      .flat()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);
  }, [repliesByPost]);

  const handleCreatePost = () => {
    const body = serializeCommunityPost({
      category: postCategory,
      title: postTitle,
      content: postContent,
    });

    void runWithGuestIdentityConfirm("글을 작성", (identity) =>
      createPost(body, identity)
    ).then((completed) => {
      if (!completed) return;
      setPostTitle("");
      setPostContent("");
      setIsWriteOpen(false);
    });
  };

  const runWithGuestIdentityConfirm = (
    actionLabel: string,
    run: (identity: CommunityGuestIdentity) => Promise<void>
  ) => {
    const currentIdentity = { guestNickname, guestPassword };

    if (isCommunityGuestIdentityConfirmDismissed()) {
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
    <div className="min-h-screen bg-white text-[#0f1419]">
      <CommonProductHeader activeService="community" />

      <main className="mx-auto grid max-w-[1180px] gap-0 px-0 md:grid-cols-[minmax(0,_760px)_320px] md:gap-6 md:px-6">
        <section className="min-w-0 border-x border-[#eff3f4]">
          <div className="sticky top-0 z-10 border-b border-[#eff3f4] bg-white/90 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-[20px] font-black tracking-[-0.03em] text-[#0f1419]">
                  YEON 커뮤니티
                </h1>
                <p className="mt-0.5 text-[12px] font-semibold text-[#536471]">
                  피드는 피드답게, 채팅은 채팅답게 흐르는 실시간 광장
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWriteOpen((value) => !value)}
                className="rounded-full bg-[#0f1419] px-5 py-2 text-[14px] font-black text-white transition-colors hover:bg-[#272c30]"
              >
                글쓰기
              </button>
            </div>
            <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
              {COMMUNITY_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={[
                    "shrink-0 rounded-full px-4 py-2 text-[13px] font-black transition-colors",
                    selectedCategory === category
                      ? "bg-[#0f1419] text-white"
                      : "text-[#536471] hover:bg-[#eff3f4] hover:text-[#0f1419]",
                  ].join(" ")}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-[#eff3f4] bg-white" aria-label="실시간 채팅">
            <CommunityChatWidget variant="feed" />
          </div>

          {isWriteOpen ? (
            <WritePostPanel
              category={postCategory}
              title={postTitle}
              content={postContent}
              isCreatingPost={isCreatingPost}
              guestNickname={guestNickname}
              onChangeCategory={setPostCategory}
              onChangeTitle={setPostTitle}
              onChangeContent={setPostContent}
              onCancel={() => setIsWriteOpen(false)}
              onSubmit={handleCreatePost}
            />
          ) : null}

          {postsError ? (
            <p className="border-b border-[#eff3f4] px-4 py-3 text-[13px] font-semibold text-red-600">
              {postsError}
            </p>
          ) : null}

          {isPostsLoading ? (
            <p className="border-b border-[#eff3f4] px-4 py-6 text-center text-[14px] font-semibold text-[#536471]">
              글 목록을 불러오는 중...
            </p>
          ) : null}

          <div>
            {filteredPosts.map((post) => (
              <FeedPostItem
                key={post.id}
                post={post}
                expanded={!!expandedReplies[post.id]}
                replies={repliesByPost[post.id] ?? []}
                isRepliesLoading={!!isRepliesLoading[post.id]}
                replyError={replyErrors[post.id] ?? null}
                replyDraft={replyDrafts[post.id] ?? ""}
                isSubmittingReply={!!isSubmittingReply[post.id]}
                postError={postErrors[post.id] ?? null}
                isUpdatingPost={!!isUpdatingPost[post.id]}
                isDeletingPost={!!isDeletingPost[post.id]}
                isDeletingReply={isDeletingReply}
                replyDeleteErrors={replyDeleteErrors}
                onToggleReplies={() => {
                  toggleReplies(post.id);
                }}
                onChangeReplyDraft={(postId, value) => {
                  setReplyDraft(postId, value);
                }}
                onSubmitReply={async (postId) => {
                  await runWithGuestIdentityConfirm(
                    "댓글을 작성",
                    (identity) => submitReply(postId, identity)
                  );
                }}
                onUpdatePost={async (postId, body) => {
                  return runWithGuestIdentityConfirm(
                    "글을 수정",
                    (identity) => updatePost(postId, body, identity)
                  );
                }}
                onDeletePost={async (postId) => {
                  return runWithGuestIdentityConfirm(
                    "글을 삭제",
                    (identity) => deletePost(postId, identity)
                  );
                }}
                onDeleteReply={async (postId, replyId) => {
                  return runWithGuestIdentityConfirm(
                    "댓글을 삭제",
                    (identity) => deleteReply(postId, replyId, identity)
                  );
                }}
              />
            ))}
          </div>
        </section>

        <aside className="hidden space-y-4 py-4 md:block">
          <SidebarPanel title="작성자 정보">
            <p className="text-[13px] leading-[1.6] text-[#536471]">
              비회원 글 작성/수정/삭제와 댓글 작성/삭제에 사용됩니다.
            </p>
            <FeedGuestIdentityForm
              className="mt-4"
              guestNickname={guestNickname}
              guestPassword={guestPassword}
              onChangeNickname={setGuestNickname}
              onChangePassword={setGuestPassword}
            />
          </SidebarPanel>

          <SidebarPanel title="지금 뜨는 글">
            {popularPosts.length ? (
              <ol className="divide-y divide-[#e6ecf0] text-[13px] text-[#536471]">
                {popularPosts.map((post, index) => {
                  const parsedPost = parseCommunityPost(post);
                  return (
                    <li key={post.id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-[12px] font-semibold text-[#536471]">
                        {index + 1} · 댓글 {post.replyCount}
                      </p>
                      <p className="mt-1 line-clamp-2 font-black leading-[1.35] text-[#0f1419]">
                        {parsedPost.title}
                      </p>
                    </li>
                  );
                })}
              </ol>
            ) : null}
          </SidebarPanel>

          <SidebarPanel title="최근 댓글">
            {recentReplies.length ? (
              <ul className="divide-y divide-[#e6ecf0] text-[13px] text-[#536471]">
                {recentReplies.map((reply) => (
                  <li key={reply.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="line-clamp-2 font-semibold leading-[1.4] text-[#0f1419]">
                      {reply.body}
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-[#536471]">
                      {formatRelativeTime(reply.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </SidebarPanel>
        </aside>
      </main>

      <CommunityGuestIdentityConfirmModal
        isOpen={pendingGuestIdentityAction !== null}
        actionLabel={pendingGuestIdentityAction?.actionLabel ?? "수정/삭제"}
        guestNickname={guestNickname}
        guestPassword={guestPassword}
        onClose={() => {
          pendingGuestIdentityAction?.resolve(false);
          setPendingGuestIdentityAction(null);
        }}
        onConfirm={(identity, options) => {
          setGuestNickname(identity.guestNickname);
          setGuestPassword(identity.guestPassword);

          const pending = pendingGuestIdentityAction;
          setPendingGuestIdentityAction(null);
          void pending
            ?.run(identity)
            .then(() => {
              if (options.dismiss) {
                persistCommunityGuestIdentityConfirmDismissed();
              }
              pending.resolve(true);
            })
            .catch(() => pending.resolve(false));
        }}
      />
    </div>
  );
}
