import type { Metadata } from "next";
import { Suspense } from "react";
import { TypingRoomScreen } from "@/features/typing-service";

export const metadata: Metadata = {
  title: "YEON 타자방 만들기",
  description: "실시간 타자 대결방을 만들고 대기방에서 참가자를 초대합니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewTypingRoomPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">타자방을 준비하는 중...</div>}>
      <TypingRoomScreen mode="create" />
    </Suspense>
  );
}
