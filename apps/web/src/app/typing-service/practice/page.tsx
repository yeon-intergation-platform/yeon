import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { TypingRaceSoloScreen } from "@/features/typing-service/typing-race-solo-screen";

export const metadata: YeonPageMetadata = {
  title: "YEON 타자 덱 연습",
  description: "선택한 타자 덱으로 바로 시작하는 솔로 타자 연습 화면입니다.",
  alternates: {
    canonical: "/typing-service/practice",
  },
  robots: {
    index: false,
    follow: true,
  },
};

type TypingServicePracticePageProps = {
  searchParams: Promise<{
    deckId?: string | string[];
  }>;
};

function pickFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeDeckId(value: string | string[] | undefined) {
  const deckId = pickFirstValue(value)?.trim();
  return deckId ? deckId : null;
}

export default async function TypingServicePracticePage({
  searchParams,
}: TypingServicePracticePageProps) {
  const resolvedSearchParams = await searchParams;
  const practiceDeckId = normalizeDeckId(resolvedSearchParams.deckId);

  return <TypingRaceSoloScreen practiceDeckId={practiceDeckId} />;
}
