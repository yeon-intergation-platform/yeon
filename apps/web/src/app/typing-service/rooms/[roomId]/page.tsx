import { Suspense } from "react";
import { YeonView } from "@yeon/ui";
import { TypingRoomScreen } from "@/features/typing-service";
import { createTypingServiceMetadata } from "../../typing-service-metadata";

export const metadata = createTypingServiceMetadata({
  title: "YEON Typing Room",
  description: "Wait and play in a real-time typing room.",
  robots: {
    index: false,
    follow: false,
  },
  includeCanonical: false,
  path: "/rooms",
});

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
