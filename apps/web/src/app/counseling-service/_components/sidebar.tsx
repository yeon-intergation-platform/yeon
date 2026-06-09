"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { RecordItem } from "@/features/counseling-record-workspace/lib/types";
import type { Space } from "../_hooks";
import type { MemberWithStatus } from "../_hooks";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { CreateSpaceModal } from "@/features/counseling-record-workspace/components/create-space-modal";
import { useCounselingSidebarLayout } from "@/features/counseling-service-shell/counseling-sidebar-layout-context";
import { useAppRoute } from "@/lib/app-route-context";
import { SidebarContextMenu } from "@/features/counseling-record-workspace/components/sidebar-context-menu";
import { SidebarMembersSection } from "@/features/counseling-record-workspace/components/sidebar-members-section";
import { SidebarSpaceSelector } from "@/features/counseling-record-workspace/components/sidebar-space-selector";
import { UnlinkedRecordsSection } from "@/features/counseling-record-workspace/components/sidebar-unlinked-records-section";
import { useCounselingSidebarSelection } from "@/features/counseling-record-workspace/hooks/use-counseling-sidebar-selection";
import { useCounselingSidebarContextMenuActions } from "@/features/counseling-record-workspace/hooks/use-counseling-sidebar-context-menu-actions";
import { useCounselingSidebarMemberItemActions } from "@/features/counseling-record-workspace/hooks/use-counseling-sidebar-member-item-actions";

export interface SidebarProps {
  records: RecordItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  spaces: Space[];
  currentSpace: Space | null;
  onSpaceChange: (id: string) => void;
  onSpaceCreated: (space: Space) => void;
  members: MemberWithStatus[];
  membersLoading: boolean;
  selectedMemberId: string | null;
  onSelectMember: (id: string) => void;
  onOpenNewRecordEntry: () => void;
  onDeleteRecord: (id: string) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
  onDeleteSpace: (id: string) => Promise<void>;
  onExportRecord: (id: string) => Promise<void>;
  onExportMember: (id: string) => Promise<void>;
}

export function Sidebar({
  records,
  selectedId,
  onSelect,
  spaces,
  currentSpace,
  onSpaceChange,
  onSpaceCreated,
  members,
  membersLoading,
  selectedMemberId,
  onSelectMember,
  onOpenNewRecordEntry,
  onDeleteRecord,
  onDeleteMember,
  onDeleteSpace,
  onExportRecord,
  onExportMember,
}: SidebarProps) {
  const router = useRouter();
  const { resolveAppHref } = useAppRoute();
  const { sidebarCollapsed } = useCounselingSidebarLayout();
  const [showSpaceDropdown, setShowSpaceDropdown] = useState(false);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [showCreateSpace, setShowCreateSpace] = useState(false);

  const spaceRef = useClickOutside<HTMLDivElement>(
    () => setShowSpaceDropdown(false),
    showSpaceDropdown
  );
  const getMemberRecords = (memberId: string) =>
    records.filter((r) => r.memberId === memberId);

  const unlinkedRecords = records.filter((r) => r.memberId === null);

  const toggleMember = useCallback((id: string) => {
    setExpandedMemberId((prev) => (prev === id ? null : id));
  }, []);

  const visibleRecordOrder = useMemo(
    () => [
      ...members.flatMap((member) => {
        if (expandedMemberId !== member.id) return [] as RecordItem[];
        return getMemberRecords(member.id);
      }),
      ...unlinkedRecords,
    ],
    [expandedMemberId, members, records]
  );

  const visibleRecordIndexById = useMemo(
    () =>
      new Map(visibleRecordOrder.map((record, index) => [record.id, index])),
    [visibleRecordOrder]
  );
  const spaceOrderIds = useMemo(
    () => spaces.map((space) => space.id),
    [spaces]
  );
  const memberOrderIds = useMemo(
    () => members.map((member) => member.id),
    [members]
  );
  const visibleRecordOrderIds = useMemo(
    () => visibleRecordOrder.map((record) => record.id),
    [visibleRecordOrder]
  );

  function getSelectionLabel(kind: "space" | "member" | "record", id: string) {
    if (kind === "space") {
      return spaces.find((space) => space.id === id)?.name ?? "선택 항목";
    }

    if (kind === "member") {
      return members.find((member) => member.id === id)?.name ?? "선택 항목";
    }

    return records.find((record) => record.id === id)?.title ?? "선택 항목";
  }

  const {
    contextMenu,
    contextDeleteLabel,
    deletingContextId,
    selection,
    selectedIdSet,
    beginDragSelection,
    clearSelection,
    closeContextMenu,
    extendDragSelection,
    handleContextDelete,
    handleSelectableClick,
    handleSidebarKeyDown,
    openContextMenu,
  } = useCounselingSidebarSelection({
    spaceOrderIds,
    memberOrderIds,
    visibleRecordOrderIds,
    getSelectionLabel,
    onDeleteRecord,
    onDeleteMember,
    onDeleteSpace,
  });

  function handleOpenContextMenu(
    event: React.MouseEvent,
    menu: {
      kind: "space" | "member" | "record";
      id: string;
      label: string;
      index?: number;
    }
  ) {
    openContextMenu(event, menu);
    setShowSpaceDropdown(false);
  }

  const contextMenuRef = useClickOutside<HTMLDivElement>(
    () => closeContextMenu(),
    !!contextMenu
  );

  // ── 멤버별 records 캐시 (members/records 변경 시만 재계산) ─────
  const memberRecordsMap = useMemo(() => {
    const map = new Map<string, RecordItem[]>();
    for (const member of members) {
      map.set(
        member.id,
        records.filter((r) => r.memberId === member.id)
      );
    }
    return map;
  }, [members, records]);

  // record multi-select set (kind가 record일 때만 유의미)
  const recordMultiSelectedSet = useMemo(
    () =>
      selection.kind === "record"
        ? selectedIdSet
        : (new Set<string>() as ReadonlySet<string>),
    [selection.kind, selectedIdSet]
  );

  const memberItemActions = useCounselingSidebarMemberItemActions({
    beginDragSelection,
    extendDragSelection,
    handleSelectableClick,
    memberOrderIds,
    visibleRecordOrderIds,
    visibleRecordOrder,
    visibleRecordIndexById,
    members,
    onSelectMember,
    onSelectRecord: onSelect,
    setExpandedMemberId,
    onOpenContextMenu: handleOpenContextMenu,
  });

  useEffect(() => {
    if (!sidebarCollapsed) {
      return;
    }

    setShowSpaceDropdown(false);
    closeContextMenu();
  }, [closeContextMenu, sidebarCollapsed]);

  const handleOpenSpace = useCallback(
    (spaceId: string) => {
      onSpaceChange(spaceId);
      setShowSpaceDropdown(false);
    },
    [onSpaceChange]
  );

  const handleOpenMember = useCallback(
    (memberId: string) => {
      onSelectMember(memberId);
      toggleMember(memberId);
    },
    [onSelectMember, toggleMember]
  );

  const handleOpenStudentManagement = useCallback(() => {
    router.push(resolveAppHref("/counseling-service/student-management"));
  }, [resolveAppHref, router]);

  const handleOpenMemberManagement = useCallback(
    (memberId: string) => {
      router.push(
        resolveAppHref(`/counseling-service/student-management/${memberId}`)
      );
    },
    [resolveAppHref, router]
  );

  const contextActions = useCounselingSidebarContextMenuActions({
    contextMenu,
    contextDeleteLabel,
    onOpenSpace: handleOpenSpace,
    onOpenMember: handleOpenMember,
    onOpenRecord: onSelect,
    onOpenStudentManagement: handleOpenStudentManagement,
    onOpenMemberManagement: handleOpenMemberManagement,
    onExportMember,
    onExportRecord,
    onDelete: handleContextDelete,
    onCloseContextMenu: closeContextMenu,
  });

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <div
      className="relative flex w-64 shrink-0 flex-col overflow-hidden border-r border-border bg-surface"
      tabIndex={0}
      onKeyDown={(event) =>
        handleSidebarKeyDown(
          event,
          showSpaceDropdown ? "space" : selectedId ? "record" : "member"
        )
      }
    >
      <SidebarSpaceSelector
        rootRef={spaceRef}
        spaces={spaces}
        currentSpace={currentSpace}
        isOpen={showSpaceDropdown}
        isSpaceSelection={selection.kind === "space"}
        selectedIdSet={selectedIdSet}
        onToggleOpen={() => setShowSpaceDropdown((p) => !p)}
        onClose={() => setShowSpaceDropdown(false)}
        onOpenCreateSpace={() => setShowCreateSpace(true)}
        onSpaceChange={onSpaceChange}
        onClearSelection={clearSelection}
        onHandleSelectableClick={handleSelectableClick}
        onOpenContextMenu={handleOpenContextMenu}
      />

      {selection.ids.length > 0 && (
        <div className="border-t border-border px-3 py-2 text-[11px] text-text-secondary bg-surface-2/80">
          <div className="font-medium text-text">
            {selection.ids.length}개 선택됨
          </div>
        </div>
      )}

      {/* 스크롤 영역 */}
      <div className="scrollbar-subtle flex-1 overflow-y-auto">
        <SidebarMembersSection
          members={members}
          membersLoading={membersLoading}
          hasCurrentSpace={currentSpace !== null}
          memberRecordsMap={memberRecordsMap}
          isMemberSelection={selection.kind === "member"}
          selectedIdSet={selectedIdSet}
          selectedMemberId={selectedMemberId}
          expandedMemberId={expandedMemberId}
          selectedRecordId={selectedId}
          recordMultiSelectedSet={recordMultiSelectedSet}
          actions={memberItemActions}
        />

        <UnlinkedRecordsSection
          records={unlinkedRecords}
          selectedId={selectedId}
          selectedIdSet={selectedIdSet}
          isRecordSelection={selection.kind === "record"}
          visibleRecordOrderIds={visibleRecordOrderIds}
          visibleRecordOrder={visibleRecordOrder}
          visibleRecordIndexById={visibleRecordIndexById}
          onBeginDragSelection={beginDragSelection}
          onExtendDragSelection={extendDragSelection}
          onHandleSelectableClick={handleSelectableClick}
          onOpenContextMenu={handleOpenContextMenu}
          onSelect={onSelect}
        />
      </div>

      {showCreateSpace && (
        <CreateSpaceModal
          onClose={() => setShowCreateSpace(false)}
          onCreated={(space) => {
            onSpaceCreated(space);
            setShowCreateSpace(false);
          }}
        />
      )}

      {contextMenu && (
        <SidebarContextMenu
          menuRef={contextMenuRef}
          x={contextMenu.x}
          y={contextMenu.y}
          primaryId={contextMenu.primaryId}
          deletingPrimaryId={deletingContextId}
          actions={contextActions}
        />
      )}

      {/* 하단 버튼 */}
      {records.length > 0 ? (
        <div className="px-3 py-3 border-t border-border">
          <button
            type="button"
            className="w-full rounded-xl border border-accent-border bg-[linear-gradient(180deg,rgba(129,140,248,0.96),rgba(99,102,241,0.92))] px-3 py-[10px] text-[12px] font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.2)] transition-[transform,box-shadow,opacity] duration-150 hover:-translate-y-px hover:opacity-95 hover:shadow-[0_18px_34px_rgba(99,102,241,0.24)]"
            onClick={onOpenNewRecordEntry}
            data-tutorial="new-record-btn"
          >
            + 새 운영 메모
          </button>
        </div>
      ) : null}
    </div>
  );
}
