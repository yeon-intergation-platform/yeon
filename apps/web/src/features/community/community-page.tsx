"use client";

import { useMemo, useState } from "react";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import {
  CommunityGuestIdentityConfirmModal,
  isCommunityGuestIdentityConfirmDismissed,
  persistCommunityGuestIdentityConfirmDismissed,
  type CommunityGuestIdentity,
} from "./components/community-guest-identity-confirm-modal";
import { CommunityChatWidget } from "./components/community-chat-widget";
import {
  FeedGuestIdentityRow,
  FeedPostItem,
  WritePostPanel,
} from "./components/community-feed-components";
import { useCommunityFeed } from "./hooks/use-community-feed";
import {
  COMMUNITY_CATEGORIES,
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
            <CommunityChatWidget variant="feed" guestNickname={guestNickname} />
          </div>

          <div className="space-y-4 border-b border-[#e5e7eb] px-5 pb-4 pt-5 sm:px-6">
            <h2 className="text-[16px] font-black tracking-[-0.02em] text-[#111827]">
              게시판
            </h2>
            <div className="relative">
              <div
                className="flex gap-2 overflow-x-auto scroll-pr-6 pb-1 pr-6"
                role="group"
                aria-label="게시글 분류 필터"
              >
                {COMMUNITY_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    aria-pressed={selectedCategory === category}
                    className={[
                      "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-bold transition-colors",
                      selectedCategory === category
                        ? "border-[#111827] bg-[#111827] text-white"
                        : "border-[#e5e7eb] bg-white text-[#4b5563] hover:border-[#111827] hover:text-[#111827]",
                    ].join(" ")}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent"
              />
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
