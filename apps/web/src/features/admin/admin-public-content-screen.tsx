import type { ReactNode } from "react";
import { YeonLink, YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  getPublicContentAdminArticleRows,
  getPublicContentAdminChannelSummaries,
  getPublicContentAdminChannelSummary,
  getPublicContentAdminDashboardStats,
  type PublicContentAdminArticleRow,
} from "@/features/public-content/public-content-admin-model";
import type { PublicContentChannel } from "@/features/public-content/public-content-data";

type AdminPublicContentProps = {
  adminEmail: string;
};

type AdminPublicContentChannelProps = AdminPublicContentProps & {
  channel: PublicContentChannel;
};

const CONTENT_NAV_ITEMS = [
  { href: "/admin/content", label: "콘텐츠" },
  { href: "/admin/members", label: "회원 관리" },
  { href: "/admin/users", label: "사용자 · 경험치" },
] as const;

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

function AdminPublicContentShell({
  adminEmail,
  children,
  currentHref,
}: AdminPublicContentProps & {
  children: ReactNode;
  currentHref: string;
}) {
  return (
    <YeonView className="min-h-screen bg-white text-[#111]">
      <YeonView className="border-b border-[#e5e5e5] bg-white px-6 py-3 md:px-12">
        <YeonView className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3">
          <YeonView>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
            >
              관리자
            </YeonText>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="text-[14px] font-semibold"
            >
              {adminEmail} · 공개 콘텐츠
            </YeonText>
          </YeonView>
          <YeonView className={SHARED_FEATURE_CLASS.wrapGap2}>
            {CONTENT_NAV_ITEMS.map((item) => (
              <YeonLink
                key={item.href}
                href={item.href}
                className={
                  item.href === currentHref
                    ? SHARED_FEATURE_CLASS.primaryActionButtonMd13
                    : SHARED_FEATURE_CLASS.ghostButtonMd13
                }
              >
                {item.label}
              </YeonLink>
            ))}
          </YeonView>
        </YeonView>
      </YeonView>
      {children}
    </YeonView>
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
                {row.channelLabel} · {row.serviceLabel} · {row.categoryLabel}
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
                  href={row.internalHref}
                  className={SHARED_FEATURE_CLASS.primaryActionButtonMd13}
                >
                  공개 글
                </YeonLink>
                <YeonLink
                  href={row.canonicalUrl}
                  className={SHARED_FEATURE_CLASS.ghostButtonMd13}
                >
                  canonical
                </YeonLink>
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
    <YeonView
      as="main"
      className="flex min-h-screen items-center justify-center bg-white px-6 text-[#111]"
    >
      <YeonView
        as="section"
        className="max-w-xl rounded-lg border border-[#e5e5e5] bg-white p-8"
      >
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
        >
          관리자 전용
        </YeonText>
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className="mt-2 text-[26px] font-semibold text-[#111]"
        >
          관리자 권한이 필요합니다
        </YeonText>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="mt-3 text-[14px] leading-6 text-[#666]"
        >
          공개 콘텐츠 현황은 admin role 계정만 볼 수 있습니다. 시드 이메일은{" "}
          {seedEmailCount.toLocaleString("ko-KR")}개 설정되어 있습니다.
        </YeonText>
        <YeonView className={SHARED_FEATURE_CLASS.wrapGap2 + " mt-6"}>
          <YeonLink
            href="/auth/login"
            className={SHARED_FEATURE_CLASS.primaryActionButtonMd14}
          >
            로그인하기
          </YeonLink>
          <YeonLink href="/" className={SHARED_FEATURE_CLASS.ghostButtonMd14}>
            홈으로
          </YeonLink>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}

export function AdminPublicContentDashboard({
  adminEmail,
}: AdminPublicContentProps) {
  const stats = getPublicContentAdminDashboardStats();
  const summaries = getPublicContentAdminChannelSummaries();

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
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[13px] leading-5 text-[#666]"
          >
            마지막 갱신 {formatDate(stats.lastUpdatedAt)}
          </YeonText>
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
            note="초기 공개 글"
          />
          <MetricCard
            label="services"
            value={stats.serviceCount.toLocaleString("ko-KR")}
            note="서비스 분포"
          />
          <MetricCard
            label="sitemap urls"
            value={stats.sitemapUrlCount.toLocaleString("ko-KR")}
            note="home 포함"
          />
          <MetricCard
            label="sources"
            value={stats.sourcePathCount.toLocaleString("ko-KR")}
            note="근거 파일"
          />
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
                  서비스: {summary.serviceLabels.join(", ")}
                </YeonText>
                <YeonText variant="unstyled" tone="inherit">
                  분류: {summary.categoryLabels.join(", ")}
                </YeonText>
                <YeonText variant="unstyled" tone="inherit">
                  sitemap: home {summary.sitemapHomeIncluded ? "포함" : "누락"}{" "}
                  · 글 {summary.sitemapArticleCount}/{summary.articleCount}
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
              </YeonView>
            </YeonView>
          ))}
        </YeonView>
      </YeonView>
    </AdminPublicContentShell>
  );
}

export function AdminPublicContentChannelScreen({
  adminEmail,
  channel,
}: AdminPublicContentChannelProps) {
  const summary = getPublicContentAdminChannelSummary(channel);
  const rows = getPublicContentAdminArticleRows(channel);

  if (!summary) {
    return null;
  }

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
              href={summary.publicHomeUrl}
              className={SHARED_FEATURE_CLASS.primaryActionButtonMd13}
            >
              공개 홈
            </YeonLink>
            <YeonLink
              href={`${summary.publicHomeUrl}/sitemap.xml`}
              className={SHARED_FEATURE_CLASS.ghostButtonMd13}
            >
              sitemap
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
            note={summary.serviceLabels.join(", ")}
          />
          <MetricCard
            label="sitemap"
            value={`${summary.sitemapArticleCount}/${summary.articleCount}`}
            note={summary.sitemapHomeIncluded ? "home 포함" : "home 누락"}
          />
          <MetricCard
            label="updated"
            value={formatDate(summary.lastUpdatedAt)}
            note="최근 갱신"
          />
        </YeonView>

        <YeonView className="mt-8">
          <ArticleList rows={rows} />
        </YeonView>
      </YeonView>
    </AdminPublicContentShell>
  );
}
