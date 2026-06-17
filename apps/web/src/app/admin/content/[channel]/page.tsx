import { notFound } from "next/navigation";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import {
  AdminPublicContentChannelScreen,
  AdminPublicContentDenied,
} from "@/features/admin/admin-public-content-screen";
import { getValidPublicContentAdminChannel } from "@/features/public-content/public-content-admin-model";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { getAdminSeedEmails, getCurrentAdminUser } from "@/server/auth/admin";

export const metadata: YeonPageMetadata = {
  title: "공개 콘텐츠 채널 | YEON Admin",
  robots: NON_INDEXABLE_ROBOTS,
};

export default async function AdminContentChannelPage({
  params,
}: {
  params: Promise<{ channel: string }>;
}) {
  const { channel: rawChannel } = await params;
  const channel = getValidPublicContentAdminChannel(rawChannel);

  if (!channel) {
    notFound();
  }

  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    return (
      <AdminPublicContentDenied
        seedEmailCount={Array.from(getAdminSeedEmails()).filter(Boolean).length}
      />
    );
  }

  return (
    <AdminPublicContentChannelScreen
      adminEmail={adminUser.email}
      channel={channel}
    />
  );
}
