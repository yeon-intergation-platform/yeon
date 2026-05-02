import type { Metadata } from "next";

import { CharacterFrameAdmin } from "@/features/typing-service/character-frame-admin";
import { getCurrentAdminUser } from "@/server/auth/admin";

export const metadata: Metadata = {
  title: "캐릭터 프레임 설정 | YEON Admin",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-[14px] text-[#111]">관리자 권한이 필요합니다.</p>
      </main>
    );
  }
  return <CharacterFrameAdmin />;
}
