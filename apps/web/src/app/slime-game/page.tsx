import type { Metadata } from "next";

import { SlimeGamePrototype } from "@/features/slime-game/slime-game-prototype";

export const metadata: Metadata = {
  title: "슬라임 스프라이트 액션 검증 | YEON",
  description:
    "실제 슬라임 스프라이트 시트의 이동, 점프, 공격 프레임을 검증하는 화면입니다.",
  robots: { index: false, follow: false },
};

export default function SlimeGamePage() {
  return <SlimeGamePrototype />;
}
