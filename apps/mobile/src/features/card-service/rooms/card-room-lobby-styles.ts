import { createYeonStyleSheet, yeonMobileAppColors } from "@yeon/ui/native";

export const cardRoomLobbyStyles = createYeonStyleSheet({
  header: {
    gap: 6,
    marginTop: 28,
    paddingTop: 4,
  },
  title: {
    color: yeonMobileAppColors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  filterChipActive: {
    backgroundColor: yeonMobileAppColors.text,
    borderColor: yeonMobileAppColors.text,
  },
  filterChipText: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: yeonMobileAppColors.surfaceStrong,
  },
  roomCard: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  roomBadges: {
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: yeonMobileAppColors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roomTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  roomMeta: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
  },
  roomFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  roomRoles: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  roomJoin: {
    backgroundColor: yeonMobileAppColors.text,
    borderRadius: 10,
    color: yeonMobileAppColors.surfaceStrong,
    fontSize: 13,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
