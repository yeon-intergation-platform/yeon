import { YeonRouteFallbackScreen } from "@yeon/ui/native";
import { isCardApp } from "../src/lib/mobile-app-mode";

export default function NotFoundScreen() {
  return (
    <YeonRouteFallbackScreen
      href={isCardApp ? "/card-service" : "/(tabs)/feed"}
      linkLabel={isCardApp ? "카드로 돌아가기" : "피드로 돌아가기"}
      title="페이지를 찾지 못했습니다."
    />
  );
}
