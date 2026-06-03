"use client";
import type { WritableCommunityCategory } from "../community-post-format";
import { YeonText } from "@yeon/ui";
import { getYeonNow } from "@yeon/ui/runtime/YeonBrowserRuntime";

function getCategoryBadgeClassName(category: WritableCommunityCategory) {
  switch (category) {
    case "타자친구 모집":
      return "inline-flex items-center rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1 text-[12px] font-bold text-[#111]";
    case "카드친구 모집":
      return "inline-flex items-center rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1 text-[12px] font-bold text-[#111]";
    case "관리자에게 아무말/조언":
      return "inline-flex items-center rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1 text-[12px] font-bold text-[#111]";
    case "잡담":
    default:
      return "inline-flex items-center rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1 text-[12px] font-bold text-[#111]";
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

export function formatCommunityRelativeTime(isoDate: string) {
  const diffMs = getYeonNow() - new Date(isoDate).getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  return formatKoreanDateTime(isoDate);
}

export function CommunityCategoryBadge({
  category,
}: {
  category: WritableCommunityCategory;
}) {
  return (
    <YeonText
      as="span"
      variant="unstyled"
      tone="inherit"
      className={getCategoryBadgeClassName(category)}
    >
      {category}
    </YeonText>
  );
}
