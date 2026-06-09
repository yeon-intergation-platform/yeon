import type { CardDeckDto } from "@yeon/api-contract/card-decks";
import type { CardRoomVisibility } from "@yeon/api-contract/card-rooms";
import { YeonButton, YeonText, YeonView } from "@yeon/ui/native";

import { CARD_SERVICE_TEXT } from "../card-service-copy";
import { cardRoomCreateSheetStyles as styles } from "./card-room-create-sheet-styles";

type CardRoomCreateDeckSelectorProps = {
  decks: CardDeckDto[];
  selectedDeckId: string | null;
  onSelectDeck: (deckId: string) => void;
};

export function CardRoomCreateDeckSelector({
  decks,
  selectedDeckId,
  onSelectDeck,
}: CardRoomCreateDeckSelectorProps) {
  return (
    <>
      <YeonText style={styles.fieldLabel}>
        {CARD_SERVICE_TEXT.rooms.createDeckLabel}
      </YeonText>
      {decks.length === 0 ? (
        <YeonText style={styles.emptyHint}>
          {CARD_SERVICE_TEXT.rooms.createDeckEmpty}
        </YeonText>
      ) : (
        <YeonView style={styles.deckList}>
          {decks.map((deck) => {
            const active = deck.id === selectedDeckId;
            return (
              <YeonButton
                accessibilityRole="button"
                aria-label={deck.title}
                disabled={deck.itemCount === 0}
                key={deck.id}
                onPress={() => onSelectDeck(deck.id)}
                style={[styles.deckChip, active && styles.deckChipActive]}
              >
                <YeonText
                  style={[
                    styles.deckChipText,
                    active && styles.deckChipTextActive,
                    deck.itemCount === 0 && styles.deckChipDisabled,
                  ]}
                >
                  {deck.title} ({deck.itemCount})
                </YeonText>
              </YeonButton>
            );
          })}
        </YeonView>
      )}
    </>
  );
}

type CardRoomCreateVisibilitySelectorProps = {
  visibility: CardRoomVisibility;
  onChangeVisibility: (visibility: CardRoomVisibility) => void;
};

const CARD_ROOM_VISIBILITY_OPTIONS: CardRoomVisibility[] = [
  "public",
  "private",
];

function getVisibilityLabel(visibility: CardRoomVisibility) {
  return visibility === "public"
    ? CARD_SERVICE_TEXT.rooms.visibilityPublic
    : CARD_SERVICE_TEXT.rooms.visibilityPrivate;
}

export function CardRoomCreateVisibilitySelector({
  visibility,
  onChangeVisibility,
}: CardRoomCreateVisibilitySelectorProps) {
  return (
    <>
      <YeonText style={styles.fieldLabel}>
        {CARD_SERVICE_TEXT.rooms.createVisibilityLabel}
      </YeonText>
      <YeonView style={styles.visibilityRow}>
        {CARD_ROOM_VISIBILITY_OPTIONS.map((value) => {
          const active = visibility === value;
          return (
            <YeonButton
              accessibilityRole="button"
              aria-label={getVisibilityLabel(value)}
              key={value}
              onPress={() => onChangeVisibility(value)}
              style={[
                styles.visibilityChip,
                active && styles.visibilityChipActive,
              ]}
            >
              <YeonText
                style={[
                  styles.visibilityText,
                  active && styles.visibilityTextActive,
                ]}
              >
                {getVisibilityLabel(value)}
              </YeonText>
            </YeonButton>
          );
        })}
      </YeonView>
    </>
  );
}
