"use client";

import type { WritableCommunityCategory } from "../community-post-format";

function getCategoryBadgeClassName(category: WritableCommunityCategory) {
  switch (category) {
    case "타자친구 모집":
      return "inline-flex items-center rounded-full bg-[#e7f7ef] px-2.5 py-1 text-[12px] font-bold text-[#00875a]";
    case "카드친구 모집":
      return "inline-flex items-center rounded-full bg-[#f1f1f1] px-2.5 py-1 text-[12px] font-bold text-[#555]";
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

export function formatCommunityRelativeTime(isoDate: string) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
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
    <span className={getCategoryBadgeClassName(category)}>{category}</span>
  );
}
