import {
  PUBLIC_CONTENT_CHANNELS,
  PublicContentHome,
  getPublicContentHomeMetadata,
} from "@/features/public-content";

export const metadata = getPublicContentHomeMetadata(
  PUBLIC_CONTENT_CHANNELS.blog
);

export default function BlogHomePage() {
  return <PublicContentHome channel={PUBLIC_CONTENT_CHANNELS.blog} />;
}
