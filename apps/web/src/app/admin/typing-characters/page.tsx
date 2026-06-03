import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonText, YeonView } from "@yeon/ui";
import { CharacterFrameAdmin } from "@/features/typing-service/character-frame-admin";
import { getCurrentAdminUser } from "@/server/auth/admin";

export const metadata: YeonPageMetadata = {
  title: "캐릭터 프레임 설정 | YEON Admin",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return (
      <YeonView
        as="main"
        className="flex min-h-screen items-center justify-center bg-white"
      >
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="text-[14px] text-[#111]"
        >
          관리자 권한이 필요합니다.
        </YeonText>
      </YeonView>
    );
  }
  return <CharacterFrameAdmin />;
}
