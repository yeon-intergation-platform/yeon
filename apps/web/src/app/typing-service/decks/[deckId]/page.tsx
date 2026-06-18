import { TypingDeckDetailPageClient } from "@/features/typing-service/typing-deck-detail-page-client";
import { getCurrentAuthUser } from "@/server/auth/session";
import { isAdminUser } from "@/server/auth/admin";
import { createTypingServiceMetadata } from "../../typing-service-metadata";

export const metadata = createTypingServiceMetadata({
  title: "YEON Typing Deck Details",
  description: "Manage the selected typing deck and its practice passages.",
  robots: {
    index: false,
    follow: true,
  },
  includeCanonical: false,
  path: "/decks",
});

type TypingDeckDetailPageProps = {
  params: Promise<{ deckId: string }>;
  searchParams: Promise<{
    admin?: string | string[];
  }>;
};

function pickFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TypingDeckDetailPage({
  params,
  searchParams,
}: TypingDeckDetailPageProps) {
  const [{ deckId }, resolvedSearchParams, currentUser] = await Promise.all([
    params,
    searchParams,
    getCurrentAuthUser(),
  ]);
  const showAdminEntry = currentUser ? await isAdminUser(currentUser) : false;
  const adminMode =
    showAdminEntry && pickFirstValue(resolvedSearchParams.admin) === "1";

  return (
    <TypingDeckDetailPageClient
      adminMode={adminMode}
      deckId={deckId}
      showAdminEntry={showAdminEntry}
    />
  );
}
