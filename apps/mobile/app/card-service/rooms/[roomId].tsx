import { useYeonLocalSearchParams as useLocalSearchParams } from "@yeon/ui/native";
import { CardRoomScreen } from "../../../src/features/card-service/rooms/card-room-screen";

export default function CardRoomRoute() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  return <CardRoomScreen roomId={roomId} />;
}
