import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { CardServiceDecksScreen } from "@/features/card-service";
import { buildServiceCanonicalUrl } from "@/lib/seo";

export const metadata: YeonPageMetadata = {
  title: "YEON 카드 덱",
  description: "내 플래시카드 덱을 만들고 관리하는 카드 서비스 덱 화면입니다.",
  alternates: {
    canonical: buildServiceCanonicalUrl("card", "/decks"),
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CardServiceDecksPage() {
  return <CardServiceDecksScreen />;
}
