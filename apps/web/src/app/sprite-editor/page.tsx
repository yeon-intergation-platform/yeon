import type { Metadata } from "next";

import { SpriteFrameEditor } from "@/features/sprite-editor/sprite-frame-editor";

export const metadata: Metadata = {
  title: "스프라이트 프레임 편집기 | YEON",
  robots: { index: false, follow: false },
};

export default function SpriteEditorPage() {
  return <SpriteFrameEditor />;
}
