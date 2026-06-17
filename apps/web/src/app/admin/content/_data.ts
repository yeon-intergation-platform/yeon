import type { PublicContentChannel } from "@/features/public-content/public-content-data";
import {
  PUBLIC_CONTENT_ADMIN_CHANNEL_ORDER,
  buildPublicContentAdminChannelData,
  buildPublicContentAdminDashboardData,
  type PublicContentAdminDashboardData,
} from "@/features/public-content/public-content-admin-model";
import {
  PublicContentSpringBackendHttpError,
  fetchAdminPublicContentArticlesFromSpring,
  fetchPublicContentSitemapFromSpring,
} from "@/server/public-content-spring-client";

type AdminContentLoadResult<TData> =
  | {
      data: TData;
      errorMessage: null;
    }
  | {
      data: null;
      errorMessage: string;
    };

function toLoadErrorMessage(error: unknown) {
  if (error instanceof PublicContentSpringBackendHttpError) {
    return error.message;
  }

  console.error(error);
  return "공개 콘텐츠 admin 데이터를 불러오는 중 서버 오류가 발생했습니다.";
}

async function fetchSitemapEntries(channels: readonly PublicContentChannel[]) {
  const results = await Promise.allSettled(
    channels.map((channel) => fetchPublicContentSitemapFromSpring(channel))
  );

  return results.flatMap((result) =>
    result.status === "fulfilled" ? result.value.entries : []
  );
}

export async function loadAdminPublicContentDashboardData(
  userId: string
): Promise<AdminContentLoadResult<PublicContentAdminDashboardData>> {
  try {
    const [articlesResponse, sitemapEntries] = await Promise.all([
      fetchAdminPublicContentArticlesFromSpring({ userId }),
      fetchSitemapEntries(PUBLIC_CONTENT_ADMIN_CHANNEL_ORDER),
    ]);

    return {
      data: buildPublicContentAdminDashboardData({
        articles: articlesResponse.articles,
        sitemapEntries,
      }),
      errorMessage: null,
    };
  } catch (error) {
    return {
      data: null,
      errorMessage: toLoadErrorMessage(error),
    };
  }
}

export async function loadAdminPublicContentChannelData(
  userId: string,
  channel: PublicContentChannel
): Promise<
  AdminContentLoadResult<ReturnType<typeof buildPublicContentAdminChannelData>>
> {
  try {
    const [articlesResponse, sitemapEntries] = await Promise.all([
      fetchAdminPublicContentArticlesFromSpring({
        userId,
        query: { channel },
      }),
      fetchSitemapEntries([channel]),
    ]);

    return {
      data: buildPublicContentAdminChannelData({
        articles: articlesResponse.articles,
        channel,
        sitemapEntries,
      }),
      errorMessage: null,
    };
  } catch (error) {
    return {
      data: null,
      errorMessage: toLoadErrorMessage(error),
    };
  }
}
