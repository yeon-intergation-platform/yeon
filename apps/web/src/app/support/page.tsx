import {
  PUBLIC_CONTENT_CHANNELS,
  PublicContentHome,
  getPublicContentHomeMetadata,
} from "@/features/public-content";

export const metadata = getPublicContentHomeMetadata(
  PUBLIC_CONTENT_CHANNELS.support
);

export default function SupportHomePage() {
  return <PublicContentHome channel={PUBLIC_CONTENT_CHANNELS.support} />;
}
