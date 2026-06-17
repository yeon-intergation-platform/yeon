import type {
  PublicContentArticle,
  PublicContentChannel,
} from "./public-content-data";
import type { PublicContentBreadcrumbItem } from "./public-content-breadcrumb";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

export function PublicContentBreadcrumb({
  category,
  channel,
  items,
  service,
  sourceTitle,
}: {
  category?: string;
  channel: PublicContentChannel;
  items: readonly PublicContentBreadcrumbItem[];
  service?: PublicContentArticle["service"];
  sourceTitle?: string;
}) {
  return (
    <nav
      aria-label="공개 콘텐츠 경로"
      className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#666]"
    >
      {items.map((item, index) => (
        <span key={`${item.href}-${item.label}`} className="contents">
          {index > 0 ? <span aria-hidden="true">/</span> : null}
          {item.current ? (
            <span aria-current="page" className="text-[#555]">
              {item.label}
            </span>
          ) : (
            <PublicContentTrackedLink
              href={item.href}
              className="text-[#666] no-underline hover:text-[#111]"
              trackingParams={{
                category,
                channel,
                link_kind: "breadcrumb",
                service,
                slug: item.slugSegments.join("/") || undefined,
                source_title: sourceTitle,
                target_title: item.label,
              }}
            >
              {item.label}
            </PublicContentTrackedLink>
          )}
        </span>
      ))}
    </nav>
  );
}
