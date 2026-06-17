import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import {
  AdminPublicContentDashboard,
  AdminPublicContentDenied,
} from "@/features/admin/admin-public-content-screen";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { getAdminSeedEmails, getCurrentAdminUser } from "@/server/auth/admin";

export const metadata: YeonPageMetadata = {
  title: "공개 콘텐츠 | YEON Admin",
  robots: NON_INDEXABLE_ROBOTS,
};

export default async function AdminContentPage() {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    return (
      <AdminPublicContentDenied
        seedEmailCount={Array.from(getAdminSeedEmails()).filter(Boolean).length}
      />
    );
  }

  return <AdminPublicContentDashboard adminEmail={adminUser.email} />;
}
