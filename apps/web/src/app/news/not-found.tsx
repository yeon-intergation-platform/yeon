import {
  PUBLIC_CONTENT_CHANNELS,
  PublicContentNotFound,
} from "@/features/public-content";

export default function NewsNotFoundPage() {
  return <PublicContentNotFound channel={PUBLIC_CONTENT_CHANNELS.news} />;
}
