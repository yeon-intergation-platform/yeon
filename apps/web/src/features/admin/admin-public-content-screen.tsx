import type { ReactNode } from "react";
import { YeonLink, YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { AdminAccessDenied, AdminPageShell } from "./admin-shell";
import type {
  PublicContentAdminArticleRow,
  PublicContentAdminChannelSummary,
  PublicContentAdminDashboardData,
  PublicContentAdminOpsChecklistItem,
  PublicContentAdminOpsChecklistStatus,
} from "@/features/public-content/public-content-admin-model";

type AdminPublicContentProps = {
  adminEmail: string;
};

type AdminPublicContentDashboardProps = AdminPublicContentProps & {
  dashboard: PublicContentAdminDashboardData;
};

type AdminPublicContentChannelProps = AdminPublicContentProps & {
  rows: readonly PublicContentAdminArticleRow[];
  seoWarningRows: readonly PublicContentAdminArticleRow[];
  summary: PublicContentAdminChannelSummary;
};

type OperationLink = {
  href: string;
  label: string;
  note: string;
};

type AdminArticleQueueItemViewState = {
  dateValue: string | null;
  publicHref: string | null;
  row: PublicContentAdminArticleRow;
  seoWarnings:
    | {
        kind: "hidden";
      }
    | {
        kind: "visible";
        warnings: readonly string[];
      };
};

type AdminArticleQueueViewState =
  | {
      emptyText: string;
      kind: "empty";
    }
  | {
      items: readonly AdminArticleQueueItemViewState[];
      kind: "ready";
    };

const OPS_CHECKLIST_STATUS_LABELS = {
  manual: "수동 확인",
  ready: "정상",
  warning: "확인 필요",
} as const satisfies Record<PublicContentAdminOpsChecklistStatus, string>;
const OPS_CHECKLIST_STATUS_CLASSES = {
  manual: "border-[#d7d7d7] bg-white text-[#666]",
  ready: "border-[#3f8f5f] bg-[#f3fbf6] text-[#277047]",
  warning: "border-[#e5484d] bg-[#fff5f5] text-[#b42318]",
} as const satisfies Record<PublicContentAdminOpsChecklistStatus, string>;

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatSourcePath(path: string) {
  return path.replace(/^\/Users\/osuma\/coding_stuffs\//, "");
}

function joinLabels(labels: readonly string[]) {
  return labels.length > 0 ? labels.join(", ") : "-";
}

function canOpenPublicArticle(row: PublicContentAdminArticleRow) {
  return (
    row.article.status === "published" && row.article.visibility === "public"
  );
}

function toAdminArticleQueueViewState(params: {
  dateKind: "published" | "updated";
  emptyText: string;
  rows: readonly PublicContentAdminArticleRow[];
}): AdminArticleQueueViewState {
  if (params.rows.length === 0) {
    return {
      emptyText: params.emptyText,
      kind: "empty",
    };
  }

  return {
    items: params.rows.map((row) => ({
      dateValue:
        params.dateKind === "published"
          ? row.article.publishedAt
          : row.article.updatedAt,
      publicHref: canOpenPublicArticle(row) ? row.internalHref : null,
      row,
      seoWarnings:
        row.seoWarnings.length > 0
          ? {
              kind: "visible",
              warnings: row.seoWarnings,
            }
          : {
              kind: "hidden",
            },
    })),
    kind: "ready",
  };
}

function AdminPublicContentShell({
  adminEmail,
  children,
  currentHref,
}: AdminPublicContentProps & {
  children: ReactNode;
  currentHref: string;
}) {
  return (
    <AdminPageShell
      adminEmail={adminEmail}
      currentHref={currentHref}
      sectionLabel="공개 콘텐츠"
    >
      {children}
    </AdminPageShell>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <YeonView className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-5">
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#666]"
      >
        {label}
      </YeonText>
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="mt-3 text-[30px] font-semibold text-[#111]"
      >
        {value}
      </YeonText>
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="mt-2 text-[13px] leading-5 text-[#666]"
      >
        {note}
      </YeonText>
    </YeonView>
  );
}

function OperationLinkList({ links }: { links: readonly OperationLink[] }) {
  return (
    <YeonView className="grid gap-3 md:grid-cols-3">
      {links.map((link) => (
        <YeonLink
          key={link.href}
          href={link.href}
          className="rounded-lg border border-[#e5e5e5] bg-white p-4 text-[#111] no-underline transition-colors hover:border-[#111]"
        >
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[14px] font-semibold text-[#111]"
          >
            {link.label}
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-2 block text-[13px] leading-5 text-[#666]"
          >
            {link.note}
          </YeonText>
        </YeonLink>
      ))}
    </YeonView>
  );
}

function OpsChecklistItem({
  item,
}: {
  item: PublicContentAdminOpsChecklistItem;
}) {
  const content = (
    <>
      <YeonView className="flex flex-wrap items-start justify-between gap-3">
        <YeonView>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[14px] font-semibold text-[#111]"
          >
            {item.label}
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-2 block text-[13px] leading-5 text-[#666]"
          >
            {item.note}
          </YeonText>
        </YeonView>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={`rounded-md border px-2.5 py-1 text-[12px] font-semibold ${OPS_CHECKLIST_STATUS_CLASSES[item.status]}`}
        >
          {OPS_CHECKLIST_STATUS_LABELS[item.status]}
        </YeonText>
      </YeonView>
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="mt-3 block text-[13px] font-semibold text-[#111]"
      >
        {item.value}
      </YeonText>
    </>
  );

  if (item.href) {
    return (
      <YeonLink
        href={item.href}
        className="block rounded-lg border border-[#e5e5e5] bg-white p-4 text-[#111] no-underline transition-colors hover:border-[#111]"
      >
        {content}
      </YeonLink>
    );
  }

  return (
    <YeonView className="rounded-lg border border-[#e5e5e5] bg-white p-4">
      {content}
    </YeonView>
  );
}

function OpsChecklist({
  items,
}: {
  items: readonly PublicContentAdminOpsChecklistItem[];
}) {
  return (
    <YeonView className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <OpsChecklistItem key={item.id} item={item} />
      ))}
    </YeonView>
  );
}

function AdminArticleQueue({
  dateKind,
  emptyText,
  rows,
  title,
}: {
  dateKind: "published" | "updated";
  emptyText: string;
  rows: readonly PublicContentAdminArticleRow[];
  title: string;
}) {
  const queue = toAdminArticleQueueViewState({ dateKind, emptyText, rows });

  return (
    <YeonView className="rounded-lg border border-[#e5e5e5] bg-white">
      <YeonView className="border-b border-[#e5e5e5] px-5 py-4">
        <YeonText
          as="h2"
          variant="unstyled"
          tone="inherit"
          className="text-[18px] font-semibold text-[#111]"
        >
          {title}
        </YeonText>
      </YeonView>
      {queue.kind === "empty" ? (
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="block px-5 py-5 text-[14px] leading-6 text-[#666]"
        >
          {queue.emptyText}
        </YeonText>
      ) : (
        <YeonView className="divide-y divide-[#e5e5e5]">
          {queue.items.map((item) => {
            return (
              <YeonView key={item.row.article.id} className="px-5 py-4">
                <YeonText
                  variant="unstyled"
                  tone="inherit"
                  className="text-[12px] font-semibold text-[#666]"
                >
                  {item.row.channelLabel} · {item.row.serviceLabel} ·{" "}
                  {item.row.statusLabel}
                </YeonText>
                {item.publicHref ? (
                  <YeonLink
                    href={item.publicHref}
                    className="mt-1 block text-[15px] font-semibold leading-6 text-[#111] no-underline hover:underline"
                  >
                    {item.row.article.title}
                  </YeonLink>
                ) : (
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className="mt-1 block text-[15px] font-semibold leading-6 text-[#111]"
                  >
                    {item.row.article.title}
                  </YeonText>
                )}
                <YeonText
                  variant="unstyled"
                  tone="inherit"
                  className="mt-1 text-[13px] text-[#666]"
                >
                  {dateKind === "published" ? "발행" : "수정"}{" "}
                  {formatDate(item.dateValue)}
                </YeonText>
                {item.seoWarnings.kind === "visible" ? (
                  <YeonView className="mt-3 flex flex-wrap gap-2">
                    {item.seoWarnings.warnings.map((warning) => (
                      <YeonText
                        key={warning}
                        as="span"
                        variant="unstyled"
                        tone="inherit"
                        className="rounded-md border border-[#e5484d] bg-[#fff5f5] px-2.5 py-1 text-[12px] font-semibold text-[#b42318]"
                      >
                        {warning}
                      </YeonText>
                    ))}
                  </YeonView>
                ) : null}
              </YeonView>
            );
          })}
        </YeonView>
      )}
    </YeonView>
  );
}

function ArticleList({
  rows,
}: {
  rows: readonly PublicContentAdminArticleRow[];
}) {
  return (
    <YeonView className="overflow-hidden rounded-lg border border-[#e5e5e5] bg-white">
      <YeonView className="border-b border-[#e5e5e5] px-5 py-4">
        <YeonText
          as="h2"
          variant="unstyled"
          tone="inherit"
          className="text-[18px] font-semibold"
        >
          글 목록
        </YeonText>
      </YeonView>
      <YeonView className="divide-y divide-[#e5e5e5]">
        {rows.map((row) => (
          <YeonView
            key={`${row.article.channel}:${row.article.slugSegments.join("/")}`}
            className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_280px]"
          >
            <YeonView>
              <YeonText
                variant="unstyled"
                tone="inherit"
                className="text-[13px] font-semibold text-[#666]"
              >
                {row.channelLabel} · {row.serviceLabel} · {row.categoryLabel} ·{" "}
                {row.statusLabel} · {row.visibilityLabel}
              </YeonText>
              <YeonText
                as="h3"
                variant="unstyled"
                tone="inherit"
                className="mt-1 text-[18px] font-semibold leading-7 text-[#111]"
              >
                {row.article.title}
              </YeonText>
              <YeonText
                variant="unstyled"
                tone="inherit"
                className="mt-2 text-[14px] leading-6 text-[#666]"
              >
                {row.article.summary}
              </YeonText>
              <YeonView className="mt-4 flex flex-wrap gap-2">
                {row.seoWarnings.map((warning) => (
                  <YeonText
                    key={warning}
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className="rounded-md border border-[#e5484d] bg-[#fff5f5] px-2.5 py-1 text-[12px] font-semibold text-[#b42318]"
                  >
                    {warning}
                  </YeonText>
                ))}
                {row.article.sourcePaths.map((sourcePath) => (
                  <YeonText
                    key={sourcePath}
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className="rounded-md border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1 text-[12px] text-[#666]"
                  >
                    {formatSourcePath(sourcePath)}
                  </YeonText>
                ))}
              </YeonView>
            </YeonView>
            <YeonView className="space-y-3 text-[13px] text-[#666]">
              <YeonView>
                <YeonText
                  variant="unstyled"
                  tone="inherit"
                  className="font-semibold text-[#111]"
                >
                  {formatDate(row.article.updatedAt)}
                </YeonText>
                <YeonText variant="unstyled" tone="inherit">
                  {row.article.readingMinutes}분 · sitemap{" "}
                  {row.sitemapIncluded ? "포함" : "누락"}
                </YeonText>
              </YeonView>
              <YeonView className="break-all rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3">
                {row.canonicalUrl}
              </YeonView>
              <YeonView className={SHARED_FEATURE_CLASS.wrapGap2}>
                <YeonLink
                  href={`/admin/content/${row.article.id}/edit`}
                  className={SHARED_FEATURE_CLASS.primaryActionButtonMd13}
                >
                  편집
                </YeonLink>
                <YeonLink
                  href={`/api/v1/admin/content/${row.article.id}/export`}
                  className={SHARED_FEATURE_CLASS.ghostButtonMd13}
                >
                  Markdown
                </YeonLink>
                {canOpenPublicArticle(row) ? (
                  <YeonLink
                    href={row.canonicalUrl}
                    className={SHARED_FEATURE_CLASS.ghostButtonMd13}
                  >
                    공개 글
                  </YeonLink>
                ) : null}
              </YeonView>
            </YeonView>
          </YeonView>
        ))}
      </YeonView>
    </YeonView>
  );
}

export function AdminPublicContentDenied({
  seedEmailCount,
}: {
  seedEmailCount: number;
}) {
  return (
    <AdminAccessDenied
      description="공개 콘텐츠 현황은 admin role 계정만 볼 수 있습니다."
      seedEmailCount={seedEmailCount}
    />
  );
}

export function AdminPublicContentLoadError({
  adminEmail,
  message,
}: AdminPublicContentProps & {
  message: string;
}) {
  return (
    <AdminPublicContentShell
      adminEmail={adminEmail}
      currentHref="/admin/content"
    >
      <YeonView as="main" className="mx-auto max-w-[900px] px-6 py-10 md:px-12">
        <YeonView className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-6">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
          >
            content operations
          </YeonText>
          <YeonText
            as="h1"
            variant="unstyled"
            tone="inherit"
            className="mt-2 text-[26px] font-semibold text-[#111]"
          >
            공개 콘텐츠 현황을 불러오지 못했습니다
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-3 text-[14px] leading-6 text-[#666]"
          >
            {message}
          </YeonText>
          <YeonView className={SHARED_FEATURE_CLASS.wrapGap2 + " mt-6"}>
            <YeonLink
              href="/admin/content"
              className={SHARED_FEATURE_CLASS.primaryActionButtonMd14}
            >
              다시 확인
            </YeonLink>
            <YeonLink
              href="/admin"
              className={SHARED_FEATURE_CLASS.ghostButtonMd14}
            >
              Admin 홈
            </YeonLink>
          </YeonView>
        </YeonView>
      </YeonView>
    </AdminPublicContentShell>
  );
}

export function AdminPublicContentDashboard({
  adminEmail,
  dashboard,
}: AdminPublicContentDashboardProps) {
  const {
    opsChecklist,
    recentPublishedRows,
    recentUpdatedRows,
    seoWarningRows,
    stats,
    summaries,
  } = dashboard;
  const operationLinks: readonly OperationLink[] = [
    {
      href: stats.domainSearchConsoleUrl,
      label: "Domain Search Console",
      note: "sc-domain:yeon.world 전체 노출, 색인, sitemap 상태",
    },
    {
      href: stats.ga4ReportsUrl,
      label: "GA4 공개 콘텐츠",
      note: `${stats.gaMeasurementId} page_view, public_content_* 이벤트`,
    },
    {
      href: "/admin/content/support",
      label: "Support CTA 점검",
      note: "support 글별 제품 진입 CTA와 sitemap 포함 여부",
    },
  ];

  return (
    <AdminPublicContentShell
      adminEmail={adminEmail}
      currentHref="/admin/content"
    >
      <YeonView
        as="main"
        className="mx-auto max-w-[1200px] px-6 py-10 md:px-12"
      >
        <YeonView className="flex flex-wrap items-end justify-between gap-4">
          <YeonView>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
            >
              content operations
            </YeonText>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="mt-2 text-[30px] font-semibold text-[#111]"
            >
              공개 콘텐츠 현황
            </YeonText>
          </YeonView>
          <YeonView className={SHARED_FEATURE_CLASS.wrapGap2}>
            <YeonLink
              href="/admin/content/new"
              className={SHARED_FEATURE_CLASS.primaryActionButtonMd14}
            >
              새 글 작성
            </YeonLink>
            <YeonLink
              href="/api/v1/admin/content/export"
              className={SHARED_FEATURE_CLASS.ghostButtonMd14}
            >
              전체 Markdown
            </YeonLink>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="self-center text-[13px] leading-5 text-[#666]"
            >
              마지막 갱신 {formatDate(stats.lastUpdatedAt)}
            </YeonText>
          </YeonView>
        </YeonView>

        <YeonView className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            label="channels"
            value={stats.channelCount.toLocaleString("ko-KR")}
            note="support, news, blog"
          />
          <MetricCard
            label="articles"
            value={stats.articleCount.toLocaleString("ko-KR")}
            note="Spring admin read API"
          />
          <MetricCard
            label="published"
            value={stats.publishedCount.toLocaleString("ko-KR")}
            note={`draft ${stats.draftCount} · review ${stats.reviewCount}`}
          />
          <MetricCard
            label="seo warnings"
            value={stats.seoWarningCount.toLocaleString("ko-KR")}
            note={`noindex ${stats.noindexCount} · meta ${stats.metaDescriptionMissingCount} · title ${stats.titleWarningCount}`}
          />
          <MetricCard
            label="sitemap urls"
            value={stats.sitemapUrlCount.toLocaleString("ko-KR")}
            note={`sources ${stats.sourcePathCount} · archived ${stats.archivedCount}`}
          />
        </YeonView>

        <YeonView className="mt-8 border-t border-[#e5e5e5] pt-8">
          <YeonView className="mb-4">
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className="text-[20px] font-semibold text-[#111]"
            >
              운영 체크리스트
            </YeonText>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="mt-2 text-[13px] leading-5 text-[#666]"
            >
              자동 등록 여부는 Google credential 준비 전까지 수동 확인으로 두고,
              sitemap·robots·GA4·SEO 경고는 현재 데이터로 점검합니다.
            </YeonText>
          </YeonView>
          <OpsChecklist items={opsChecklist} />
        </YeonView>

        <YeonView className="mt-8 border-t border-[#e5e5e5] pt-8">
          <YeonView className="mb-4">
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className="text-[20px] font-semibold text-[#111]"
            >
              운영 확인 링크
            </YeonText>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="mt-2 text-[13px] leading-5 text-[#666]"
            >
              Search Console과 GA4는 credential/API 자동화 전까지 수동 확인
              링크로 관리합니다.
            </YeonText>
          </YeonView>
          <OperationLinkList links={operationLinks} />
        </YeonView>

        <YeonView className="mt-8 grid gap-4 lg:grid-cols-3">
          {summaries.map((summary) => (
            <YeonView
              key={summary.channel}
              className="rounded-lg border border-[#e5e5e5] bg-white p-5"
            >
              <YeonView className="flex items-start justify-between gap-3">
                <YeonView>
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className="text-[13px] font-semibold text-[#666]"
                  >
                    {summary.host}
                  </YeonText>
                  <YeonText
                    as="h2"
                    variant="unstyled"
                    tone="inherit"
                    className="mt-1 text-[22px] font-semibold text-[#111]"
                  >
                    {summary.label}
                  </YeonText>
                </YeonView>
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="rounded-md bg-[#111] px-2.5 py-1 text-[12px] font-semibold text-white"
                >
                  {summary.articleCount}개
                </YeonText>
              </YeonView>
              <YeonView className="mt-5 space-y-3 text-[13px] text-[#666]">
                <YeonText variant="unstyled" tone="inherit">
                  서비스: {joinLabels(summary.serviceLabels)}
                </YeonText>
                <YeonText variant="unstyled" tone="inherit">
                  분류: {joinLabels(summary.categoryLabels)}
                </YeonText>
                <YeonText variant="unstyled" tone="inherit">
                  상태: 발행 {summary.statusCounts.published} · 초안{" "}
                  {summary.statusCounts.draft} · 검토{" "}
                  {summary.statusCounts.review}
                </YeonText>
                <YeonText variant="unstyled" tone="inherit">
                  sitemap: home {summary.sitemapHomeIncluded ? "포함" : "누락"}{" "}
                  · 글 {summary.sitemapArticleCount}/{summary.articleCount} ·
                  경고 {summary.seoWarningCount}
                </YeonText>
              </YeonView>
              <YeonView className={SHARED_FEATURE_CLASS.wrapGap2 + " mt-5"}>
                <YeonLink
                  href={summary.adminHref}
                  className={SHARED_FEATURE_CLASS.primaryActionButtonMd13}
                >
                  채널 보기
                </YeonLink>
                <YeonLink
                  href={summary.publicHomeUrl}
                  className={SHARED_FEATURE_CLASS.ghostButtonMd13}
                >
                  공개 홈
                </YeonLink>
                <YeonLink
                  href={summary.searchConsoleUrl}
                  className={SHARED_FEATURE_CLASS.ghostButtonMd13}
                >
                  Search Console
                </YeonLink>
                <YeonLink
                  href={summary.sitemapUrl}
                  className={SHARED_FEATURE_CLASS.ghostButtonMd13}
                >
                  sitemap
                </YeonLink>
              </YeonView>
            </YeonView>
          ))}
        </YeonView>

        <YeonView className="mt-8 grid gap-4 lg:grid-cols-3">
          <AdminArticleQueue
            title="최근 발행"
            rows={recentPublishedRows}
            dateKind="published"
            emptyText="최근 발행된 공개 글이 없습니다."
          />
          <AdminArticleQueue
            title="최근 수정"
            rows={recentUpdatedRows}
            dateKind="updated"
            emptyText="최근 수정된 글이 없습니다."
          />
          <AdminArticleQueue
            title="SEO 경고 큐"
            rows={seoWarningRows}
            dateKind="updated"
            emptyText="현재 표시할 SEO 경고가 없습니다."
          />
        </YeonView>
      </YeonView>
    </AdminPublicContentShell>
  );
}

export function AdminPublicContentChannelScreen({
  adminEmail,
  rows,
  seoWarningRows,
  summary,
}: AdminPublicContentChannelProps) {
  return (
    <AdminPublicContentShell
      adminEmail={adminEmail}
      currentHref="/admin/content"
    >
      <YeonView
        as="main"
        className="mx-auto max-w-[1200px] px-6 py-10 md:px-12"
      >
        <YeonView className="flex flex-wrap items-end justify-between gap-4">
          <YeonView>
            <YeonLink
              href="/admin/content"
              className={SHARED_FEATURE_CLASS.ghostButtonMd13}
            >
              콘텐츠 전체
            </YeonLink>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="mt-4 text-[30px] font-semibold text-[#111]"
            >
              {summary.label}
            </YeonText>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="mt-2 text-[14px] leading-6 text-[#666]"
            >
              {summary.host}
            </YeonText>
          </YeonView>
          <YeonView className={SHARED_FEATURE_CLASS.wrapGap2}>
            <YeonLink
              href={`/admin/content/new?channel=${summary.channel}`}
              className={SHARED_FEATURE_CLASS.primaryActionButtonMd13}
            >
              새 글 작성
            </YeonLink>
            <YeonLink
              href={`/api/v1/admin/content/export?channel=${summary.channel}`}
              className={SHARED_FEATURE_CLASS.ghostButtonMd13}
            >
              채널 Markdown
            </YeonLink>
            <YeonLink
              href={summary.publicHomeUrl}
              className={SHARED_FEATURE_CLASS.ghostButtonMd13}
            >
              공개 홈
            </YeonLink>
            <YeonLink
              href={summary.sitemapUrl}
              className={SHARED_FEATURE_CLASS.ghostButtonMd13}
            >
              sitemap
            </YeonLink>
            <YeonLink
              href={summary.robotsUrl}
              className={SHARED_FEATURE_CLASS.ghostButtonMd13}
            >
              robots
            </YeonLink>
            <YeonLink
              href={summary.searchConsoleUrl}
              className={SHARED_FEATURE_CLASS.ghostButtonMd13}
            >
              Search Console
            </YeonLink>
          </YeonView>
        </YeonView>

        <YeonView className="mt-6 grid gap-4 md:grid-cols-4">
          <MetricCard
            label="articles"
            value={summary.articleCount.toLocaleString("ko-KR")}
            note="채널 글"
          />
          <MetricCard
            label="services"
            value={summary.serviceLabels.length.toLocaleString("ko-KR")}
            note={joinLabels(summary.serviceLabels)}
          />
          <MetricCard
            label="sitemap"
            value={`${summary.sitemapArticleCount}/${summary.articleCount}`}
            note={summary.sitemapHomeIncluded ? "home 포함" : "home 누락"}
          />
          <MetricCard
            label="warnings"
            value={summary.seoWarningCount.toLocaleString("ko-KR")}
            note={`초안 ${summary.statusCounts.draft} · 검토 ${summary.statusCounts.review}`}
          />
        </YeonView>

        <YeonView className="mt-8">
          <AdminArticleQueue
            title="채널 SEO 경고 큐"
            rows={seoWarningRows}
            dateKind="updated"
            emptyText="이 채널에 표시할 SEO 경고가 없습니다."
          />
        </YeonView>

        <YeonView className="mt-8">
          <ArticleList rows={rows} />
        </YeonView>
      </YeonView>
    </AdminPublicContentShell>
  );
}
