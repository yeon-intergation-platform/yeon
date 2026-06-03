import { useYeonLocalSearchParams as useLocalSearchParams } from "@yeon/ui/native";
import { CardDeckPlayScreen } from "../../../../src/features/card-service/card-deck-play-screen";

export default function CardDeckPlayRoute() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();

  return <CardDeckPlayScreen deckId={deckId} />;
}
