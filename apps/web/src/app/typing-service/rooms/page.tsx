import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { TypingRoomLobbyScreen } from "@/features/typing-service";
import { buildServiceCanonicalUrl } from "@/lib/seo";

export const metadata: YeonPageMetadata = {
  title: "YEON 타자방 로비",
  description:
    "방을 만들고 입장해서 같은 문장을 함께 치는 실시간 타자방 로비입니다.",
  alternates: {
    canonical: buildServiceCanonicalUrl("typing", "/rooms"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TypingRoomLobbyPage() {
  return <TypingRoomLobbyScreen />;
}
