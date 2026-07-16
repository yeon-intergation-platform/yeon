import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { AdminPublicContentEditor } from "@/features/admin/admin-public-content-editor";
import {
  AdminPublicContentDenied,
  AdminPublicContentLoadError,
} from "@/features/admin/admin-public-content-screen";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { getAdminSeedEmails, getCurrentAdminUser } from "@/server/auth/admin";
import {
  PublicContentSpringBackendHttpError,
  fetchAdminPublicContentArticleFromSpring,
  fetchAdminPublicContentRevisionsFromSpring,
} from "@/server/public-content-spring-client";

export const metadata: YeonPageMetadata = {
  title: "공개 콘텐츠 편집 | YEON Admin",
  robots: NON_INDEXABLE_ROBOTS,
};

export default async function EditAdminContentPage({
  params,
}: {
  params: Promise<{ channel: string }>;
}) {
  const adminUser = await getCurrentAdminUser();
  if (!adminUser) {
    return (
      <AdminPublicContentDenied
        seedEmailCount={Array.from(getAdminSeedEmails()).filter(Boolean).length}
      />
    );
  }

  try {
    const articleId = (await params).channel;
    const [response, revisions] = await Promise.all([
      fetchAdminPublicContentArticleFromSpring({
        userId: adminUser.id,
        articleId,
      }),
      fetchAdminPublicContentRevisionsFromSpring({
        userId: adminUser.id,
        articleId,
      }),
    ]);
    return (
      <AdminPublicContentEditor
        adminEmail={adminUser.email}
        defaultChannel={response.article.channel}
        initialArticle={response.article}
        initialRevisions={revisions.revisions}
      />
    );
  } catch (error) {
    return (
      <AdminPublicContentLoadError
        adminEmail={adminUser.email}
        message={
          error instanceof PublicContentSpringBackendHttpError
            ? error.message
            : "공개 콘텐츠 글을 불러오지 못했습니다."
        }
      />
    );
  }
}
