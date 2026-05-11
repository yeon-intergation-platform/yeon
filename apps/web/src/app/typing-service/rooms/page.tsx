import type { Metadata } from "next";
import { TypingRoomLobbyScreen } from "@/features/typing-service";

export const metadata: Metadata = {
  title: "YEON 타자방 로비",
  description: "방을 만들고 입장해서 같은 문장을 함께 치는 실시간 타자방 로비입니다.",
  alternates: {
    canonical: "/typing-service/rooms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TypingRoomLobbyPage() {
  return <TypingRoomLobbyScreen />;
}
