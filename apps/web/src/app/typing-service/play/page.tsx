import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { TypingRacePlayScreen } from "@/features/typing-service";
import { buildServiceCanonicalUrl } from "@/lib/seo";

export const metadata: YeonPageMetadata = {
  title: "YEON 타이핑 레이스 플레이",
  description: "카운트다운과 레인 UI가 포함된 타이핑 레이스 플레이 화면입니다.",
  alternates: {
    canonical: buildServiceCanonicalUrl("typing", "/play"),
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function TypingServicePlayPage() {
  return <TypingRacePlayScreen />;
}
