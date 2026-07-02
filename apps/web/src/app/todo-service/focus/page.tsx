import { Suspense } from "react";
import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import { TodoFocusRoomScreen } from "@/features/todo-service/todo-focus-room-screen";

const TODO_FOCUS_TITLE = "YEON Today - 집중 화면";
const TODO_FOCUS_DESCRIPTION =
  "오늘 선택한 일을 조용한 집중 화면에서 타이머와 함께 마무리합니다.";

export const metadata: YeonPageMetadata = {
  title: TODO_FOCUS_TITLE,
  description: TODO_FOCUS_DESCRIPTION,
  alternates: {
    canonical: buildServiceCanonicalUrl("todo", "/focus"),
  },
  openGraph: {
    title: TODO_FOCUS_TITLE,
    description: TODO_FOCUS_DESCRIPTION,
    url: buildServiceCanonicalUrl("todo", "/focus"),
    siteName: SITE_BRAND_NAME,
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: TODO_FOCUS_TITLE,
    description: TODO_FOCUS_DESCRIPTION,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function TodoFocusPage() {
  return (
    <Suspense fallback={null}>
      <TodoFocusRoomScreen />
    </Suspense>
  );
}
