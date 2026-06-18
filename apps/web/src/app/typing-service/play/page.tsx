import { TypingRacePlayScreen } from "@/features/typing-service";
import { createTypingServiceMetadata } from "../typing-service-metadata";

export const metadata = createTypingServiceMetadata({
  title: "YEON Typing Race Play",
  description: "Play a typing race with countdown and lane-based progress UI.",
  robots: {
    index: false,
    follow: true,
  },
  path: "/play",
});

export default function TypingServicePlayPage() {
  return <TypingRacePlayScreen />;
}
