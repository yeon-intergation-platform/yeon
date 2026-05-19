import type { Metadata } from "next";

import { StarLobbyMvpPage } from "./_components/star-lobby-mvp-page";

export const metadata: Metadata = {
  title: "방 떴다 | 스타 로비 키워드 알림",
  description:
    "스타크래프트 유즈맵 로비를 관측해 원하는 방제 키워드가 뜨는 순간 알려주는 실시간 알림 서비스입니다.",
};

export default function StarLobbyPage() {
  return <StarLobbyMvpPage />;
}
