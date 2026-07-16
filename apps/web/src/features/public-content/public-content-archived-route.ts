import { permanentRedirectYeon } from "@yeon/ui/runtime/YeonRouteControl";
import { loadPublicContentArchivedRedirect } from "@/server/public-content-public-read";
import type { PublicContentChannel } from "./public-content-data";

export async function redirectArchivedPublicContentIfConfigured({
  channel,
  slugSegments,
}: {
  channel: PublicContentChannel;
  slugSegments: readonly string[];
}) {
  const redirectTo = await loadPublicContentArchivedRedirect({
    channel,
    slug: slugSegments.join("/"),
  });
  if (redirectTo) {
    permanentRedirectYeon(redirectTo);
  }
}
