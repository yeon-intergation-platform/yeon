import type { Metadata } from "next";

import { SlimeGamePrototype } from "@/features/slime-game/slime-game-prototype";

export const metadata: Metadata = {
  title: "슬라임 스프라이트 이동 검증 | YEON",
  description:
    "실제 슬라임 스프라이트 시트의 좌우 이동, 방향 반전, idle/walk 프레임만 검증하는 화면입니다.",
  robots: { index: false, follow: false },
};

export default function SlimeGamePage() {
  return <SlimeGamePrototype />;
}
