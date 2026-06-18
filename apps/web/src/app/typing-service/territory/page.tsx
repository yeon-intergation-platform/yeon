import { TypingTerritoryBattleScreen } from "@/features/typing-service/typing-territory-battle-screen";
import { createTypingServiceMetadata } from "../typing-service-metadata";

export const metadata = createTypingServiceMetadata({
  title: "Territory Battle | YEON Typing",
  description:
    "Type words accurately and capture team board tiles in a real-time typing mode.",
  path: "/territory",
});

type TypingTerritoryBattlePageProps = {
  searchParams?: Promise<{ roomId?: string }>;
};

export default async function TypingTerritoryBattlePage({
  searchParams,
}: TypingTerritoryBattlePageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <TypingTerritoryBattleScreen
      originRoomId={resolvedSearchParams?.roomId ?? null}
    />
  );
}
