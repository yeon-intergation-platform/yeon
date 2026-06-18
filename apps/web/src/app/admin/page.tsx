import { YeonLink, YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import {
  AdminAccessDenied,
  AdminPageShell,
} from "@/features/admin/admin-shell";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { getAdminSeedEmails, getCurrentAdminUser } from "@/server/auth/admin";
import { loadAdminPublicContentDashboardData } from "./content/_data";

export const metadata: YeonPageMetadata = {
  title: "운영 홈 | YEON Admin",
  robots: NON_INDEXABLE_ROBOTS,
};

type AdminHomeCardProps = {
  href: string;
  label: string;
  title: string;
  description: string;
  metrics: readonly string[];
};

function AdminHomeCard({
  href,
  label,
  title,
  description,
  metrics,
}: AdminHomeCardProps) {
  return (
    <YeonView className="rounded-lg border border-[#e5e5e5] bg-white p-5">
      <YeonText
        variant="unstyled"
        tone="inherit"
        className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
      >
        {label}
      </YeonText>
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="mt-2 text-[20px] font-semibold text-[#111]"
      >
        {title}
      </YeonText>
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="mt-2 min-h-[48px] text-[13px] leading-6 text-[#666]"
      >
        {description}
      </YeonText>
      <YeonView className="mt-4 space-y-2 border-t border-[#e5e5e5] pt-4">
        {metrics.map((metric) => (
          <YeonText
            key={metric}
            variant="unstyled"
            tone="inherit"
            className="text-[13px] font-semibold text-[#111]"
          >
            {metric}
          </YeonText>
        ))}
      </YeonView>
      <YeonLink
        href={href}
        className={SHARED_FEATURE_CLASS.primaryActionButtonMd13 + " mt-5"}
      >
        열기
      </YeonLink>
    </YeonView>
  );
}

export default async function AdminHomePage() {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    return (
      <AdminAccessDenied
        description="운영 홈은 admin role 계정만 접근할 수 있습니다."
        seedEmailCount={Array.from(getAdminSeedEmails()).filter(Boolean).length}
      />
    );
  }

  const { data: contentDashboard, errorMessage } =
    await loadAdminPublicContentDashboardData(adminUser.id);
  const contentStats = contentDashboard?.stats;
  const contentMetrics = contentStats
    ? [
        `글 ${contentStats.articleCount.toLocaleString("ko-KR")}개 · 발행 ${contentStats.publishedCount.toLocaleString("ko-KR")}개`,
        `SEO 경고 ${contentStats.seoWarningCount.toLocaleString("ko-KR")}개`,
        `source 추적 ${contentStats.sourcePathCount.toLocaleString("ko-KR")}/${contentStats.articleCount.toLocaleString("ko-KR")}`,
      ]
    : ["공개 콘텐츠 상태를 불러오지 못했습니다.", errorMessage ?? "서버 오류"];

  return (
    <AdminPageShell
      adminEmail={adminUser.email}
      currentHref="/admin"
      sectionLabel="운영 홈"
    >
      <YeonView
        as="main"
        className="mx-auto max-w-[1400px] px-6 py-10 md:px-12"
      >
        <YeonView className="flex flex-wrap items-end justify-between gap-4">
          <YeonView>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
            >
              admin operations
            </YeonText>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="mt-2 text-[30px] font-semibold text-[#111]"
            >
              YEON 운영 홈
            </YeonText>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="mt-2 max-w-[760px] text-[14px] leading-6 text-[#666]"
            >
              공개 콘텐츠 상태, 사용자 운영, 타자 서비스 관리 화면으로
              이동합니다.
            </YeonText>
          </YeonView>
          <YeonLink
            href="/admin/content"
            className={SHARED_FEATURE_CLASS.ghostButtonMd13}
          >
            공개 콘텐츠 상세
          </YeonLink>
        </YeonView>

        <YeonView className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdminHomeCard
            href="/admin/content"
            label="content"
            title="공개 콘텐츠"
            description="support, news, blog 글의 발행 상태, sitemap, SEO 경고, source 추적을 확인합니다."
            metrics={contentMetrics}
          />
          <AdminHomeCard
            href="/admin/typing-decks"
            label="typing"
            title="타자 덱"
            description="기본/공개/사용자 덱을 확인하고 운영자가 필요한 연습 덱을 추가합니다."
            metrics={["덱 목록", "문장 관리", "공개 범위 확인"]}
          />
          <AdminHomeCard
            href="/admin/typing-characters"
            label="typing"
            title="타자 캐릭터"
            description="타자 서비스 캐릭터 프레임과 표시 설정을 운영 화면에서 관리합니다."
            metrics={["캐릭터 프레임", "표시 설정", "관리자 전용"]}
          />
          <AdminHomeCard
            href="/admin/typing-rooms"
            label="typing"
            title="타자방 운영"
            description="팀 배치, 방 참여자 상태, 점령전 운영 데이터를 점검합니다."
            metrics={["참여자", "팀 배치", "점령전 상태"]}
          />
          <AdminHomeCard
            href="/admin/members"
            label="users"
            title="회원 관리"
            description="회원 계정과 관리자 접근 권한을 확인합니다."
            metrics={["회원 목록", "관리자 role", "계정 상태"]}
          />
          <AdminHomeCard
            href="/admin/users"
            label="experience"
            title="사용자 · 경험치"
            description="서비스 사용자 경험치와 진행 상태를 확인합니다."
            metrics={["사용자 목록", "경험치", "레벨"]}
          />
        </YeonView>
      </YeonView>
    </AdminPageShell>
  );
}
