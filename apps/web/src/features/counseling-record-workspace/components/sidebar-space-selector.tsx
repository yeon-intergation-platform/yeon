"use client";

import type { MouseEvent, RefObject } from "react";
import type { Space } from "@/features/counseling-record-workspace/hooks/use-current-space";

interface SidebarSpaceSelectorProps {
  rootRef: RefObject<HTMLDivElement | null>;
  spaces: Space[];
  currentSpace: Space | null;
  isOpen: boolean;
  isSpaceSelection: boolean;
  selectedIdSet: ReadonlySet<string>;
  onToggleOpen: () => void;
  onClose: () => void;
  onOpenCreateSpace: () => void;
  onSpaceChange: (id: string) => void;
  onClearSelection: () => void;
  onHandleSelectableClick: (params: {
    event: MouseEvent;
    kind: "space";
    id: string;
    index: number;
    orderedIds: string[];
    onDefault: () => void;
  }) => void;
  onOpenContextMenu: (
    event: MouseEvent,
    target: {
      kind: "space";
      id: string;
      label: string;
      index: number;
    }
  ) => void;
}

export function SidebarSpaceSelector({
  rootRef,
  spaces,
  currentSpace,
  isOpen,
  isSpaceSelection,
  selectedIdSet,
  onToggleOpen,
  onClose,
  onOpenCreateSpace,
  onSpaceChange,
  onClearSelection,
  onHandleSelectableClick,
  onOpenContextMenu,
}: SidebarSpaceSelectorProps) {
  const orderedIds = spaces.map((space) => space.id);

  return (
    <div className="px-3 pt-3 pb-2 border-b border-border">
      <div className="relative min-w-0 flex-1" ref={rootRef}>
        <button
          className="w-full flex items-center justify-between gap-2 px-3 py-[7px] rounded-md bg-surface-3 border border-border-light text-sm font-medium text-text hover:bg-surface-4 transition-colors cursor-pointer"
          onClick={onToggleOpen}
        >
          <span className="truncate">
            {currentSpace?.name ?? "스페이스 선택"}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`flex-shrink-0 text-text-dim transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          >
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="scrollbar-subtle absolute top-[calc(100%+4px)] left-0 right-0 bg-surface-3 border border-border-light rounded-md py-1 z-50 shadow-[0_8px_24px_rgba(0,0,0,0.35)] max-h-48 overflow-y-auto">
            {spaces.length === 0 ? (
              <div className="px-3 py-2 text-xs text-text-dim">
                스페이스 없음
              </div>
            ) : (
              spaces.map((space, index) => (
                <button
                  key={space.id}
                  className={`w-full px-3 py-[7px] text-left text-sm transition-colors cursor-pointer font-[inherit] border-none ${
                    space.id === currentSpace?.id
                      ? "bg-surface-4"
                      : isSpaceSelection && selectedIdSet.has(space.id)
                        ? "bg-accent-dim"
                        : "bg-transparent hover:bg-surface-4"
                  } ${
                    space.id === currentSpace?.id ? "text-accent" : "text-text"
                  }`}
                  onDragStart={(event) => {
                    event.preventDefault();
                  }}
                  onClick={(event) =>
                    onHandleSelectableClick({
                      event,
                      kind: "space",
                      id: space.id,
                      index,
                      orderedIds,
                      onDefault: () => {
                        onSpaceChange(space.id);
                        onClearSelection();
                        onClose();
                      },
                    })
                  }
                  onContextMenu={(event) =>
                    onOpenContextMenu(event, {
                      kind: "space",
                      id: space.id,
                      label: space.name,
                      index,
                    })
                  }
                >
                  {space.name}
                </button>
              ))
            )}
            <div className="border-t border-border mt-1 pt-1">
              <button
                className="w-full px-3 py-[7px] text-left text-xs text-accent hover:bg-surface-4 transition-colors cursor-pointer font-[inherit] border-none bg-transparent"
                onClick={() => {
                  onClose();
                  onOpenCreateSpace();
                }}
              >
                + 새 스페이스 만들기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
