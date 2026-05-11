import { DeckDetailScreen } from "@/features/card-service";
import type { Metadata } from "next";

interface DeckDetailPageProps {
  params: Promise<{ deckId: string }>;
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DeckDetailPage({ params }: DeckDetailPageProps) {
  const { deckId } = await params;
  return <DeckDetailScreen deckId={deckId} />;
}
