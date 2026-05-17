import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";

type ParsedCardInput = Pick<CardDeckItemDto, "frontText" | "backText">;

export function parseAiCardInput(input: string): ParsedCardInput[] {
  const cards: ParsedCardInput[] = [];
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  let frontLines: string[] = [];
  let backLines: string[] = [];
  let currentSection: "front" | "back" | null = null;

  function flushCard() {
    const frontText = frontLines.join("\n").trim();
    const backText = backLines.join("\n").trim();
    if (frontText && backText) {
      cards.push({ backText, frontText });
    }
    frontLines = [];
    backLines = [];
    currentSection = null;
  }

  for (const line of lines) {
    const marker = line.trim();
    if (marker === "[[CARD]]") {
      flushCard();
      continue;
    }
    if (marker === "[[Q]]") {
      if (frontLines.length > 0 || backLines.length > 0) {
        flushCard();
      }
      currentSection = "front";
      continue;
    }
    if (marker === "[[A]]") {
      currentSection = "back";
      continue;
    }

    if (currentSection === "front") {
      frontLines.push(line);
      continue;
    }
    if (currentSection === "back") {
      backLines.push(line);
    }
  }

  flushCard();
  return cards;
}
