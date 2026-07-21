import { Suspense } from "react";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";

import { TodayRecordScreen } from "@/features/today";
import { buildServiceCanonicalUrl } from "@/lib/seo";

const TITLE = "YEON Today - 하루 기록";
const DESCRIPTION =
  "실제로 보낸 시간을 24개 시간 블록과 활동별 색상으로 기록합니다.";

export const metadata: YeonPageMetadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: buildServiceCanonicalUrl("todo", "/record") },
  robots: { index: true, follow: true },
};

export default function TodayRecordPage() {
  return (
    <Suspense fallback={null}>
      <TodayRecordScreen />
    </Suspense>
  );
}
