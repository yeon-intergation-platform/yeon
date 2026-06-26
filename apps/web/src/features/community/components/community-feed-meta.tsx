"use client";
import type { WritableCommunityCategory } from "../community-post-format";
import { YeonText } from "@yeon/ui";
export { formatCommunityRelativeTime } from "../community-date-format";

const COMMUNITY_CATEGORY_BADGE_CLASS_NAME =
  "inline-flex items-center rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1 text-[12px] font-bold text-[#111]";

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
      className={COMMUNITY_CATEGORY_BADGE_CLASS_NAME}
    >
      {category}
    </YeonText>
  );
}
