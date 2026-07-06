import { BaekjiSession } from "@/features/typing-service/baekji-session";

// 백지 "질문 보고 답 쓰기" 세션 화면. 라우트 /recall-service/session?deckId={id}.
// recall-service/layout.tsx의 QueryProvider를 상속한다(카드 덱 상세 로드가 React Query에 의존).

type PageProps = {
  searchParams: Promise<{
    deckId?: string | string[];
  }>;
};

function pickFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RecallSessionPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const deckId = pickFirst(resolved.deckId) ?? null;
  return <BaekjiSession deckId={deckId} />;
}
