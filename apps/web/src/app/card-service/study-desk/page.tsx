import { FocusDeskScreen } from "@/features/focus-desk";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";

export const metadata: YeonPageMetadata = {
  title: "MoodDesk 집중 작업대",
  description:
    "내가 고른 카드 덱을 시간에 맞춰 집중 학습 세션으로 실행하는 뽀모도로 작업대입니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CardStudyDeskPage() {
  return <FocusDeskScreen />;
}
