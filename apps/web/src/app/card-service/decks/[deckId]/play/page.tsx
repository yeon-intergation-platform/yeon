import { DeckPlayScreen } from "@/features/card-service";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";

interface DeckPlayPageProps {
  params: Promise<{ deckId: string }>;
}

export const metadata: YeonPageMetadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DeckPlayPage({ params }: DeckPlayPageProps) {
  const { deckId } = await params;
  return <DeckPlayScreen deckId={deckId} />;
}
