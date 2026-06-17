import {
  PUBLIC_CONTENT_CHANNELS,
  PUBLIC_CONTENT_RSS_HEADERS,
  buildPublicContentRssFeed,
} from "@/features/public-content";

export const revalidate = 3600;

export function GET() {
  return new Response(buildPublicContentRssFeed(PUBLIC_CONTENT_CHANNELS.news), {
    headers: PUBLIC_CONTENT_RSS_HEADERS,
  });
}
