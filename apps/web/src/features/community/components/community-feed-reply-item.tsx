"use client";
import { type ChatServiceFeedPost } from "../chat-service-api";
import { formatCommunityRelativeTime } from "./community-feed-meta";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { YeonButton, YeonSurface, YeonText, YeonView } from "@yeon/ui";

export function FeedReplyItem(props: {
  reply: ChatServiceFeedPost;
  isDeleting: boolean;
  deleteError: string | null;
  onDelete: () => void;
}) {
  const { reply, isDeleting, deleteError, onDelete } = props;

  return (
    <YeonSurface variant="panel" className="px-4 py-3">
      <YeonView
        className={`flex flex-wrap items-center gap-2 ${SHARED_FEATURE_CLASS.text13Secondary}`}
      >
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="font-bold text-[#111]"
        >
          {reply.author.nickname}
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
          dateTime={reply.createdAt}
        >
          {formatCommunityRelativeTime(reply.createdAt)}
        </YeonText>
      </YeonView>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="mt-1 whitespace-pre-wrap text-[14px] leading-[1.55] text-[#111]"
      >
        {reply.body}
      </YeonText>
      <YeonView className="mt-2 flex items-center gap-2">
        <YeonButton
          type="button"
          size="sm"
          variant="ghost"
          onClick={onDelete}
          disabled={isDeleting}
          className="h-auto px-2 py-1 text-[12px] font-bold"
        >
          {isDeleting ? "삭제 중" : "삭제"}
        </YeonButton>
      </YeonView>
      {deleteError ? (
        <YeonText
          variant="caption"
          tone="danger"
          className="mt-1 font-semibold"
        >
          {deleteError}
        </YeonText>
      ) : null}
    </YeonSurface>
  );
}
