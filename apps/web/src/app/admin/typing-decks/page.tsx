import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import {
  AdminAccessDenied,
  AdminPageShell,
} from "@/features/admin/admin-shell";
import { TypingDecksScreen } from "@/features/typing-service/typing-decks-screen";
import { getCurrentAdminUser, getAdminSeedEmails } from "@/server/auth/admin";

export const metadata: YeonPageMetadata = {
  title: "타자 덱 관리자 | YEON",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminTypingDecksPage() {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    return (
      <AdminAccessDenied
        description="타자 덱 관리자 페이지는 admin role 계정만 접근할 수 있습니다."
        seedEmailCount={Array.from(getAdminSeedEmails()).filter(Boolean).length}
      />
    );
  }

  return (
    <AdminPageShell
      adminEmail={adminUser.email}
      currentHref="/admin/typing-decks"
      sectionLabel="타자 덱"
    >
      <TypingDecksScreen adminMode />
    </AdminPageShell>
  );
}
