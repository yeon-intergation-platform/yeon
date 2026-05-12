import type { Metadata } from "next";
import { Suspense } from "react";
import { CardRoomScreen } from "@/features/card-service";

export const metadata: Metadata = {
  title: "YEON 카드방",
  description:
    "카드 앞면을 보고 답변하고 봐주는 사람이 OK 또는 포기를 확정하는 화면입니다.",
  robots: {
    index: false,
    follow: false,
  },
};

type CardRoomPageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function CardRoomPage({ params }: CardRoomPageProps) {
  const { roomId } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          카드방에 입장하는 중...
        </div>
      }
    >
      <CardRoomScreen roomId={roomId} />
    </Suspense>
  );
}
