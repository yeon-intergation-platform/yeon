import { type YeonHref as Href } from "@yeon/ui/native";
import { YEON_ROUTE_TEMPLATES } from "@yeon/ui/runtime/ports";

export function getCardRoomHref(roomId: string): Href {
  return {
    pathname: YEON_ROUTE_TEMPLATES.cardRoomDetail,
    params: { roomId },
  } as unknown as Href;
}
