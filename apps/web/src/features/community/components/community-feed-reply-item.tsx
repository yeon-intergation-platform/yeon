"use client";

import { type ChatServiceFeedPost } from "../chat-service-api";
import { formatCommunityRelativeTime } from "./community-feed-meta";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

export function FeedReplyItem(props: {
  reply: ChatServiceFeedPost;
  isDeleting: boolean;
  deleteError: string | null;
  onDelete: () => void;
}) {
  const { reply, isDeleting, deleteError, onDelete } = props;

  return (
    <div className="rounded-2xl bg-[#f9fafb] px-4 py-3">
      <div
        className={`flex flex-wrap items-center gap-2 ${SHARED_FEATURE_CLASS.text13Secondary}`}
      >
        <span className="font-bold text-[#111827]">
          {reply.author.nickname}
        </span>
        <span aria-hidden="true">·</span>
        <time dateTime={reply.createdAt}>
          {formatCommunityRelativeTime(reply.createdAt)}
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
