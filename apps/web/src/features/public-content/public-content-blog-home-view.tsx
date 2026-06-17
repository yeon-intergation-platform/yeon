import { PublicContentArticleCard } from "./public-content-article-card";
import type { PublicContentBlogHomeModel } from "./public-content-blog-home";
import {
  PUBLIC_CONTENT_CHANNELS,
  buildPublicContentCanonicalUrl,
} from "./public-content-data";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

function getArticleSlug(slugSegments: readonly string[]) {
  return slugSegments.join("/");
}

export function PublicContentBlogHomePriority({
  model,
}: {
  model: PublicContentBlogHomeModel;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 md:px-8">
      <div className="border-t border-[#e5e5e5] pt-10">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#555]">Latest</p>
            <h2 className="mt-1 text-[28px] font-semibold text-[#111]">
              최신 글
            </h2>
          </div>
          <p className="text-[13px] text-[#666]">
            최근 발행한 제작 기록과 기술 글
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {model.latestArticles.map((article) => (
            <PublicContentArticleCard
              key={article.slugSegments.join("/")}
              article={article}
            />
          ))}
        </div>
      </div>

      <div className="mt-12 border-t border-[#e5e5e5] pt-10">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#555]">Categories</p>
            <h2 className="mt-1 text-[28px] font-semibold text-[#111]">
              분류별 대표 글
            </h2>
          </div>
          <p className="text-[13px] text-[#666]">
            글의 목적에 따라 읽을 경로를 나눕니다
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {model.categoryEntries.map((entry) => (
            <section
              key={entry.key}
              className="min-w-0 border border-[#e5e5e5] bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold text-[#555]">
                    {entry.purpose}
                  </p>
                  <h3 className="mt-1 text-[20px] font-semibold text-[#111]">
                    {entry.label}
                  </h3>
                </div>
                <PublicContentTrackedLink
                  href={entry.href}
                  className="rounded-lg border border-[#d4d4d4] px-3 py-2 text-[12px] font-semibold text-[#555] no-underline transition-colors hover:border-[#111] hover:text-[#111]"
                  trackingParams={{
                    category: entry.key,
                    channel: PUBLIC_CONTENT_CHANNELS.blog,
                    link_kind: "category_nav",
                    target_title: entry.label,
                  }}
                >
                  {entry.count}개 보기
                </PublicContentTrackedLink>
              </div>
              <PublicContentTrackedLink
                href={buildPublicContentCanonicalUrl(
                  entry.article.channel,
                  entry.article.slugSegments
                )}
                className="mt-5 block border-t border-[#e5e5e5] pt-5 text-[#111] no-underline"
                trackingParams={{
                  category: entry.article.category,
                  channel: entry.article.channel,
                  link_kind: "article_card",
                  service: entry.article.service,
                  slug: getArticleSlug(entry.article.slugSegments),
                  target_title: entry.article.title,
                }}
              >
                <p className="text-[13px] font-semibold text-[#555]">대표 글</p>
                <h4 className="mt-2 text-[18px] font-semibold leading-7 text-[#111]">
                  {entry.article.title}
                </h4>
                <p className="mt-2 text-[14px] leading-6 text-[#666]">
                  {entry.article.summary}
                </p>
              </PublicContentTrackedLink>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
