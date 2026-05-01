import type { Metadata } from "next";

import { TypingDecksScreen } from "@/features/typing-service/typing-decks-screen";
import { getCurrentAuthUser } from "@/server/auth/session";
import { isAdminUser } from "@/server/auth/admin";

export const metadata: Metadata = {
  title: "YEON 타자 덱 관리",
  description:
    "타자 연습용 기본 덱, 내 덱, 공개 덱을 둘러보고 AI 붙여넣기로 문단을 추가합니다.",
  alternates: {
    canonical: "/typing-service/decks",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default async function TypingDecksPage() {
  const currentUser = await getCurrentAuthUser();
  const showAdminEntry = currentUser ? await isAdminUser(currentUser) : false;

  return <TypingDecksScreen showAdminEntry={showAdminEntry} />;
}
