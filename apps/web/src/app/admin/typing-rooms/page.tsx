import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import {
  AdminAccessDenied,
  AdminPageShell,
} from "@/features/admin/admin-shell";
import { TypingRoomTeamAdminScreen } from "@/features/admin/typing-room-team-admin-screen";
import { getCurrentAdminUser } from "@/server/auth/admin";

export const metadata: YeonPageMetadata = {
  title: "타자방 운영 | YEON Admin",
  robots: { index: false, follow: false },
};

export default async function AdminTypingRoomsPage() {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return (
      <AdminAccessDenied description="타자방 운영 화면은 admin role 계정만 접근할 수 있습니다." />
    );
  }

  return (
    <AdminPageShell
      adminEmail={admin.email}
      currentHref="/admin/typing-rooms"
      sectionLabel="타자방 운영"
    >
      <TypingRoomTeamAdminScreen adminEmail={admin.email} />
    </AdminPageShell>
  );
}
