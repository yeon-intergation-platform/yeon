import { DeckPlayScreen } from "@/features/card-service";
import type { Metadata } from "next";

interface DeckPlayPageProps {
  params: Promise<{ deckId: string }>;
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DeckPlayPage({ params }: DeckPlayPageProps) {
  const { deckId } = await params;
  return <DeckPlayScreen deckId={deckId} />;
}
