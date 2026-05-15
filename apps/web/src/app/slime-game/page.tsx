import type { Metadata } from "next";

import { SlimeGamePrototype } from "@/features/slime-game/slime-game-prototype";

export const metadata: Metadata = {
  title: "슬라임 에셋 게임 프로토타입 | YEON",
  description:
    "Manifest 기반으로 정리한 슬라임 픽셀 에셋을 실제 게임 상태에 연결해 검수하는 미니 프로토타입입니다.",
  robots: { index: false, follow: false },
};

export default function SlimeGamePage() {
  return <SlimeGamePrototype />;
}
