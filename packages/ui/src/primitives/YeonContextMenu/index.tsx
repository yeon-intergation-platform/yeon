"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useYeonWindowEvent } from "../../hooks/YeonBrowserHooks";
import { getYeonViewportSize } from "../../runtime/YeonBrowserRuntime";
import { joinClassNames } from "../../utils";
import { YeonButton } from "../YeonButton";
import { YeonText } from "../YeonText";
import { YeonView } from "../YeonView";

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

const VIEWPORT_GAP = 8;

function getClampedPosition({
  x,
  y,
  width,
  height,
}: YeonContextMenuPosition & { width: number; height: number }) {
  const viewportSize = getYeonViewportSize();
  if (!viewportSize) {
    return { x, y };
  }

  const maxX = Math.max(
    VIEWPORT_GAP,
    viewportSize.width - width - VIEWPORT_GAP
  );
  const maxY = Math.max(
    VIEWPORT_GAP,
    viewportSize.height - height - VIEWPORT_GAP
  );

  return {
    x: Math.min(Math.max(VIEWPORT_GAP, x), maxX),
    y: Math.min(Math.max(VIEWPORT_GAP, y), maxY),
  };
}

export function YeonContextMenu({
  position,
  items,
  onClose,
  ariaLabel = "컨텍스트 메뉴",
  className,
}: YeonContextMenuProps) {
  const menuRef = useRef<HTMLElement | null>(null);
  const [clampedPosition, setClampedPosition] = useState(position);

  useLayoutEffect(() => {
    const menuElement = menuRef.current;
    if (!menuElement) {
      setClampedPosition(position);
      return;
    }

    const rect = menuElement.getBoundingClientRect();
    setClampedPosition(
      getClampedPosition({
        ...position,
        width: rect.width,
        height: rect.height,
      })
    );
  }, [position]);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }
      onClose();
    },
    [onClose]
  );
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );
  const handleWindowMove = useCallback(() => onClose(), [onClose]);

  useYeonWindowEvent("pointerdown", handlePointerDown);
  useYeonWindowEvent("keydown", handleKeyDown);
  useYeonWindowEvent("resize", handleWindowMove);
  useYeonWindowEvent("scroll", handleWindowMove, true, true);

  return (
    <YeonView
      ref={menuRef}
      role="menu"
      aria-label={ariaLabel}
      className={joinClassNames(
        "fixed z-[140] min-w-[168px] overflow-hidden rounded-xl border border-[#e5e5e5] bg-white py-1 shadow-[0_18px_45px_rgba(17,17,17,0.18)]",
        className
      )}
      style={{ left: clampedPosition.x, top: clampedPosition.y }}
    >
      {items.map((item) => (
        <YeonButton
          key={item.key}
          type="button"
          role="menuitem"
          variant="ghost"
          size="sm"
          disabled={item.disabled}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold text-[#111] transition-colors hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            if (item.disabled) return;
            void item.onSelect();
            onClose();
          }}
        >
          {item.icon ? (
            <YeonView className="flex h-4 w-4 shrink-0 items-center justify-center">
              {item.icon}
            </YeonView>
          ) : null}
          <YeonText as="span" variant="caption" className="text-[#111]">
            {item.label}
          </YeonText>
        </YeonButton>
      ))}
    </YeonView>
  );
}
