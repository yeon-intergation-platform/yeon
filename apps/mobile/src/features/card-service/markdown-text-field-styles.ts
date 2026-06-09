import { createYeonStyleSheet, yeonMobileAppColors } from "@yeon/ui/native";

export const markdownTextFieldStyles = createYeonStyleSheet({
  wrapper: {
    gap: 8,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  toolButton: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
});
