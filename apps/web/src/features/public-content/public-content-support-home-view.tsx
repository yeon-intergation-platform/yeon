import { ArrowRight, MessageCircle } from "lucide-react";
import type {
  PublicContentSupportHomeProblemEntry,
  PublicContentSupportHomeReportEntry,
  PublicContentSupportHomeServiceEntry,
} from "./public-content-support-home";
import { PublicContentServiceIcon } from "./public-content-service-icon";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

export function PublicContentSupportHomeHero({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-8 pt-12 md:px-8 md:pb-10 md:pt-14">
      <div>
        <p className="text-[13px] font-semibold text-[#555]">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-[42px] font-semibold leading-[1.12] tracking-[-0.045em] text-[#111] md:text-[52px]">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[#666]">
          {description}
        </p>
      </div>
    </section>
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
      className="mx-auto max-w-6xl px-6 pb-10 md:px-8"
    >
      <div className="border-t border-[#e5e5e5] pt-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              id="support-problem-entry-title"
              className="text-[25px] font-semibold tracking-[-0.03em] text-[#111]"
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
              className="group flex min-h-52 flex-col border border-[#e5e5e5] bg-white p-5 text-left no-underline transition-colors hover:border-[#111] hover:bg-[#fafafa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
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
              <span className="mt-auto flex items-end justify-end pt-5 text-[#111]">
                <span className="sr-only">문서 보기</span>
                <ArrowRight
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  size={18}
                />
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
      <div className="flex flex-col gap-5 border border-[#e5e5e5] bg-white p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] text-[#111]">
            <MessageCircle aria-hidden="true" size={22} strokeWidth={1.75} />
          </span>
          <div>
            <h2
              id="support-error-report-title"
              className="text-[22px] font-semibold tracking-[-0.03em] text-[#111]"
            >
              원하는 답을 찾지 못하셨나요?
            </h2>
            <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#666]">
              {entry.description}
            </p>
          </div>
        </div>
        <PublicContentTrackedLink
          eventType="cta"
          href={entry.href}
          className="inline-flex shrink-0 items-center justify-center gap-2 bg-[#111] px-5 py-3 text-center text-[14px] font-semibold text-white no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
          trackingParams={{
            channel: "support",
            link_kind: "support_error_report",
            service: "account",
            target_title: entry.label,
          }}
        >
          문의하기 <ArrowRight aria-hidden="true" size={16} />
        </PublicContentTrackedLink>
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
      className="mx-auto max-w-6xl px-6 pb-10 md:px-8"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2
            id="support-service-entry-title"
            className="text-[25px] font-semibold tracking-[-0.03em] text-[#111]"
          >
            어떤 서비스에서 문제가 생겼나요?
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[#666]">
            서비스를 먼저 고르면 필요한 문서만 모아서 볼 수 있어요.
          </p>
        </div>
        <p className="text-[13px] text-[#666]">{entries.length}개 서비스</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {entries.map((entry) => (
          <PublicContentTrackedLink
            key={entry.service}
            href={entry.href}
            className="group flex min-h-48 flex-col border border-[#e5e5e5] bg-white p-4 no-underline transition-colors hover:border-[#111] hover:bg-[#fafafa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
            trackingParams={{
              channel: "support",
              link_kind: "service_nav",
              service: entry.service,
              target_title: entry.label,
            }}
          >
            <span className="flex items-start justify-between gap-3 text-[#111]">
              <PublicContentServiceIcon service={entry.service} size={24} />
              <ArrowRight
                aria-hidden="true"
                className="mt-1 transition-transform duration-200 group-hover:translate-x-1"
                size={17}
              />
            </span>
            <span className="mt-4 block text-[17px] font-semibold text-[#111]">
              {entry.label}
            </span>
            <span className="mt-2 block text-[13px] leading-5 text-[#666]">
              {entry.description}
            </span>
            <span className="mt-auto block pt-4 text-[12px] font-semibold text-[#555]">
              문서 {entry.articleCount}개
            </span>
          </PublicContentTrackedLink>
        ))}
      </div>
    </section>
  );
}
