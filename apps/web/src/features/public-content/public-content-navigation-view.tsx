import type { PublicContentChannel } from "./public-content-data";
import type { PublicContentNavigationItem } from "./public-content-navigation";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

type PublicContentNavigationProps = {
  ariaLabel: string;
  channel: PublicContentChannel;
  items: readonly PublicContentNavigationItem[];
  linkKind: "category_nav" | "service_nav";
  title: string;
};

function PublicContentNavigation({
  ariaLabel,
  channel,
  items,
  linkKind,
  title,
}: PublicContentNavigationProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label={ariaLabel}
      className="rounded-lg border border-[#e5e5e5] bg-white p-4"
    >
      <p className="text-[12px] font-semibold text-[#555]">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <PublicContentTrackedLink
            key={item.key}
            href={item.href}
            className={`rounded-lg border px-3 py-2 text-[13px] font-semibold no-underline transition-colors ${
              item.active
                ? "border-[#111] bg-[#111] text-white"
                : "border-[#e5e5e5] bg-[#fafafa] text-[#666] hover:border-[#111] hover:bg-white hover:text-[#111]"
            }`}
            trackingParams={{
              channel,
              link_kind: linkKind,
              slug: item.slugSegments.join("/"),
              target_title: item.label,
            }}
          >
            <span>{item.label}</span>
            <span className="ml-2 text-[12px] opacity-70">{item.count}</span>
          </PublicContentTrackedLink>
        ))}
      </div>
    </nav>
  );
}

export function PublicContentServiceNav({
  channel,
  items,
}: {
  channel: PublicContentChannel;
  items: readonly PublicContentNavigationItem[];
}) {
  return (
    <PublicContentNavigation
      ariaLabel="서비스별 공개 콘텐츠"
      channel={channel}
      items={items}
      linkKind="service_nav"
      title="서비스"
    />
  );
}

export function PublicContentCategoryNav({
  channel,
  items,
}: {
  channel: PublicContentChannel;
  items: readonly PublicContentNavigationItem[];
}) {
  return (
    <PublicContentNavigation
      ariaLabel="분류별 공개 콘텐츠"
      channel={channel}
      items={items}
      linkKind="category_nav"
      title="분류"
    />
  );
}

export function PublicContentTopicNav({
  channel,
  items,
}: {
  channel: PublicContentChannel;
  items: readonly PublicContentNavigationItem[];
}) {
  return (
    <PublicContentNavigation
      ariaLabel="주제별 공개 콘텐츠"
      channel={channel}
      items={items}
      linkKind="category_nav"
      title="주제"
    />
  );
}
