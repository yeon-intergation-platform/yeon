import { DeckDetailScreen } from "@/features/card-service";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";

interface DeckDetailPageProps {
  params: Promise<{ deckId: string }>;
}

export const metadata: YeonPageMetadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DeckDetailPage({ params }: DeckDetailPageProps) {
  const { deckId } = await params;
  return <DeckDetailScreen deckId={deckId} />;
}
