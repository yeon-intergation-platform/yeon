import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { SlimeGamePrototype } from "@/features/slime-game/slime-game-prototype";

export const metadata: YeonPageMetadata = {
  title: "슬라임 게임 검증 페이지 | YEON",
  description:
    "슬라임 액션프레임, 지형 충돌, 히트박스 전투 판정을 단계별로 검증하는 화면입니다.",
  robots: { index: false, follow: false },
};

export default function SlimeGamePage() {
  return <SlimeGamePrototype />;
}
