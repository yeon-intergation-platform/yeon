import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonText, YeonView } from "@yeon/ui";
import { StarLobbyDiscordOps } from "@/features/admin/star-lobby-discord-ops";
import { getCurrentAdminUser } from "@/server/auth/admin";

export const metadata: YeonPageMetadata = {
  title: "스타 로비 운영 | YEON Admin",
  robots: { index: false, follow: false },
};

export default async function AdminStarLobbyPage() {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return (
      <YeonView
        as="main"
        className="flex min-h-screen items-center justify-center bg-white"
      >
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="text-[14px] text-[#111]"
        >
          관리자 권한이 필요합니다.
        </YeonText>
      </YeonView>
    );
  }

  return <StarLobbyDiscordOps />;
}
