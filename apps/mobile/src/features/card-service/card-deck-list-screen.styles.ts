import { createYeonStyleSheet, yeonMobileAppColors } from "@yeon/ui/native";

export const styles = createYeonStyleSheet({
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
    minHeight: 96,
    paddingTop: 4,
  },
  headerTextBlock: {
    flex: 1,
    gap: 8,
    paddingRight: 12,
    paddingTop: 6,
  },
  brand: {
    color: yeonMobileAppColors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  welcome: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  headerMascot: {
    height: 84,
    marginTop: 2,
    width: 84,
  },
  resumeCard: {
    padding: 16,
  },
  resumeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  resumeIcon: {
    height: 30,
    width: 30,
  },
  resumeBody: {
    flex: 1,
    gap: 3,
  },
  resumeLabel: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  resumeTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  resumeMeta: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
  },
  resumeButton: {
    paddingHorizontal: 18,
  },
  syncBanner: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  syncIcon: {
    height: 22,
    width: 24,
  },
  syncText: {
    color: yeonMobileAppColors.textMuted,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  syncLink: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  sectionHeader: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionCount: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  emptyMascot: {
    height: 160,
    marginBottom: 8,
    width: 160,
  },
  emptyTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyMessage: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 12,
    paddingHorizontal: 22,
  },
  deckCard: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 16,
  },
  deckThumb: {
    height: 46,
    width: 46,
  },
  deckBody: {
    flex: 1,
    gap: 4,
  },
  deckTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  deckMeta: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
  },
  deckAction: {
    alignItems: "center",
    borderColor: yeonMobileAppColors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deckActionText: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    fontWeight: "700",
  },
});
