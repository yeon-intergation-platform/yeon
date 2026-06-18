"use client";

import { useYeonPathname } from "@yeon/ui/runtime/YeonNavigation";
import { resolveSectionBrandHref } from "@/lib/header-brand-nav";
import type { PublicContentChannel } from "./public-content-data";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

/**
 * 콘텐츠 헤더 좌상단 브랜드 링크.
 *
 * CommonProductHeader와 동일한 "한 단계 위" 원칙을 따른다:
 * 채널 하위(기사/모음) → 채널 홈, 채널 홈 → 플랫폼(yeon.world).
 * pathname이 필요하므로 server인 PublicContentShell에서 분리한 client 컴포넌트다.
 */
export function PublicContentBrandLink({
  channel,
  basePath,
  brandLabel,
  className,
}: {
  channel: PublicContentChannel;
  basePath: string;
  brandLabel: string;
  className?: string;
}) {
  const pathname = useYeonPathname();
  const href = resolveSectionBrandHref(basePath, pathname);

  return (
    <PublicContentTrackedLink
      href={href}
      className={className}
      trackingParams={{
        channel,
        link_kind: "channel_nav",
        target_title: brandLabel,
      }}
    >
      {brandLabel}
    </PublicContentTrackedLink>
  );
}
