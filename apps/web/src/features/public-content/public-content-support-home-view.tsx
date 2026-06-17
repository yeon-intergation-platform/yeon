import type {
  PublicContentSupportHomeProblemEntry,
  PublicContentSupportHomeServiceEntry,
} from "./public-content-support-home";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

function getArticleSlug(entry: PublicContentSupportHomeProblemEntry) {
  return entry.article.slugSegments.join("/");
}

export function PublicContentSupportHomeProblemEntries({
  entries,
}: {
  entries: readonly PublicContentSupportHomeProblemEntry[];
}) {
  if (entries.length === 0) return null;

  return (
    <section
      aria-labelledby="support-problem-entry-title"
      className="mx-auto max-w-6xl px-6 pb-8 md:px-8"
    >
      <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4 md:p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#777]">빠른 해결</p>
            <h2
              id="support-problem-entry-title"
              className="mt-1 text-[22px] font-semibold text-[#111]"
            >
              자주 찾는 문제로 바로 이동
            </h2>
          </div>
          <p className="text-[13px] text-[#666]">{entries.length}개 경로</p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <PublicContentTrackedLink
              key={getArticleSlug(entry)}
              href={entry.href}
              className="min-h-[152px] rounded-lg border border-[#e5e5e5] bg-white p-4 text-left no-underline transition-colors hover:border-[#111]"
              trackingParams={{
                category: entry.article.category,
                channel: entry.article.channel,
                link_kind: "support_problem_entry",
                service: entry.article.service,
                slug: getArticleSlug(entry),
                target_title: entry.article.title,
              }}
            >
              <span className="block text-[12px] font-semibold text-[#777]">
                {entry.serviceLabel} / {entry.categoryLabel}
              </span>
              <span className="mt-3 block text-[17px] font-semibold leading-6 text-[#111]">
                {entry.prompt}
              </span>
              <span className="mt-3 block text-[13px] leading-5 text-[#666]">
                {entry.article.summary}
              </span>
            </PublicContentTrackedLink>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PublicContentSupportHomeServiceEntries({
  entries,
}: {
  entries: readonly PublicContentSupportHomeServiceEntry[];
}) {
  if (entries.length === 0) return null;

  return (
    <section
      aria-labelledby="support-service-entry-title"
      className="mx-auto max-w-6xl px-6 pb-8 md:px-8"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#777]">서비스</p>
          <h2
            id="support-service-entry-title"
            className="mt-1 text-[22px] font-semibold text-[#111]"
          >
            서비스별 도움말
          </h2>
        </div>
        <p className="text-[13px] text-[#666]">{entries.length}개 서비스</p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <PublicContentTrackedLink
            key={entry.service}
            href={entry.href}
            className="min-h-[136px] rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4 no-underline transition-colors hover:border-[#111] hover:bg-white"
            trackingParams={{
              channel: "support",
              link_kind: "service_nav",
              service: entry.service,
              target_title: entry.label,
            }}
          >
            <span className="block text-[17px] font-semibold text-[#111]">
              {entry.label}
            </span>
            <span className="mt-3 block text-[13px] leading-5 text-[#666]">
              {entry.description}
            </span>
            <span className="mt-4 block text-[12px] font-semibold text-[#777]">
              {entry.articleCount}개 글
            </span>
          </PublicContentTrackedLink>
        ))}
      </div>
    </section>
  );
}
