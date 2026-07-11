import { useYeonLocalSearchParams as useLocalSearchParams } from "@yeon/ui/native";
import { CardRecallScreen } from "../../../../src/features/card-service/card-recall-screen";

export default function CardRecallRoute() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  return <CardRecallScreen deckId={deckId} />;
}
