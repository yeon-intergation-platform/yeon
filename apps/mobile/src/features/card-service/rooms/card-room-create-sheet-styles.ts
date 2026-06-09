import { createYeonStyleSheet, yeonMobileAppColors } from "@yeon/ui/native";

export const cardRoomCreateSheetStyles = createYeonStyleSheet({
  fieldLabel: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  emptyHint: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    paddingVertical: 8,
  },
  deckList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  deckChip: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deckChipActive: {
    backgroundColor: yeonMobileAppColors.text,
    borderColor: yeonMobileAppColors.text,
  },
  deckChipText: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  deckChipTextActive: {
    color: yeonMobileAppColors.surfaceStrong,
  },
  deckChipDisabled: {
    color: yeonMobileAppColors.textMuted,
  },
  visibilityRow: {
    flexDirection: "row",
    gap: 8,
  },
  visibilityChip: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
  },
  visibilityChipActive: {
    backgroundColor: yeonMobileAppColors.text,
    borderColor: yeonMobileAppColors.text,
  },
  visibilityText: {
    color: yeonMobileAppColors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  visibilityTextActive: {
    color: yeonMobileAppColors.surfaceStrong,
  },
});
