import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";
import { useCallback, useState } from "react";

export const SHEET_MODES = {
  bulk: "bulk",
  manual: "manual",
} as const;

export type SheetMode = (typeof SHEET_MODES)[keyof typeof SHEET_MODES];
export type SheetState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; item: CardDeckItemDto };

export function useCardDeckDetailSheetState() {
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [sheetMode, setSheetMode] = useState<SheetMode>(SHEET_MODES.manual);
  const [sheetState, setSheetState] = useState<SheetState>({ kind: "closed" });
  const [activeMenuItemId, setActiveMenuItemId] = useState<string | null>(null);

  const openCreateSheet = useCallback(() => {
    setFrontText("");
    setBackText("");
    setSheetMode(SHEET_MODES.manual);
    setSheetState({ kind: "create" });
  }, []);

  const openEditSheet = useCallback((item: CardDeckItemDto) => {
    setFrontText(item.frontText);
    setBackText(item.backText);
    setSheetMode(SHEET_MODES.manual);
    setActiveMenuItemId(null);
    setSheetState({ item, kind: "edit" });
  }, []);

  const toggleMenu = useCallback((itemId: string) => {
    setActiveMenuItemId((current) => (current === itemId ? null : itemId));
  }, []);

  const closeSheet = useCallback(() => {
    setSheetState({ kind: "closed" });
    setFrontText("");
    setBackText("");
  }, []);

  return {
    activeMenuItemId,
    backText,
    bulkText,
    closeSheet,
    frontText,
    openCreateSheet,
    openEditSheet,
    setActiveMenuItemId,
    setBackText,
    setBulkText,
    setFrontText,
    setSheetMode,
    sheetMode,
    sheetState,
    toggleMenu,
  };
}
