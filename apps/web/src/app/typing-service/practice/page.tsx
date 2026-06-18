import { TypingRaceSoloScreen } from "@/features/typing-service/typing-race-solo-screen";
import { createTypingServiceMetadata } from "../typing-service-metadata";

export const metadata = createTypingServiceMetadata({
  title: "YEON Solo Typing Practice",
  description: "Start solo typing practice with the selected deck.",
  robots: {
    index: false,
    follow: true,
  },
  path: "/practice",
});

type TypingServicePracticePageProps = {
  searchParams: Promise<{
    deckId?: string | string[];
  }>;
};

function pickFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeDeckId(value: string | string[] | undefined) {
  const deckId = pickFirstValue(value)?.trim();
  return deckId ? deckId : null;
}

export default async function TypingServicePracticePage({
  searchParams,
}: TypingServicePracticePageProps) {
  const resolvedSearchParams = await searchParams;
  const practiceDeckId = normalizeDeckId(resolvedSearchParams.deckId);

  return <TypingRaceSoloScreen practiceDeckId={practiceDeckId} />;
}
