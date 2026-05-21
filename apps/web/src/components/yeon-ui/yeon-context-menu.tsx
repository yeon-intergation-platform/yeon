"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { joinClassNames } from "./class-names";

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

interface YeonContextMenuProps {
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
  if (typeof window === "undefined") {
    return { x, y };
  }

  const maxX = Math.max(VIEWPORT_GAP, window.innerWidth - width - VIEWPORT_GAP);
  const maxY = Math.max(
    VIEWPORT_GAP,
    window.innerHeight - height - VIEWPORT_GAP
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
  const menuRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const handleWindowMove = () => onClose();

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleWindowMove);
    window.addEventListener("scroll", handleWindowMove, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleWindowMove);
      window.removeEventListener("scroll", handleWindowMove, true);
    };
  }, [onClose]);

  return (
    <div
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
        <button
          key={item.key}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          className={joinClassNames(
            "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            item.destructive
              ? "text-red-600 hover:bg-red-50"
              : "text-[#111] hover:bg-[#f5f5f5]"
          )}
          onClick={() => {
            if (item.disabled) return;
            void item.onSelect();
            onClose();
          }}
        >
          {item.icon ? (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
              {item.icon}
            </span>
          ) : null}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
