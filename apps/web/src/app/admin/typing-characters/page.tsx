import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import {
  AdminAccessDenied,
  AdminPageShell,
} from "@/features/admin/admin-shell";
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
      <AdminAccessDenied description="타자 캐릭터 설정은 admin role 계정만 접근할 수 있습니다." />
    );
  }
  return (
    <AdminPageShell
      adminEmail={admin.email}
      currentHref="/admin/typing-characters"
      sectionLabel="타자 캐릭터"
    >
      <CharacterFrameAdmin />
    </AdminPageShell>
  );
}
