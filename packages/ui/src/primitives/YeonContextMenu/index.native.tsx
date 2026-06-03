import type { ReactNode } from "react";

import { YeonButton } from "../YeonButton/index.native";
import { YeonText } from "../YeonText/index.native";
import { YeonView } from "../YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors, yeonMobileAppShadow } from "../../theme";

export interface YeonContextMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  onSelect: () => Promise<void> | void;
}

export interface YeonContextMenuPosition {
  x: number;
  y: number;
}

export interface YeonContextMenuProps {
  position: YeonContextMenuPosition;
  items: YeonContextMenuItem[];
  onClose: () => void;
  ariaLabel?: string;
  className?: string;
}

export function YeonContextMenu({
  position,
  items,
  onClose,
  ariaLabel = "컨텍스트 메뉴",
}: YeonContextMenuProps) {
  return (
    <YeonView
      accessibilityLabel={ariaLabel}
      accessibilityRole="menu"
      style={[styles.menu, { left: position.x, top: position.y }]}
    >
      {items.map((item) => (
        <YeonButton
          accessibilityRole="menuitem"
          disabled={item.disabled}
          key={item.key}
          onPress={() => {
            if (item.disabled) return;
            void item.onSelect();
            onClose();
          }}
          size="sm"
          style={styles.item}
          textStyle={[
            styles.itemText,
            item.destructive ? styles.destructiveText : null,
          ]}
          variant="ghost"
        >
          {item.icon ? (
            <YeonView style={styles.icon}>{item.icon}</YeonView>
          ) : null}
          <YeonText
            style={[
              styles.itemText,
              item.destructive ? styles.destructiveText : null,
            ]}
            variant="caption"
          >
            {item.label}
          </YeonText>
        </YeonButton>
      ))}
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  destructiveText: {
    color: yeonMobileAppColors.text,
  },
  icon: {
    alignItems: "center",
    height: 16,
    justifyContent: "center",
    width: 16,
  },
  item: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.white,
    borderRadius: 0,
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-start",
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemText: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  menu: {
    ...yeonMobileAppShadow,
    backgroundColor: yeonMobileAppColors.white,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 168,
    overflow: "hidden",
    position: "absolute",
    zIndex: 140,
  },
});
