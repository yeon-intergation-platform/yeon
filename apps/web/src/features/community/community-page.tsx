"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { CommonProductHeader } from "@/components/product-shell/product-header";
import { type ChatServiceFeedPost } from "./chat-service-api";
import { CommunityChatWidget } from "./components/community-chat-widget";
import { useCommunityFeed } from "./hooks/use-community-feed";

const COMMUNITY_CATEGORIES = [
  "전체",
  "잡담",
  "타자친구 모집",
  "카드친구 모집",
  "관리자에게 아무말/조언",
] as const;

type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];
type WritableCommunityCategory = Exclude<CommunityCategory, "전체">;

const WRITABLE_CATEGORIES = COMMUNITY_CATEGORIES.filter(
  (category): category is WritableCommunityCategory => category !== "전체"
);

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

function FeedGuestIdentityForm(props: {
  guestNickname: string;
  guestPassword: string;
  onChangeNickname: (value: string) => void;
  onChangePassword: (value: string) => void;
}) {
  const { guestNickname, guestPassword, onChangeNickname, onChangePassword } =
    props;

  return (
    <div className="grid gap-2 md:grid-cols-2">
      <label className="text-[12px] font-semibold text-[#555]">
        닉네임
        <input
          value={guestNickname}
          onChange={(event) => onChangeNickname(event.target.value)}
          placeholder="닉네임 입력"
          maxLength={40}
          className="mt-1 h-9 w-full rounded-xl border border-[#ddd] bg-white px-3 text-[13px] font-normal text-[#111] outline-none focus:border-[#111]"
        />
      </label>
      <label className="text-[12px] font-semibold text-[#555]">
        비밀번호
        <input
          value={guestPassword}
          onChange={(event) => onChangePassword(event.target.value)}
          placeholder="수정/삭제용 비밀번호"
          type="password"
          maxLength={128}
          className="mt-1 h-9 w-full rounded-xl border border-[#ddd] bg-white px-3 text-[13px] font-normal text-[#111] outline-none focus:border-[#111]"
        />
      </label>
    </div>
  );
}

function FeedPostActions(props: {
  post: ChatServiceFeedPost;
  isRepliesExpanded: boolean;
  isRepliesLoading: boolean;
  isUpdatingPost: boolean;
  isDeletingPost: boolean;
  onToggleReplies: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
}) {
  const {
    post,
    isRepliesExpanded,
    isRepliesLoading,
    isUpdatingPost,
    isDeletingPost,
    onToggleReplies,
    onStartEdit,
    onDelete,
  } = props;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onToggleReplies}
        className="text-[12px] font-semibold text-[#444] underline-offset-4 hover:underline"
        aria-expanded={isRepliesExpanded}
        aria-label="댓글 열기/닫기"
      >
        {isRepliesExpanded
          ? "댓글 닫기"
          : `댓글 ${post.replyCount}${isRepliesLoading ? " · 불러오는 중" : ""}`}
      </button>
      <button
        type="button"
        onClick={onStartEdit}
        disabled={isUpdatingPost || isDeletingPost}
        className="text-[12px] font-semibold text-[#555] underline-offset-4 hover:underline disabled:text-[#aaa]"
      >
        수정
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isUpdatingPost || isDeletingPost}
        className="text-[12px] font-semibold text-red-600 underline-offset-4 hover:underline disabled:text-[#aaa]"
      >
        {isDeletingPost ? "삭제 중" : "삭제"}
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
      className="space-y-2"
    >
      <textarea
        value={draft}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        maxLength={400}
        className="w-full rounded-xl border border-[#ddd] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#111]"
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-[#777]">{draft.length}/400</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#ddd] px-3 py-2 text-[12px] font-semibold text-[#333]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !draft.trim()}
            className="rounded-xl bg-[#111] px-3 py-2 text-[12px] font-semibold text-white disabled:bg-[#d0d0d0]"
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
      className="mt-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_64px]">
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
          className="min-h-[66px] w-full resize-y rounded-xl border border-[#ddd] px-3 py-2 text-[13px] outline-none focus:border-[#111]"
        />
        <button
          type="submit"
          className="h-[40px] rounded-xl bg-[#111] px-4 text-[12px] font-semibold text-white disabled:bg-[#d0d0d0]"
          disabled={isSubmitting || !replyDraft.trim()}
        >
          {isSubmitting ? "등록 중" : "등록"}
        </button>
      </div>
    </form>
  );
}

function CategoryBadge({ category }: { category: WritableCommunityCategory }) {
  return (
    <span className="rounded-full border border-[#e5e5e5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#555]">
      {category}
    </span>
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
  onUpdatePost: (postId: string, body: string) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onDeleteReply: (postId: string, replyId: string) => Promise<void>;
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
    <article className="rounded-2xl border border-[#e7e7e7] bg-white p-4 transition-colors hover:border-[#cfcfcf]">
      {isEditing ? (
        <FeedPostEditForm
          draft={editDraft}
          isSubmitting={isUpdatingPost}
          onChange={setEditDraft}
          onCancel={() => setIsEditing(false)}
          onSubmit={async () => {
            await onUpdatePost(post.id, editDraft);
            setIsEditing(false);
          }}
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/community/posts/${post.id}`}
              className="min-w-0 text-[16px] font-black tracking-[-0.02em] text-[#111] no-underline hover:underline"
            >
              {parsedPost.title}
            </Link>
            <CategoryBadge category={parsedPost.category} />
          </div>
          <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-[13px] leading-[1.6] text-[#555]">
            {parsedPost.content}
          </p>
          <p className="mt-3 text-[11px] leading-[1.4] text-[#777]">
            {post.author.nickname} · {formatRelativeTime(post.createdAt)} · 댓글{" "}
            {post.replyCount}
          </p>
        </>
      )}

      {postError ? (
        <p className="mt-2 text-[12px] text-red-600">{postError}</p>
      ) : null}

      <div className="mt-3">
        <FeedPostActions
          post={post}
          isRepliesExpanded={expanded}
          isRepliesLoading={isRepliesLoading}
          isUpdatingPost={isUpdatingPost}
          isDeletingPost={isDeletingPost}
          onToggleReplies={onToggleReplies}
          onStartEdit={() => setIsEditing(true)}
          onDelete={() => {
            void onDeletePost(post.id);
          }}
        />

        {replyError ? (
          <p className="mt-2 text-[12px] text-red-600">{replyError}</p>
        ) : null}

        {expanded ? (
          <div className="mt-3 space-y-3 border-t border-[#f0f0f0] pt-3">
            {isRepliesLoading ? (
              <p className="text-[12px] text-[#777]">댓글을 불러오는 중...</p>
            ) : null}

            {replies.length ? (
              <div className="space-y-2">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="rounded-xl border border-[#ededed] bg-[#fafafa] p-3"
                  >
                    <p className="text-[12px] font-semibold text-[#555]">
                      {reply.author.nickname}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-[13px] leading-[1.6] text-[#111]">
                      {reply.body}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#777]">
                      <p>{formatRelativeTime(reply.createdAt)}</p>
                      <button
                        type="button"
                        onClick={() => {
                          void onDeleteReply(post.id, reply.id);
                        }}
                        disabled={!!isDeletingReply[reply.id]}
                        className="font-semibold text-red-600 underline-offset-4 hover:underline disabled:text-[#aaa]"
                      >
                        {isDeletingReply[reply.id] ? "삭제 중" : "삭제"}
                      </button>
                    </div>
                    {replyDeleteErrors[reply.id] ? (
                      <p className="mt-1 text-[12px] text-red-600">
                        {replyDeleteErrors[reply.id]}
                      </p>
                    ) : null}
                  </div>
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
      className="rounded-2xl border border-[#e7e7e7] bg-[#fafafa] p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-black tracking-[-0.02em] text-[#111]">
          글쓰기
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#ddd] bg-white px-3 py-2 text-[12px] font-semibold text-[#333]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isCreatingPost || !title.trim() || !content.trim()}
            className="rounded-xl bg-[#111] px-3 py-2 text-[12px] font-semibold text-white disabled:bg-[#d0d0d0]"
          >
            {isCreatingPost ? "등록 중" : "등록"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="text-[12px] font-semibold text-[#555]">
          카테고리
          <select
            value={category}
            onChange={(event) =>
              onChangeCategory(event.target.value as WritableCommunityCategory)
            }
            className="mt-1 h-9 w-full rounded-xl border border-[#ddd] bg-white px-3 text-[13px] font-normal text-[#111] outline-none focus:border-[#111]"
          >
            {WRITABLE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[12px] font-semibold text-[#555]">
          제목
          <input
            value={title}
            onChange={(event) => onChangeTitle(event.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={80}
            className="mt-1 h-9 w-full rounded-xl border border-[#ddd] bg-white px-3 text-[13px] font-normal text-[#111] outline-none focus:border-[#111]"
          />
        </label>
        <label className="text-[12px] font-semibold text-[#555]">
          내용
          <textarea
            value={content}
            onChange={(event) => onChangeContent(event.target.value)}
            placeholder="내용을 입력하세요"
            rows={4}
            maxLength={280}
            className="mt-1 w-full resize-y rounded-xl border border-[#ddd] bg-white px-3 py-2 text-[13px] font-normal text-[#111] outline-none focus:border-[#111]"
          />
        </label>
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
    <section className="rounded-2xl border border-[#e7e7e7] bg-white p-4">
      <h2 className="text-[15px] font-black tracking-[-0.02em] text-[#111]">
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

    void createPost(body).then(() => {
      setPostTitle("");
      setPostContent("");
      setIsWriteOpen(false);
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <CommonProductHeader activeService="community" />

      <main className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-4 md:px-8 md:py-5">
        <section
          className="mx-auto w-full max-w-[680px]"
          aria-label="실시간 채팅"
        >
          <CommunityChatWidget variant="feed" />
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,_1fr)_280px]">
          <div className="min-h-0 space-y-3 rounded-2xl border border-[#e7e7e7] bg-[#fff] p-4">
            <div className="flex flex-col gap-3 border-b border-[#f0f0f0] pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {COMMUNITY_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={[
                        "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                        selectedCategory === category
                          ? "border-[#111] bg-[#111] text-white"
                          : "border-[#e5e5e5] bg-white text-[#555] hover:border-[#aaa]",
                      ].join(" ")}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIsWriteOpen((value) => !value)}
                  className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#333]"
                >
                  글쓰기
                </button>
              </div>

              <FeedGuestIdentityForm
                guestNickname={guestNickname}
                guestPassword={guestPassword}
                onChangeNickname={setGuestNickname}
                onChangePassword={setGuestPassword}
              />
            </div>

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

            {postsError ? (
              <p className="text-[12px] text-red-600">{postsError}</p>
            ) : null}

            {isPostsLoading ? (
              <p className="text-[12px] text-[#777]">
                글 목록을 불러오는 중...
              </p>
            ) : null}

            <div className="space-y-3">
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
                    await submitReply(postId);
                  }}
                  onUpdatePost={async (postId, body) => {
                    await updatePost(postId, body);
                  }}
                  onDeletePost={async (postId) => {
                    await deletePost(postId);
                  }}
                  onDeleteReply={async (postId, replyId) => {
                    await deleteReply(postId, replyId);
                  }}
                />
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <SidebarPanel title="인기 글">
              {popularPosts.length ? (
                <ol className="space-y-2 text-[12px] text-[#555]">
                  {popularPosts.map((post, index) => {
                    const parsedPost = parseCommunityPost(post);
                    return (
                      <li
                        key={post.id}
                        className="grid grid-cols-[18px_minmax(0,1fr)_auto] gap-2"
                      >
                        <span className="font-mono text-[#999]">
                          {index + 1}
                        </span>
                        <span className="truncate font-semibold text-[#333]">
                          {parsedPost.title}
                        </span>
                        <span className="text-[#999]">
                          댓글 {post.replyCount}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              ) : null}
            </SidebarPanel>

            <SidebarPanel title="최근 댓글">
              {recentReplies.length ? (
                <ul className="space-y-2 text-[12px] text-[#555]">
                  {recentReplies.map((reply) => (
                    <li
                      key={reply.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"
                    >
                      <span className="truncate font-semibold text-[#333]">
                        {reply.body}
                      </span>
                      <span className="text-[#999]">
                        {formatRelativeTime(reply.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </SidebarPanel>
          </aside>
        </section>
      </main>
    </div>
  );
}
