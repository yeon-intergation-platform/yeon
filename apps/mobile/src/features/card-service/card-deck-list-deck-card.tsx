import type { CardDeckDto } from "@yeon/api-contract/card-decks";
import { YeonButton, YeonImage, YeonText, YeonView } from "@yeon/ui/native";
import { formatCardDeckMeta } from "@yeon/ui/runtime/ports/card-deck";

import { DECK_THUMBS } from "./card-deck-list-assets";
import { styles } from "./card-deck-list-screen.styles";
import { CARD_SERVICE_TEXT } from "./card-service-copy";

type DeckCardProps = {
  deck: CardDeckDto;
  index: number;
  onOpen: () => void;
};

export function DeckCard({ deck, index, onOpen }: DeckCardProps) {
  return (
    <YeonButton
      accessibilityRole="button"
      aria-label={`${CARD_SERVICE_TEXT.shared.openDeckLabel}: ${deck.title}`}
      onPress={onOpen}
      style={styles.deckCard}
    >
      <YeonImage
        resizeMode="contain"
        source={DECK_THUMBS[index % DECK_THUMBS.length]}
        style={styles.deckThumb}
      />
      <YeonView style={styles.deckBody}>
        <YeonText numberOfLines={1} style={styles.deckTitle}>
          {deck.title}
        </YeonText>
        <YeonText numberOfLines={1} style={styles.deckMeta}>
          {formatCardDeckMeta(deck)}
        </YeonText>
      </YeonView>
      <YeonView style={styles.deckAction}>
        <YeonText style={styles.deckActionText}>
          {CARD_SERVICE_TEXT.shared.openDeckLabel}
        </YeonText>
      </YeonView>
    </YeonButton>
  );
}
