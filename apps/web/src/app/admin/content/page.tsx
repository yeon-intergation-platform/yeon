import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import {
  AdminPublicContentDashboard,
  AdminPublicContentDenied,
  AdminPublicContentLoadError,
} from "@/features/admin/admin-public-content-screen";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { getAdminSeedEmails, getCurrentAdminUser } from "@/server/auth/admin";
import { loadAdminPublicContentDashboardData } from "./_data";

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

  const { data, errorMessage } = await loadAdminPublicContentDashboardData(
    adminUser.id
  );

  if (!data) {
    return (
      <AdminPublicContentLoadError
        adminEmail={adminUser.email}
        message={errorMessage}
      />
    );
  }

  return (
    <AdminPublicContentDashboard
      adminEmail={adminUser.email}
      dashboard={data}
    />
  );
}
