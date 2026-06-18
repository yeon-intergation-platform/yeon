import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { Suspense } from "react";
import { YeonView } from "@yeon/ui";
import { TypingRoomScreen } from "@/features/typing-service";

export const metadata: YeonPageMetadata = {
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
    <Suspense
      fallback={
        <YeonView className="flex min-h-screen items-center justify-center">
          Entering typing room...
        </YeonView>
      }
    >
      <TypingRoomScreen mode="join" roomId={roomId} />
    </Suspense>
  );
}
