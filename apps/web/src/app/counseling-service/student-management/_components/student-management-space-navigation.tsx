"use client";

import type { MouseEvent } from "react";
import {
  ChevronsUpDown,
  ClipboardCheck,
  Ellipsis,
  FileClock,
  Plus,
  Users,
  X,
} from "lucide-react";

import type { Space } from "@/features/student-management/types";
import type {
  SpaceSelectionState,
  SpaceDialogTarget,
} from "../_lib/space-sidebar-types";

type SpaceClickHandler = (
  event: MouseEvent<HTMLButtonElement>,
  spaceId: string,
  index: number
) => void;

type SpaceContextMenuHandler = (
  event: MouseEvent<HTMLButtonElement>,
  spaceId: string,
  spaceName: string
) => void;

interface StudentManagementMobileRouteTabsProps {
  isCheckBoardRoute: boolean;
  currentSpaceName: string;
  onNavigateStudents: () => void;
  onNavigateCheckBoard: () => void;
  onOpenSpaceDrawer: () => void;
}

export function StudentManagementMobileRouteTabs({
  isCheckBoardRoute,
  currentSpaceName,
  onNavigateStudents,
  onNavigateCheckBoard,
  onOpenSpaceDrawer,
}: StudentManagementMobileRouteTabsProps) {
  return (
    <div className="border-b border-border bg-surface px-3 py-3 md:hidden">
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface-2 p-1">
        <button
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${
            !isCheckBoardRoute
              ? "bg-accent text-white"
              : "text-text-secondary hover:bg-surface-3 hover:text-text"
          }`}
          onClick={onNavigateStudents}
          type="button"
        >
          <Users size={14} />
          학생관리
        </button>
        <button
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${
            isCheckBoardRoute
              ? "bg-accent text-white"
              : "text-text-secondary hover:bg-surface-3 hover:text-text"
          }`}
          onClick={onNavigateCheckBoard}
          type="button"
        >
          <ClipboardCheck size={14} />
          출석보드
        </button>
      </div>

      <button
        type="button"
        className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-left transition-colors hover:border-border-light hover:bg-surface-3"
        onClick={onOpenSpaceDrawer}
      >
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.14em] text-text-dim">
            현재 스페이스
          </div>
          <div className="mt-1 truncate text-sm font-semibold text-text">
            {currentSpaceName}
          </div>
        </div>
        <div className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-text-secondary">
          <ChevronsUpDown size={14} />
          변경
        </div>
      </button>
    </div>
  );
}

interface StudentManagementDesktopSpaceSidebarProps {
  collapsed: boolean;
  spaces: Space[];
  spacesLoading: boolean;
  noSpaces: boolean;
  selectedSpaceId: string | null;
  spaceSelection: SpaceSelectionState;
  activeMemberCount: number;
  spaceActionError: string | null;
  localDraftCount: number;
  localDraftsLoading: boolean;
  localDraftsError: string | null;
  onCreateSpace: () => void;
  onOpenImportDrafts: () => void;
  onSpaceClick: SpaceClickHandler;
  onSpaceContextMenu: SpaceContextMenuHandler;
}

export function StudentManagementDesktopSpaceSidebar({
  collapsed,
  spaces,
  spacesLoading,
  noSpaces,
  selectedSpaceId,
  spaceSelection,
  activeMemberCount,
  spaceActionError,
  localDraftCount,
  localDraftsLoading,
  localDraftsError,
  onCreateSpace,
  onOpenImportDrafts,
  onSpaceClick,
  onSpaceContextMenu,
}: StudentManagementDesktopSpaceSidebarProps) {
  return (
    <nav
      className={`scrollbar-subtle relative hidden flex-shrink-0 transition-[width,padding] duration-200 md:flex ${
        collapsed
          ? "w-0 overflow-visible border-r-0 bg-transparent px-0 py-0"
          : "w-[240px] overflow-y-auto border-r border-border bg-surface px-3 pt-5 pb-5"
      }`}
    >
      {!collapsed ? (
        <div className="flex min-h-full w-full flex-col gap-1">
          <div className="text-[11px] font-semibold text-text-dim uppercase tracking-[0.05em] px-2.5 pt-1 pb-1.5">
            스페이스
          </div>
          <div className="flex flex-col gap-0.5">
            {spaceSelection.ids.length > 1 ? (
              <div className="mb-1 rounded-[8px] border border-accent-border bg-accent-dim px-2.5 py-2 text-[12px] font-medium text-accent max-md:min-w-[220px]">
                스페이스 {spaceSelection.ids.length}개 선택됨
              </div>
            ) : null}
            <button
              className="flex items-center gap-2 py-2 px-2.5 rounded-[6px] text-[13px] font-medium cursor-pointer border border-dashed border-border bg-transparent w-full text-left text-text-dim transition-[border-color,color,background] duration-150 hover:border-accent-border hover:bg-accent-dim hover:text-accent"
              onClick={onCreateSpace}
              type="button"
            >
              <Plus size={14} />
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                스페이스 만들기
              </span>
            </button>
            {spacesLoading ? (
              <div className="px-2.5 py-1 text-[12px] text-text-dim">
                불러오는 중...
              </div>
            ) : null}
            {noSpaces ? (
              <div className="px-2.5 py-1 text-[12px] text-text-dim">
                스페이스가 없습니다.
              </div>
            ) : null}
            {spaces.map((space, index) => {
              const isSpaceSelected = spaceSelection.ids.includes(space.id);
              const isActiveSpace = selectedSpaceId === space.id;

              return (
                <button
                  key={space.id}
                  className={`flex items-center gap-2 py-2 px-2.5 rounded-[6px] text-[13px] font-medium cursor-pointer border-none w-full text-left transition-[background,color] duration-[120ms] max-md:whitespace-nowrap max-md:py-2 max-md:px-3${
                    isSpaceSelected
                      ? isActiveSpace
                        ? " bg-accent-dim text-accent font-semibold"
                        : " bg-accent-dim text-text font-medium"
                      : " bg-transparent text-text-secondary hover:bg-surface-3 hover:text-text"
                  }`}
                  onClick={(event) => onSpaceClick(event, space.id, index)}
                  onContextMenu={(event) =>
                    onSpaceContextMenu(event, space.id, space.name)
                  }
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0 bg-accent" />
                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {space.name}
                  </span>
                  {isActiveSpace ? (
                    <span className="ml-auto text-[11px] text-text-dim font-medium tabular-nums">
                      {activeMemberCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {spaceActionError ? (
            <div className="mt-2 rounded-[6px] border border-red/20 bg-red/10 px-2.5 py-2 text-[12px] text-red">
              {spaceActionError}
            </div>
          ) : null}

          <div className="mt-auto flex flex-col gap-1.5 border-t border-border pt-4">
            {localDraftCount > 0 ? (
              <button
                type="button"
                className="w-full rounded-xl border border-accent-border bg-accent-dim/50 px-3 py-3 text-left transition-colors hover:border-accent hover:bg-accent-dim"
                onClick={onOpenImportDrafts}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-lg bg-surface px-2 py-2 text-accent shrink-0">
                    <FileClock size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 text-[13px] font-semibold text-text truncate">
                        가져오기 작업 보기
                      </span>
                      <span className="shrink-0 rounded-full border border-accent-border bg-surface px-2 py-0.5 text-[10px] font-semibold text-accent">
                        {localDraftCount}개
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-text-dim line-clamp-2">
                      분석 중이거나 저장된 가져오기 작업을 한곳에서 확인하고,
                      원하는 초안을 골라 이어서 작업할 수 있습니다.
                    </p>
                  </div>
                </div>
              </button>
            ) : null}
            {localDraftCount === 0 && localDraftsLoading ? (
              <div className="rounded-[8px] border border-border bg-surface-2 px-3 py-2 text-[12px] text-text-dim">
                가져오기 작업 확인 중...
              </div>
            ) : null}
            {localDraftsError ? (
              <div className="rounded-[8px] border border-red/20 bg-red/10 px-3 py-2 text-[12px] text-red">
                {localDraftsError}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </nav>
  );
}

interface StudentManagementMobileSpaceDrawerProps {
  open: boolean;
  spaces: Space[];
  selectedSpaceId: string | null;
  spaceSelection: SpaceSelectionState;
  activeMemberCount: number;
  spaceActionError: string | null;
  localDraftCount: number;
  onClose: () => void;
  onCreateSpace: () => void;
  onOpenImportDrafts: () => void;
  onSpaceClick: SpaceClickHandler;
  onOpenSpaceActions: (target: SpaceDialogTarget) => void;
}

export function StudentManagementMobileSpaceDrawer({
  open,
  spaces,
  selectedSpaceId,
  spaceSelection,
  activeMemberCount,
  spaceActionError,
  localDraftCount,
  onClose,
  onCreateSpace,
  onOpenImportDrafts,
  onSpaceClick,
  onOpenSpaceActions,
}: StudentManagementMobileSpaceDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[340] bg-[rgba(0,0,0,0.62)] p-3 md:hidden">
      <div className="ml-auto flex h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-text-dim">
              space selector
            </div>
            <div className="mt-1 text-base font-semibold text-text">
              스페이스 선택
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-text-secondary"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-1.5">
            <button
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-transparent px-3 py-3 text-[13px] font-medium text-text-dim transition-[border-color,color,background] duration-150 hover:border-accent-border hover:bg-accent-dim hover:text-accent"
              onClick={onCreateSpace}
              type="button"
            >
              <Plus size={14} />
              스페이스 만들기
            </button>
            {spaces.map((space, index) => {
              const isSpaceSelected = spaceSelection.ids.includes(space.id);
              const isActiveSpace = selectedSpaceId === space.id;

              return (
                <div
                  key={space.id}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors ${
                    isSpaceSelected
                      ? isActiveSpace
                        ? "bg-accent-dim text-accent"
                        : "bg-accent-dim text-text"
                      : "bg-surface-2 text-text-secondary"
                  }`}
                >
                  <button
                    className="flex min-w-0 flex-1 items-center gap-2 text-left text-[13px] font-medium"
                    onClick={(event) => onSpaceClick(event, space.id, index)}
                    type="button"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <span className="min-w-0 flex-1 truncate">
                      {space.name}
                    </span>
                    {isActiveSpace ? (
                      <span className="text-[11px] text-text-dim">
                        {activeMemberCount}
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    className="relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenSpaceActions({
                        spaceId: space.id,
                        spaceName: space.name,
                      });
                    }}
                    aria-label={`${space.name} 액션 열기`}
                  >
                    <Ellipsis size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {spaceActionError ? (
            <div className="mt-3 rounded-xl border border-red/20 bg-red/10 px-3 py-2 text-[12px] text-red">
              {spaceActionError}
            </div>
          ) : null}

          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {localDraftCount > 0 ? (
              <button
                type="button"
                className="w-full rounded-xl border border-accent-border bg-accent-dim/50 px-3 py-3 text-left"
                onClick={onOpenImportDrafts}
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-surface px-2 py-2 text-accent">
                    <FileClock size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-text">
                      가져오기 작업 보기
                    </div>
                    <div className="mt-1 text-[11px] text-text-dim">
                      {localDraftCount}개 작업
                    </div>
                  </div>
                </div>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
