import { YeonLaunchScreen } from "@yeon/ui/native";
import yeonSplashImage from "../../../assets/images/yeon-splash.png";
import chatSplashImage from "../../../assets/images/chat-service-splash-animal.png";

// variant별 launch 화면 이미지: 카드 = YEON 스플래시, 연챗 = 동물 스플래시.
const isCardApp = process.env.EXPO_PUBLIC_MOBILE_VARIANT === "card";

export function AppLaunchScreen() {
  return (
    <YeonLaunchScreen
      imageSource={isCardApp ? yeonSplashImage : chatSplashImage}
    />
  );
}
