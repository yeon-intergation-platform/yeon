"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import {
  buildPublicContentBlogCategoryFilterHref,
  type PublicContentBlogCategory,
} from "./public-content-blog-home";

type PublicContentBlogCategoryFilterButtonProps = {
  category?: PublicContentBlogCategory;
  count: number;
  isActive: boolean;
  label: string;
};

export function PublicContentBlogCategoryFilterButton({
  category,
  count,
  isActive,
  label,
}: PublicContentBlogCategoryFilterButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    if (isActive) return;

    const href = buildPublicContentBlogCategoryFilterHref({
      category,
      pathname,
      searchParams: searchParams.toString(),
    });

    trackEvent(analyticsEvents.publicContentLinkClick, {
      category,
      channel: "blog",
      link_kind: "category_nav",
      target_title: label,
      target_url: href,
    });
    router.replace(href, { scroll: false });
  };

  return (
    <button
      type="button"
      aria-pressed={isActive}
      className={`inline-flex h-10 items-center border px-4 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] ${
        isActive
          ? "border-[#111] bg-[#111] text-white"
          : "border-[#e5e5e5] bg-white text-[#666] hover:border-[#111] hover:text-[#111]"
      }`}
      onClick={handleClick}
    >
      {label} {count}
    </button>
  );
}
