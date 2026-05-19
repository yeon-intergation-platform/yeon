import type { Metadata } from "next";

import { StarLobbyDiscordOps } from "@/features/admin/star-lobby-discord-ops";
import { getCurrentAdminUser } from "@/server/auth/admin";

export const metadata: Metadata = {
  title: "스타 로비 운영 | YEON Admin",
  robots: { index: false, follow: false },
};

export default async function AdminStarLobbyPage() {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-[14px] text-[#111]">관리자 권한이 필요합니다.</p>
      </main>
    );
  }

  return <StarLobbyDiscordOps />;
}
