import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { CardRoomLobbyScreen } from "@/features/card-service";

export const metadata: YeonPageMetadata = {
  title: "YEON 카드방 로비",
  description: "캐릭터로 입장해 서로의 암기 답변을 확인하는 카드방 로비입니다.",
  alternates: {
    canonical: "/card-service/rooms",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CardRoomLobbyPage() {
  return <CardRoomLobbyScreen />;
}
