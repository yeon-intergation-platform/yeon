"use client";

import type { AnchorHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { getPublicContentLinkRel } from "./public-content-link-policy";

type PublicContentLinkKind =
  | "article_card"
  | "article_cta"
  | "breadcrumb"
  | "category_nav"
  | "channel_nav"
  | "collection_child"
  | "not_found_home"
  | "service_nav";

type PublicContentTrackedLinkEvent = "cta" | "link";

type PublicContentTrackingParams = {
  category?: string;
  channel: string;
  link_kind: PublicContentLinkKind;
  service?: string;
  slug?: string;
  source_title?: string;
  target_title?: string;
};

type PublicContentTrackedLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "onClick"
> & {
  children: ReactNode;
  eventType?: PublicContentTrackedLinkEvent;
  href: string;
  trackingParams: PublicContentTrackingParams;
};

export function PublicContentTrackedLink({
  children,
  eventType = "link",
  href,
  rel,
  target,
  trackingParams,
  ...anchorProps
}: PublicContentTrackedLinkProps) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = () => {
    trackEvent(
      eventType === "cta"
        ? analyticsEvents.publicContentCtaClick
        : analyticsEvents.publicContentLinkClick,
      {
        ...trackingParams,
        target_url: href,
      }
    );
  };

  return (
    <a
      {...anchorProps}
      href={href}
      onClick={handleClick}
      rel={getPublicContentLinkRel({ href, rel, target })}
      target={target}
    >
      {children}
    </a>
  );
}
