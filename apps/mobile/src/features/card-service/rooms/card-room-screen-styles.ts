import { createYeonStyleSheet, yeonMobileAppColors } from "@yeon/ui/native";

export const cardRoomScreenStyles = createYeonStyleSheet({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 28,
    paddingTop: 4,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: yeonMobileAppColors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
  },
  leaveButton: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  leaveText: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  participantRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  participantChip: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  participantName: {
    color: yeonMobileAppColors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  participantRole: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
  },
  roleRow: {
    flexDirection: "row",
    gap: 8,
  },
  roleChip: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
  },
  roleChipActive: {
    backgroundColor: yeonMobileAppColors.text,
    borderColor: yeonMobileAppColors.text,
  },
  roleText: {
    color: yeonMobileAppColors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  roleTextActive: {
    color: yeonMobileAppColors.surfaceStrong,
  },
  progress: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  studyCard: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    padding: 20,
  },
  cardLabel: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  cardFront: {
    color: yeonMobileAppColors.text,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },
  cardDivider: {
    backgroundColor: yeonMobileAppColors.border,
    height: 1,
    marginVertical: 8,
  },
  cardBack: {
    color: yeonMobileAppColors.text,
    fontSize: 18,
    lineHeight: 26,
  },
  roleHint: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  checkerControls: {
    gap: 10,
  },
  resultRow: {
    flexDirection: "row",
    gap: 8,
  },
  resultButton: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
  },
  resultText: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  advanceRow: {
    flexDirection: "row",
    gap: 8,
  },
  advanceButton: {
    flex: 1,
  },
  finishedCard: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 24,
  },
  finishedTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  finishedMessage: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    textAlign: "center",
  },
  chatList: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    minHeight: 80,
    padding: 12,
  },
  chatLine: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  chatSender: {
    color: yeonMobileAppColors.text,
    fontWeight: "700",
  },
  chatSystem: {
    color: yeonMobileAppColors.textMuted,
    fontStyle: "italic",
  },
  chatEmpty: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
  },
  chatInputRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
  },
  chatField: {
    flex: 1,
  },
  chatSend: {
    paddingHorizontal: 18,
  },
});
