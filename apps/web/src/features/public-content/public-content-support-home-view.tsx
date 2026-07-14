import type {
  PublicContentSupportHomeProblemEntry,
  PublicContentSupportHomeReportEntry,
  PublicContentSupportHomeServiceEntry,
} from "./public-content-support-home";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

const SUPPORT_HOME_QUICK_LINKS = [
  { href: "#support-search", label: "문제 검색" },
  { href: "#support-services", label: "서비스 선택" },
  { href: "#support-problems", label: "자주 찾는 문제" },
  { href: "#support-documents", label: "서비스별 문서" },
] as const;

export function PublicContentSupportHomeQuickLinks() {
  return (
    <nav
      aria-label="도움말 바로가기"
      className="mx-auto max-w-6xl overflow-x-auto px-6 pb-8 md:px-8"
    >
      <div className="flex min-w-max items-center gap-4 border-y border-[#e5e5e5] py-3 text-[13px]">
        <span className="font-semibold text-[#111]">바로가기</span>
        {SUPPORT_HOME_QUICK_LINKS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-[#666] no-underline transition-colors hover:text-[#111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

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
      id="support-problems"
      aria-labelledby="support-problem-entry-title"
      className="mx-auto max-w-6xl px-6 pb-8 md:px-8"
    >
      <div className="border-t border-[#e5e5e5] pt-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#555]">빠른 해결</p>
            <h2
              id="support-problem-entry-title"
              className="mt-1 text-[24px] font-semibold text-[#111]"
            >
              자주 찾는 문제
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[#666]">
              실제로 자주 겪는 상황부터 바로 해결 방법을 찾을 수 있어요.
            </p>
          </div>
          <p className="text-[13px] text-[#666]">{entries.length}개 문서</p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <PublicContentTrackedLink
              key={getArticleSlug(entry)}
              href={entry.href}
              className="group border border-[#e5e5e5] bg-[#fafafa] p-5 text-left no-underline transition-colors hover:border-[#111] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
              trackingParams={{
                category: entry.article.category,
                channel: entry.article.channel,
                link_kind: "support_problem_entry",
                service: entry.article.service,
                slug: getArticleSlug(entry),
                target_title: entry.article.title,
              }}
            >
              <span className="block text-[12px] font-semibold text-[#555]">
                {entry.serviceLabel} · {entry.categoryLabel}
              </span>
              <span className="mt-3 block text-[18px] font-semibold leading-7 text-[#111]">
                {entry.prompt}
              </span>
              <span className="mt-3 block text-[14px] leading-6 text-[#666]">
                {entry.article.summary}
              </span>
              <span className="mt-5 block text-[13px] font-semibold text-[#111]">
                해결 방법 보기 <span aria-hidden="true">→</span>
              </span>
            </PublicContentTrackedLink>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PublicContentSupportHomeReportCta({
  entry,
}: {
  entry: PublicContentSupportHomeReportEntry | null;
}) {
  if (!entry) return null;

  return (
    <section
      aria-labelledby="support-error-report-title"
      className="mx-auto max-w-6xl px-6 pb-16 md:px-8"
    >
      <div className="flex flex-col gap-5 border border-[#111] bg-[#111] p-5 text-white md:flex-row md:items-center md:justify-between md:p-6">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-white/70">
            그래도 해결되지 않았다면
          </p>
          <h2
            id="support-error-report-title"
            className="mt-1 text-[22px] font-semibold text-white"
          >
            원하는 답을 찾지 못하셨나요?
          </h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-white/75">
            {entry.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <PublicContentTrackedLink
            eventType="cta"
            href={entry.href}
            className="border border-white bg-white px-4 py-3 text-center text-[14px] font-semibold text-[#111] no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            trackingParams={{
              channel: "support",
              link_kind: "support_error_report",
              service: "account",
              target_title: entry.label,
            }}
          >
            {entry.label}
          </PublicContentTrackedLink>
          <PublicContentTrackedLink
            href={entry.articleHref}
            className="border border-white/30 px-4 py-3 text-center text-[14px] font-semibold text-white no-underline transition-colors hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            trackingParams={{
              channel: "support",
              link_kind: "support_error_report_guide",
              service: "account",
              target_title: entry.articleTitle,
            }}
          >
            신고 전에 볼 내용
          </PublicContentTrackedLink>
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
      id="support-services"
      aria-labelledby="support-service-entry-title"
      className="mx-auto max-w-6xl px-6 pb-8 md:px-8"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#555]">서비스 선택</p>
          <h2
            id="support-service-entry-title"
            className="mt-1 text-[24px] font-semibold text-[#111]"
          >
            어떤 서비스에서 문제가 생겼나요?
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[#666]">
            서비스를 먼저 고르면 필요한 문서만 모아서 볼 수 있어요.
          </p>
        </div>
        <p className="text-[13px] text-[#666]">{entries.length}개 서비스</p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <PublicContentTrackedLink
            key={entry.service}
            href={entry.href}
            className="group border border-[#e5e5e5] bg-[#fafafa] p-5 no-underline transition-colors hover:border-[#111] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
            trackingParams={{
              channel: "support",
              link_kind: "service_nav",
              service: entry.service,
              target_title: entry.label,
            }}
          >
            <span className="flex items-center justify-between gap-3 text-[18px] font-semibold text-[#111]">
              {entry.label}
              <span aria-hidden="true">→</span>
            </span>
            <span className="mt-3 block text-[14px] leading-6 text-[#666]">
              {entry.description}
            </span>
            <span className="mt-5 block text-[12px] font-semibold text-[#555]">
              문서 {entry.articleCount}개
            </span>
          </PublicContentTrackedLink>
        ))}
      </div>
    </section>
  );
}
