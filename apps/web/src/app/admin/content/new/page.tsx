import { publicContentChannelSchema } from "@yeon/api-contract/public-content";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { AdminPublicContentEditor } from "@/features/admin/admin-public-content-editor";
import { AdminPublicContentDenied } from "@/features/admin/admin-public-content-screen";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { getAdminSeedEmails, getCurrentAdminUser } from "@/server/auth/admin";

export const metadata: YeonPageMetadata = {
  title: "새 공개 콘텐츠 | YEON Admin",
  robots: NON_INDEXABLE_ROBOTS,
};

export default async function NewAdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  const adminUser = await getCurrentAdminUser();
  if (!adminUser) {
    return (
      <AdminPublicContentDenied
        seedEmailCount={Array.from(getAdminSeedEmails()).filter(Boolean).length}
      />
    );
  }

  const requestedChannel = publicContentChannelSchema.safeParse(
    (await searchParams).channel
  );
  return (
    <AdminPublicContentEditor
      adminEmail={adminUser.email}
      defaultChannel={
        requestedChannel.success ? requestedChannel.data : "support"
      }
      initialArticle={null}
      initialRevisions={[]}
    />
  );
}
