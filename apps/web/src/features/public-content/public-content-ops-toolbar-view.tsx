"use client";

import type {
  PublicContentChannel,
  PublicContentService,
} from "./public-content-data";
import type { PublicContentOpsToolbarModel } from "./public-content-ops-toolbar";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

export type PublicContentOpsToolbarArticleContext = {
  category: string;
  channel: PublicContentChannel;
  service: PublicContentService;
};

export function PublicContentOpsToolbar({
  article,
  model,
}: {
  article: PublicContentOpsToolbarArticleContext;
  model: PublicContentOpsToolbarModel | null;
}) {
  if (!model) return null;

  return (
    <section
      className="mt-8 border border-[#d6d6d6] bg-[#fafafa] p-4"
      data-public-content-ops-toolbar="true"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[12px] font-semibold text-[#777]">운영 확인</p>
          <p className="mt-1 text-[14px] font-semibold text-[#111]">
            공개 렌더링, SEO, sitemap 상태만 확인합니다
          </p>
        </div>
        <p className="w-fit rounded-md border border-[#d6d6d6] bg-white px-3 py-1 text-[12px] font-semibold text-[#555]">
          sitemap {model.sitemapIncluded ? "포함" : "누락"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {model.actions.map((action) => (
          <PublicContentTrackedLink
            key={action.kind}
            href={action.href}
            className="rounded-lg border border-[#d6d6d6] bg-white px-3 py-2 text-[12px] font-semibold text-[#555] no-underline transition-colors hover:border-[#111] hover:text-[#111]"
            trackingParams={{
              category: article.category,
              channel: article.channel,
              link_kind: "ops_toolbar",
              service: article.service,
              target_title: action.label,
            }}
          >
            {action.label}
          </PublicContentTrackedLink>
        ))}
      </div>

      <div className="mt-4 border-t border-[#e5e5e5] pt-4">
        <p className="text-[12px] font-semibold text-[#777]">검증 결과</p>
        {model.validationMessages.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {model.validationMessages.map((message) => (
              <li key={message} className="text-[13px] leading-6 text-[#777]">
                {message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[13px] leading-6 text-[#777]">
            검증 오류 없음
          </p>
        )}
      </div>
    </section>
  );
}
