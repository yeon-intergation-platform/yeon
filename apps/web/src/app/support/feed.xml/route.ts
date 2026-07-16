import {
  PUBLIC_CONTENT_CHANNELS,
  PUBLIC_CONTENT_RSS_HEADERS,
  buildPublicContentRssFeed,
} from "@/features/public-content";
import { loadPublishedPublicContentArticles } from "@/features/public-content/public-content-runtime";

export const revalidate = 3600;

export async function GET() {
  const articles = await loadPublishedPublicContentArticles(
    PUBLIC_CONTENT_CHANNELS.support
  );
  return new Response(
    buildPublicContentRssFeed(PUBLIC_CONTENT_CHANNELS.support, articles),
    {
      headers: PUBLIC_CONTENT_RSS_HEADERS,
    }
  );
}
