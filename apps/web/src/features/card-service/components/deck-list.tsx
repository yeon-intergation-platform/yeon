import { type CardDeckDto } from "@yeon/api-contract/card-decks";
import { DeckCard } from "./deck-card";
import { YeonView } from "@yeon/ui";
interface DeckListProps {
  decks: CardDeckDto[];
}

export function DeckList({ decks }: DeckListProps) {
  return (
    <YeonView className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} />
      ))}
    </YeonView>
  );
}
