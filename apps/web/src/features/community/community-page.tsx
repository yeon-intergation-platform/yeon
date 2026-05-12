"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";

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
import {
  COMMUNITY_CATEGORIES,
  WRITABLE_CATEGORIES,
  parseCommunityPost,
  serializeCommunityPost,
  type CommunityCategory,
  type WritableCommunityCategory,
} from "./community-post-format";

type PendingGuestIdentityAction = {
  actionLabel: string;
  run: (identity: CommunityGuestIdentity) => Promise<void>;
  resolve: (completed: boolean) => void;
} | null;

function getCategoryBadgeClassName(category: WritableCommunityCategory) {
  switch (category) {
    case "타자친구 모집":
      return "inline-flex items-center rounded-full bg-[#e7f7ef] px-2.5 py-1 text-[12px] font-bold text-[#00875a]";
    case "카드친구 모집":
      return "inline-flex items-center rounded-full bg-[#fff4d6] px-2.5 py-1 text-[12px] font-bold text-[#8a5a00]";
    case "관리자에게 아무말/조언":
      return "inline-flex items-center rounded-full bg-[#f1e8ff] px-2.5 py-1 text-[12px] font-bold text-[#6d28d9]";
    case "잡담":
    default:
      return "inline-flex items-center rounded-full bg-[#e8f5fd] px-2.5 py-1 text-[12px] font-bold text-[#1d4ed8]";
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

function CategoryBadge({ category }: { category: WritableCommunityCategory }) {
  return (
    <span className={getCategoryBadgeClassName(category)}>{category}</span>
  );
}

function FeedGuestIdentityRow(props: {
  guestNickname: string;
  guestPassword: string;
  isWriteOpen: boolean;
  onChangeNickname: (value: string) => void;
  onChangePassword: (value: string) => void;
  onToggleWrite: () => void;
}) {
  const {
    guestNickname,
    guestPassword,
    isWriteOpen,
    onChangeNickname,
    onChangePassword,
    onToggleWrite,
  } = props;

  return (
    <div className="grid gap-2 rounded-2xl border border-[#e5e7eb] bg-white p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_104px] sm:items-end">
      <label className="text-[12px] font-semibold text-[#4b5563]">
        닉네임
        <input
          value={guestNickname}
          onChange={(event) => onChangeNickname(event.target.value)}
          placeholder="닉네임 입력"
          maxLength={40}
          className="mt-1 h-10 w-full rounded-xl border border-[#d1d5db] bg-white px-3 text-[14px] font-normal text-[#111827] outline-none transition-colors focus:border-[#111827]"
        />
      </label>
      <label className="text-[12px] font-semibold text-[#4b5563]">
        비밀번호
        <input
          value={guestPassword}
          onChange={(event) => onChangePassword(event.target.value)}
          placeholder="수정/삭제용 비밀번호"
          type="password"
          maxLength={128}
          className="mt-1 h-10 w-full rounded-xl border border-[#d1d5db] bg-white px-3 text-[14px] font-normal text-[#111827] outline-none transition-colors focus:border-[#111827]"
        />
      </label>
      <button
        type="button"
        onClick={onToggleWrite}
        className="h-10 rounded-xl bg-[#111827] px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#374151]"
        aria-expanded={isWriteOpen}
      >
        글쓰기
      </button>
    </div>
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
      className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-3"
    >
      <textarea
        value={draft}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        maxLength={400}
        className="w-full resize-y rounded-xl border border-[#d1d5db] bg-white px-3 py-3 text-[15px] leading-[1.55] text-[#111827] outline-none transition-colors focus:border-[#111827]"
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[12px] text-[#6b7280]">{draft.length}/400</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#d1d5db] px-4 py-2 text-[13px] font-bold text-[#111827] transition-colors hover:bg-white"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !draft.trim()}
            className="rounded-xl bg-[#111827] px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#374151] disabled:bg-[#d1d5db]"
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
      className="mt-4 rounded-2xl border border-[#e5e7eb] bg-white p-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
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
        className="min-h-[58px] w-full resize-y border-0 bg-transparent text-[15px] leading-[1.5] text-[#111827] outline-none placeholder:text-[#9ca3af]"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          className="h-9 rounded-xl bg-[#111827] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#374151] disabled:bg-[#d1d5db]"
          disabled={isSubmitting || !replyDraft.trim()}
        >
          {isSubmitting ? "게시 중" : "댓글"}
        </button>
      </div>
    </form>
  );
}

function FeedReplyItem(props: {
  reply: ChatServiceFeedPost;
  isDeleting: boolean;
  deleteError: string | null;
  onDelete: () => void;
}) {
  const { reply, isDeleting, deleteError, onDelete } = props;

  return (
    <div className="rounded-2xl bg-[#f9fafb] px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#6b7280]">
        <span className="font-bold text-[#111827]">
          {reply.author.nickname}
        </span>
        <span aria-hidden="true">·</span>
        <time dateTime={reply.createdAt}>
          {formatRelativeTime(reply.createdAt)}
        </time>
      </div>
      <p className="mt-1 whitespace-pre-wrap text-[14px] leading-[1.55] text-[#111827]">
        {reply.body}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-lg px-2 py-1 text-[12px] font-bold text-red-600 transition-colors hover:bg-red-50 disabled:text-[#9ca3af]"
        >
          {isDeleting ? "삭제 중" : "삭제"}
        </button>
      </div>
      {deleteError ? (
        <p className="mt-1 text-[12px] text-red-600">{deleteError}</p>
      ) : null}
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
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#6b7280]">
            <span className="font-bold text-[#111827]">
              {post.author.nickname}
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.createdAt}>
              {formatRelativeTime(post.createdAt)}
            </time>
            <CategoryBadge category={parsedPost.category} />
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
            <p className="text-[13px] text-[#6b7280]">댓글을 불러오는 중...</p>
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

function WritePostPanel(props: {
  category: WritableCommunityCategory;
  title: string;
  content: string;
  isCreatingPost: boolean;
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
      className="mt-3 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={category}
          onChange={(event) =>
            onChangeCategory(event.target.value as WritableCommunityCategory)
          }
          className="h-10 rounded-xl border border-[#d1d5db] bg-white px-3 text-[13px] font-bold text-[#111827] outline-none transition-colors focus:border-[#111827]"
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
            className="rounded-xl border border-[#d1d5db] bg-white px-4 py-2 text-[13px] font-bold text-[#111827] transition-colors hover:bg-[#f3f4f6]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isCreatingPost || !title.trim() || !content.trim()}
            className="rounded-xl bg-[#111827] px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#374151] disabled:bg-[#d1d5db]"
          >
            {isCreatingPost ? "게시 중" : "게시"}
          </button>
        </div>
      </div>
      <input
        value={title}
        onChange={(event) => onChangeTitle(event.target.value)}
        placeholder="제목을 입력하세요"
        maxLength={80}
        className="mt-4 h-11 w-full rounded-xl border border-[#d1d5db] bg-white px-3 text-[15px] font-semibold text-[#111827] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-[#111827]"
      />
      <textarea
        value={content}
        onChange={(event) => onChangeContent(event.target.value)}
        placeholder="내용을 입력하세요"
        rows={4}
        maxLength={280}
        className="mt-2 w-full resize-y rounded-xl border border-[#d1d5db] bg-white px-3 py-3 text-[15px] leading-[1.55] text-[#111827] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-[#111827]"
      />
      <div className="mt-2 text-right text-[12px] font-semibold text-[#6b7280]">
        {title.length + content.length}/360
      </div>
    </form>
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
  const hasFilteredPosts = filteredPosts.length > 0;

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
    <div className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <CommonProductHeader activeService="community" />

      <main className="mx-auto w-full max-w-[840px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
          <header className="border-b border-[#e5e7eb] px-5 py-4 sm:px-6">
            <h1 className="text-[24px] font-black tracking-[-0.035em] text-[#111827]">
              YEON 커뮤니티
            </h1>
          </header>

          <div className="border-b border-[#e5e7eb]" aria-label="실시간 채팅">
            <CommunityChatWidget variant="feed" />
          </div>

          <div className="space-y-4 border-b border-[#e5e7eb] px-5 py-4 sm:px-6">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {COMMUNITY_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={[
                    "shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold transition-colors",
                    selectedCategory === category
                      ? "border-[#111827] bg-[#111827] text-white"
                      : "border-[#e5e7eb] bg-white text-[#4b5563] hover:border-[#111827] hover:text-[#111827]",
                  ].join(" ")}
                >
                  {category}
                </button>
              ))}
            </div>

            <div>
              <FeedGuestIdentityRow
                guestNickname={guestNickname}
                guestPassword={guestPassword}
                isWriteOpen={isWriteOpen}
                onChangeNickname={setGuestNickname}
                onChangePassword={setGuestPassword}
                onToggleWrite={() => setIsWriteOpen((value) => !value)}
              />

              {isWriteOpen ? (
                <WritePostPanel
                  category={postCategory}
                  title={postTitle}
                  content={postContent}
                  isCreatingPost={isCreatingPost}
                  onChangeCategory={setPostCategory}
                  onChangeTitle={setPostTitle}
                  onChangeContent={setPostContent}
                  onCancel={() => setIsWriteOpen(false)}
                  onSubmit={handleCreatePost}
                />
              ) : null}
            </div>
          </div>

          {postsError ? (
            <p className="border-b border-[#e5e7eb] px-5 py-3 text-[13px] font-semibold text-red-600 sm:px-6">
              {postsError}
            </p>
          ) : null}

          {isPostsLoading ? (
            <p className="border-b border-[#e5e7eb] px-5 py-6 text-center text-[14px] font-semibold text-[#6b7280] sm:px-6">
              글 목록을 불러오는 중...
            </p>
          ) : null}

          <div className="space-y-4 px-5 py-5 sm:px-6">
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
                  await runWithGuestIdentityConfirm("댓글을 작성", (identity) =>
                    submitReply(postId, identity)
                  );
                }}
                onUpdatePost={async (postId, body) => {
                  return runWithGuestIdentityConfirm("글을 수정", (identity) =>
                    updatePost(postId, body, identity)
                  );
                }}
                onDeletePost={async (postId) => {
                  return runWithGuestIdentityConfirm("글을 삭제", (identity) =>
                    deletePost(postId, identity)
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

            {!isPostsLoading && !hasFilteredPosts ? (
              <p className="rounded-2xl border border-dashed border-[#d1d5db] px-4 py-8 text-center text-[14px] font-semibold text-[#6b7280]">
                아직 게시글이 없습니다. 첫 글을 남겨보세요.
              </p>
            ) : null}
          </div>
        </section>
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
