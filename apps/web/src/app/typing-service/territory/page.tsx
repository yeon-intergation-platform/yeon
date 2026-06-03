import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { TypingTerritoryBattleScreen } from "@/features/typing-service/typing-territory-battle-screen";
import { buildServiceCanonicalUrl } from "@/lib/seo";

export const metadata: YeonPageMetadata = {
  title: "타자 점령전 | YEON 타자연습",
  description:
    "단어를 정확히 입력해 팀 보드 칸을 점령하는 실시간 타자 게임 모드입니다.",
  alternates: {
    canonical: buildServiceCanonicalUrl("typing", "/territory"),
  },
  openGraph: {
    title: "타자 점령전 | YEON 타자연습",
    description:
      "단어를 정확히 입력해 팀 보드 칸을 점령하는 실시간 타자 게임 모드입니다.",
    url: buildServiceCanonicalUrl("typing", "/territory"),
    type: "website",
  },
};

type TypingTerritoryBattlePageProps = {
  searchParams?: Promise<{ roomId?: string }>;
};

export default async function TypingTerritoryBattlePage({
  searchParams,
}: TypingTerritoryBattlePageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <TypingTerritoryBattleScreen
      originRoomId={resolvedSearchParams?.roomId ?? null}
    />
  );
}
