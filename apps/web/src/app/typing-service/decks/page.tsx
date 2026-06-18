import { TypingDeckLibraryScreen } from "@/features/typing-service/typing-deck-library-screen";
import { getCurrentAuthUser } from "@/server/auth/session";
import { isAdminUser } from "@/server/auth/admin";
import { createTypingServiceMetadata } from "../typing-service-metadata";

export const metadata = createTypingServiceMetadata({
  title: "YEON Typing Deck Library",
  description:
    "Find default decks, your own decks, and public decks, then start typing practice.",
  robots: {
    index: true,
    follow: true,
  },
  path: "/decks",
});

export default async function TypingDecksPage() {
  const currentUser = await getCurrentAuthUser();
  const showAdminEntry = currentUser ? await isAdminUser(currentUser) : false;

  return <TypingDeckLibraryScreen showAdminEntry={showAdminEntry} />;
}
