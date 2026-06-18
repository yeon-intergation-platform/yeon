import { TypingRoomLobbyScreen } from "@/features/typing-service";
import { createTypingServiceMetadata } from "../typing-service-metadata";

export const metadata = createTypingServiceMetadata({
  title: "YEON Typing Room Lobby",
  description:
    "Create or join real-time typing rooms and type the same prompts together.",
  robots: {
    index: true,
    follow: true,
  },
  path: "/rooms",
});

export default function TypingRoomLobbyPage() {
  return <TypingRoomLobbyScreen />;
}
