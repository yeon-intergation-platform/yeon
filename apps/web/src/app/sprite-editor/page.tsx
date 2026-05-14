import type { Metadata } from "next";

import { SpriteFrameEditor } from "@/features/sprite-editor/sprite-frame-editor";

export const metadata: Metadata = {
  title: "AI 스프라이트 QA 에디터 | YEON",
  robots: { index: false, follow: false },
};

export default function SpriteEditorPage() {
  return <SpriteFrameEditor />;
}
