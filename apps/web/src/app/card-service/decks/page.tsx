import type { Metadata } from "next";
import { CardServiceDecksScreen } from "@/features/card-service";

export const metadata: Metadata = {
  title: "YEON 카드 덱",
  description: "내 플래시카드 덱을 만들고 관리하는 카드 서비스 덱 화면입니다.",
  alternates: {
    canonical: "/card-service/decks",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CardServiceDecksPage() {
  return <CardServiceDecksScreen />;
}
