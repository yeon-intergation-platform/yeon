import type { Metadata } from "next";

import { TypingDeckLibraryScreen } from "@/features/typing-service/typing-deck-library-screen";
import { getCurrentAuthUser } from "@/server/auth/session";
import { isAdminUser } from "@/server/auth/admin";

export const metadata: Metadata = {
  title: "YEON 타자 덱 라이브러리",
  description:
    "기본 덱, 내 덱, 공개 덱을 검색하고 바로 타자 연습을 시작합니다.",
  alternates: {
    canonical: "/typing-service/decks",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function TypingDecksPage() {
  const currentUser = await getCurrentAuthUser();
  const showAdminEntry = currentUser ? await isAdminUser(currentUser) : false;

  return <TypingDeckLibraryScreen showAdminEntry={showAdminEntry} />;
}
