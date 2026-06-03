import { YeonLink } from "@yeon/ui";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import { formatCardDeckMeta } from "@yeon/ui/runtime/ports/card-deck";
import type { CardDeckDto } from "@yeon/api-contract/card-decks";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { getYeonSurfaceClassName, YeonText } from "@yeon/ui";
interface DeckCardProps {
  deck: CardDeckDto;
}

export function DeckCard({ deck }: DeckCardProps) {
  return (
    <YeonLink
      href={resolveYeonWebPath("cardDeckDetail", { deckId: deck.id })}
      className={getYeonSurfaceClassName({
        className:
          "block p-5 text-[#111] no-underline transition-colors hover:border-[#111]",
      })}
      onClick={() =>
        trackEvent(analyticsEvents.cardDeckOpen, {
          deck_id: deck.id,
          item_count: deck.itemCount,
          source: "deck_list",
        })
      }
    >
      <YeonText
        as="h3"
        variant="unstyled"
        tone="inherit"
        className="text-[16px] font-semibold"
      >
        {deck.title}
      </YeonText>
      {deck.description ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`mt-2 line-clamp-2 ${SHARED_FEATURE_CLASS.text13Neutral}`}
        >
          {deck.description}
        </YeonText>
      ) : null}
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className={`mt-4 ${SHARED_FEATURE_CLASS.text12Soft}`}
      >
        {formatCardDeckMeta(deck)}
      </YeonText>
    </YeonLink>
  );
}
