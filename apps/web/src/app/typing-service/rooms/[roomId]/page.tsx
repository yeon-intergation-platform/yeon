import type { Metadata } from "next";
import { Suspense } from "react";
import { TypingRoomScreen } from "@/features/typing-service";

export const metadata: Metadata = {
  title: "YEON 타자방",
  description: "실시간 타자 대결방 대기 및 플레이 화면입니다.",
  robots: {
    index: false,
    follow: false,
  },
};

type TypingRoomPageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function TypingRoomPage({ params }: TypingRoomPageProps) {
  const { roomId } = await params;
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">타자방에 입장하는 중...</div>}>
      <TypingRoomScreen mode="join" roomId={roomId} />
    </Suspense>
  );
}
