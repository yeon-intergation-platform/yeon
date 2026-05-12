import type { Metadata } from "next";
import { CardRoomCreateScreen } from "@/features/card-service";

export const metadata: Metadata = {
  title: "YEON 카드방 만들기",
  description: "암기 검증 카드방을 만들기 전 설정을 확인하는 화면입니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewCardRoomPage() {
  return <CardRoomCreateScreen />;
}
