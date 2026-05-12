"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RecordItem } from "../_lib/types";
import type { Space } from "../_hooks";
import type { MemberWithStatus } from "../_hooks";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { CreateSpaceModal } from "./create-space-modal";
import { useCounselingSidebarLayout } from "@/features/counseling-service-shell/counseling-sidebar-layout-context";
import { useAppRoute } from "@/lib/app-route-context";
import type { MemberItemActions } from "@/features/counseling-record-workspace/components/sidebar-member-list-item";
import { SidebarMembersSection } from "@/features/counseling-record-workspace/components/sidebar-members-section";
import { SidebarSpaceSelector } from "@/features/counseling-record-workspace/components/sidebar-space-selector";
import { UnlinkedRecordsSection } from "@/features/counseling-record-workspace/components/sidebar-unlinked-records-section";

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

type ContextMenuState = {
  kind: "space" | "member" | "record";
  ids: string[];
  primaryId: string;
  label: string;
  x: number;
  y: number;
} | null;

type SelectionState = {
  kind: "space" | "member" | "record" | null;
  ids: string[];
};

type DragSelectionState = {
  kind: "space" | "member" | "record";
  orderedIds: string[];
  anchorId: string;
};

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
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [selection, setSelection] = useState<SelectionState>({
    kind: null,
    ids: [],
  });
  const [deletingContextId, setDeletingContextId] = useState<string | null>(
    null
  );
  const lastSelectedIdRef = useRef<{
    space: string | null;
    member: string | null;
    record: string | null;
  }>({
    space: null,
    member: null,
    record: null,
  });
  const dragSelectionRef = useRef<DragSelectionState | null>(null);
  const suppressDefaultActionRef = useRef(false);

  const spaceRef = useClickOutside<HTMLDivElement>(
    () => setShowSpaceDropdown(false),
    showSpaceDropdown
  );
  const contextMenuRef = useClickOutside<HTMLDivElement>(
    () => setContextMenu(null),
    !!contextMenu
  );

  const getMemberRecords = (memberId: string) =>
    records.filter((r) => r.memberId === memberId);

  const unlinkedRecords = records.filter((r) => r.memberId === null);

  const toggleMember = (id: string) =>
    setExpandedMemberId((prev) => (prev === id ? null : id));

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

  const selectedIdSet = useMemo(() => new Set(selection.ids), [selection.ids]);

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

  // ── ref 기반 안정 핸들러 (MemberListItem에 전달) ──────────────
  const sidebarActionsRef = useRef({
    handleSelectableClick: (() => {}) as typeof handleSelectableClick,
    beginDragSelection: (() => {}) as typeof beginDragSelection,
    extendDragSelection: (() => {}) as typeof extendDragSelection,
    openContextMenu: (() => {}) as typeof openContextMenu,
    onSelectMember,
    onSelect,
    setExpandedMemberId,
    memberOrderIds,
    visibleRecordOrderIds,
    visibleRecordOrder,
    visibleRecordIndexById,
    members,
  });
  // render마다 최신값으로 갱신 — ref이므로 자식 re-render를 유발하지 않음
  sidebarActionsRef.current = {
    handleSelectableClick,
    beginDragSelection,
    extendDragSelection,
    openContextMenu,
    onSelectMember,
    onSelect,
    setExpandedMemberId,
    memberOrderIds,
    visibleRecordOrderIds,
    visibleRecordOrder,
    visibleRecordIndexById,
    members,
  };

  // 안정 actions 객체 — useCallback으로 참조 고정, 내부에서 ref.current 사용
  const memberItemActions = useMemo<MemberItemActions>(
    () => ({
      onMemberClick: (e, id, _index, _name) => {
        const a = sidebarActionsRef.current;
        const index = a.members.findIndex((m) => m.id === id);
        a.handleSelectableClick({
          event: e,
          kind: "member",
          id,
          index,
          orderedIds: a.memberOrderIds,
          onDefault: () => {
            a.onSelectMember(id);
            a.setExpandedMemberId(id);
          },
        });
      },
      onMemberMouseDown: (e, id) => {
        const a = sidebarActionsRef.current;
        a.beginDragSelection({
          event: e,
          kind: "member",
          id,
          orderedIds: a.memberOrderIds,
        });
      },
      onMemberMouseEnter: (e, id, _index) => {
        const a = sidebarActionsRef.current;
        const index = a.members.findIndex((m) => m.id === id);
        a.extendDragSelection({
          event: e,
          kind: "member",
          id,
          index,
          orderedIds: a.memberOrderIds,
        });
      },
      onMemberContextMenu: (e, id, label, _index) => {
        const a = sidebarActionsRef.current;
        const index = a.members.findIndex((m) => m.id === id);
        a.openContextMenu(e, { kind: "member", id, label, index });
      },
      onRecordClick: (e, id, _index) => {
        const a = sidebarActionsRef.current;
        const index = a.visibleRecordIndexById.get(id) ?? 0;
        a.handleSelectableClick({
          event: e,
          kind: "record",
          id,
          index,
          orderedIds: a.visibleRecordOrder.map((r) => r.id),
          onDefault: () => a.onSelect(id),
        });
      },
      onRecordMouseDown: (e, id) => {
        const a = sidebarActionsRef.current;
        a.beginDragSelection({
          event: e,
          kind: "record",
          id,
          orderedIds: a.visibleRecordOrderIds,
        });
      },
      onRecordMouseEnter: (e, id, _index) => {
        const a = sidebarActionsRef.current;
        const index = a.visibleRecordIndexById.get(id) ?? 0;
        a.extendDragSelection({
          event: e,
          kind: "record",
          id,
          index,
          orderedIds: a.visibleRecordOrderIds,
        });
      },
      onRecordContextMenu: (e, id, label, _index) => {
        const a = sidebarActionsRef.current;
        const index = a.visibleRecordIndexById.get(id) ?? 0;
        a.openContextMenu(e, { kind: "record", id, label, index });
      },
    }),
    [] // deps 없음 — ref 기반이므로 항상 최신값 사용, 참조 영구 고정
  );

  useEffect(() => {
    if (!sidebarCollapsed) {
      return;
    }

    setShowSpaceDropdown(false);
    setContextMenu(null);
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (selection.kind === null) {
      return;
    }

    const orderedIds =
      selection.kind === "space"
        ? spaceOrderIds
        : selection.kind === "member"
          ? memberOrderIds
          : visibleRecordOrderIds;
    const nextIds = selection.ids.filter((id) => orderedIds.includes(id));

    if (nextIds.length === 0) {
      if (selection.ids.length > 0) {
        setSelection({ kind: null, ids: [] });
      }
      lastSelectedIdRef.current[selection.kind] = null;
      if (contextMenu?.kind === selection.kind) {
        setContextMenu(null);
      }
      return;
    }

    if (nextIds.length !== selection.ids.length) {
      setSelection({ kind: selection.kind, ids: nextIds });
    }

    const currentAnchorId = lastSelectedIdRef.current[selection.kind];
    if (!currentAnchorId || !orderedIds.includes(currentAnchorId)) {
      lastSelectedIdRef.current[selection.kind] = nextIds.at(-1) ?? null;
    }

    if (contextMenu?.kind === selection.kind) {
      const nextContextIds = contextMenu.ids.filter((id) =>
        orderedIds.includes(id)
      );
      if (nextContextIds.length === 0) {
        setContextMenu(null);
      } else if (nextContextIds.length !== contextMenu.ids.length) {
        setContextMenu({
          ...contextMenu,
          ids: nextContextIds,
          primaryId: nextContextIds.includes(contextMenu.primaryId)
            ? contextMenu.primaryId
            : nextContextIds[0],
        });
      }
    }
  }, [
    contextMenu,
    memberOrderIds,
    selection,
    spaceOrderIds,
    visibleRecordOrderIds,
  ]);

  useEffect(() => {
    const handleMouseUp = () => {
      dragSelectionRef.current = null;
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  const contextDeleteLabel = useMemo(() => {
    if (!contextMenu) return "삭제";
    const count = contextMenu.ids.length;
    if (contextMenu.kind === "space") {
      return count > 1 ? `선택한 스페이스 ${count}개 삭제` : "스페이스 삭제";
    }
    if (contextMenu.kind === "member") {
      return count > 1 ? `선택한 수강생 ${count}명 삭제` : "수강생 삭제";
    }
    return count > 1 ? `선택한 상담 기록 ${count}개 삭제` : "상담 기록 삭제";
  }, [contextMenu]);

  function getOrderedIdsForKind(kind: "space" | "member" | "record") {
    if (kind === "space") return spaceOrderIds;
    if (kind === "member") return memberOrderIds;
    return visibleRecordOrderIds;
  }

  function clearSelection() {
    setSelection({ kind: null, ids: [] });
    setContextMenu(null);
  }

  function getSelectionLabel(kind: "space" | "member" | "record", id: string) {
    if (kind === "space") {
      return spaces.find((space) => space.id === id)?.name ?? "선택 항목";
    }

    if (kind === "member") {
      return members.find((member) => member.id === id)?.name ?? "선택 항목";
    }

    return records.find((record) => record.id === id)?.title ?? "선택 항목";
  }

  function buildDeleteConfirmationMessage(params: {
    kind: "space" | "member" | "record";
    ids: string[];
    primaryId: string;
    label?: string;
  }) {
    const count = params.ids.length;
    const resolvedLabel =
      params.label ?? getSelectionLabel(params.kind, params.primaryId);

    if (params.kind === "space") {
      return count > 1
        ? `선택한 스페이스 ${count}개를 정말로 삭제하시겠습니까?`
        : `스페이스 "${resolvedLabel}"을 정말로 삭제하시겠습니까?`;
    }

    if (params.kind === "member") {
      return count > 1
        ? `선택한 수강생 ${count}명을 정말로 삭제하시겠습니까?`
        : `수강생 "${resolvedLabel}"을 정말로 삭제하시겠습니까?`;
    }

    return count > 1
      ? `선택한 상담 기록 ${count}개를 삭제하시겠습니까?`
      : `상담 기록 "${resolvedLabel}"을 삭제하시겠습니까?`;
  }

  async function deleteSelection(params: {
    kind: "space" | "member" | "record";
    ids: string[];
    primaryId: string;
    label?: string;
  }) {
    const confirmationMessage = buildDeleteConfirmationMessage(params);
    const confirmed = window.confirm(confirmationMessage);
    if (!confirmed) return;

    setDeletingContextId(params.primaryId);
    try {
      for (const id of params.ids) {
        if (params.kind === "space") {
          await onDeleteSpace(id);
        } else if (params.kind === "member") {
          await onDeleteMember(id);
        } else {
          await onDeleteRecord(id);
        }
      }
      clearSelection();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "삭제 처리에 실패했습니다."
      );
    } finally {
      setDeletingContextId(null);
    }
  }

  function handleSidebarKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    const isTextInput =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable;

    if (event.key === "Escape") {
      if (selection.ids.length > 0 || contextMenu) {
        event.preventDefault();
        clearSelection();
      }
      return;
    }

    if (
      (event.key === "Delete" || event.key === "Backspace") &&
      !isTextInput &&
      selection.kind !== null &&
      selection.ids.length > 0
    ) {
      event.preventDefault();
      void deleteSelection({
        kind: selection.kind,
        ids: selection.ids,
        primaryId: selection.ids[0],
      });
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
      if (isTextInput) {
        return;
      }

      const activeKind =
        selection.kind ??
        contextMenu?.kind ??
        (showSpaceDropdown ? "space" : selectedId ? "record" : "member");
      const orderedIds = getOrderedIdsForKind(activeKind);

      if (orderedIds.length === 0) {
        return;
      }

      event.preventDefault();
      updateSelection(
        activeKind,
        orderedIds,
        orderedIds.at(-1) ?? orderedIds[0]
      );
    }
  }

  function clearBrowserTextSelection() {
    window.getSelection()?.removeAllRanges();
  }

  function beginDragSelection(params: {
    event: React.MouseEvent;
    kind: "space" | "member" | "record";
    id: string;
    orderedIds: string[];
  }) {
    const { event, kind, id, orderedIds } = params;
    if (event.button !== 0) {
      return;
    }

    if (!event.shiftKey) {
      dragSelectionRef.current = null;
      suppressDefaultActionRef.current = false;
      return;
    }

    event.preventDefault();
    clearBrowserTextSelection();

    dragSelectionRef.current = {
      kind,
      orderedIds,
      anchorId: id,
    };
    suppressDefaultActionRef.current = false;
  }

  function extendDragSelection(params: {
    event: React.MouseEvent;
    kind: "space" | "member" | "record";
    id: string;
    index: number;
    orderedIds: string[];
  }) {
    const { event, kind, index, orderedIds } = params;
    const drag = dragSelectionRef.current;
    if (!drag || event.buttons !== 1 || drag.kind !== kind) {
      return;
    }

    const anchorIndex = orderedIds.indexOf(drag.anchorId);
    const resolvedAnchorIndex = anchorIndex >= 0 ? anchorIndex : index;
    const start = Math.min(resolvedAnchorIndex, index);
    const end = Math.max(resolvedAnchorIndex, index);
    suppressDefaultActionRef.current = true;
    clearBrowserTextSelection();
    updateSelection(kind, orderedIds.slice(start, end + 1), drag.anchorId);
  }

  function updateSelection(
    kind: "space" | "member" | "record",
    ids: string[],
    anchorId: string
  ) {
    setSelection({ kind, ids });
    lastSelectedIdRef.current[kind] = anchorId;
  }

  function handleSelectableClick(params: {
    event: React.MouseEvent;
    kind: "space" | "member" | "record";
    id: string;
    index: number;
    orderedIds: string[];
    onDefault: () => void;
  }) {
    const { event, kind, id, index, orderedIds, onDefault } = params;
    setContextMenu(null);

    if (suppressDefaultActionRef.current) {
      suppressDefaultActionRef.current = false;
      return;
    }

    if (event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      clearBrowserTextSelection();

      if (selection.kind === kind && selectedIdSet.has(id)) {
        const nextIds = selection.ids.filter((itemId) => itemId !== id);
        if (nextIds.length === 0) {
          clearSelection();
          lastSelectedIdRef.current[kind] = null;
          return;
        }

        const currentAnchorId = lastSelectedIdRef.current[kind];
        const nextAnchorId =
          currentAnchorId && nextIds.includes(currentAnchorId)
            ? currentAnchorId
            : (nextIds.at(-1) ?? id);
        updateSelection(kind, nextIds, nextAnchorId);
        return;
      }

      const anchorId =
        selection.kind === kind ? lastSelectedIdRef.current[kind] : null;
      const anchorIndex = anchorId ? orderedIds.indexOf(anchorId) : -1;
      const resolvedAnchorIndex = anchorIndex >= 0 ? anchorIndex : index;

      const start = Math.min(resolvedAnchorIndex, index);
      const end = Math.max(resolvedAnchorIndex, index);
      const nextAnchorId = anchorIndex >= 0 && anchorId ? anchorId : id;
      updateSelection(kind, orderedIds.slice(start, end + 1), nextAnchorId);
      return;
    }

    if (event.metaKey || event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();
      clearBrowserTextSelection();

      const baseIds = selection.kind === kind ? selection.ids : [];
      const nextIds = selectedIdSet.has(id)
        ? baseIds.filter((itemId) => itemId != id)
        : [...baseIds, id];

      if (nextIds.length === 0) {
        clearSelection();
        lastSelectedIdRef.current[kind] = null;
        return;
      }

      updateSelection(kind, nextIds, id);
      return;
    }

    updateSelection(kind, [id], id);
    onDefault();
  }

  function openContextMenu(
    event: React.MouseEvent,
    menu: {
      kind: "space" | "member" | "record";
      id: string;
      label: string;
      index: number;
    }
  ) {
    event.preventDefault();
    event.stopPropagation();
    const ids =
      selection.kind === menu.kind && selectedIdSet.has(menu.id)
        ? selection.ids
        : [menu.id];

    updateSelection(menu.kind, ids, menu.id);
    setContextMenu({
      kind: menu.kind,
      ids,
      primaryId: menu.id,
      label: menu.label,
      x: event.clientX,
      y: event.clientY,
    });
    setShowSpaceDropdown(false);
  }

  async function handleContextDelete() {
    if (!contextMenu) return;

    await deleteSelection({
      kind: contextMenu.kind,
      ids: contextMenu.ids,
      primaryId: contextMenu.primaryId,
      label: contextMenu.label,
    });
  }

  const contextActions = useMemo(() => {
    if (!contextMenu)
      return [] as Array<{
        key: string;
        label: string;
        destructive?: boolean;
        action: () => Promise<void> | void;
      }>;

    const single = contextMenu.ids.length === 1;
    const actions: Array<{
      key: string;
      label: string;
      destructive?: boolean;
      action: () => Promise<void> | void;
    }> = [];

    if (contextMenu.kind === "space" && single) {
      actions.push({
        key: "open-space",
        label: "열기",
        action: () => {
          onSpaceChange(contextMenu.primaryId);
          setShowSpaceDropdown(false);
          setContextMenu(null);
        },
      });
      actions.push({
        key: "goto-student-management",
        label: "수강생 관리로 이동",
        action: () => {
          router.push(resolveAppHref("/counseling-service/student-management"));
          setContextMenu(null);
        },
      });
    }

    if (contextMenu.kind === "member" && single) {
      actions.push({
        key: "open-member",
        label: "열기",
        action: () => {
          onSelectMember(contextMenu.primaryId);
          toggleMember(contextMenu.primaryId);
          setContextMenu(null);
        },
      });
      actions.push({
        key: "open-member-management",
        label: "수강생 관리에서 열기",
        action: () => {
          router.push(
            resolveAppHref(
              `/counseling-service/student-management/${contextMenu.primaryId}`
            )
          );
          setContextMenu(null);
        },
      });
      actions.push({
        key: "export-member-report",
        label: "리포트 내보내기",
        action: async () => {
          await onExportMember(contextMenu.primaryId);
          setContextMenu(null);
        },
      });
    }

    if (contextMenu.kind === "record" && single) {
      actions.push({
        key: "open-record",
        label: "열기",
        action: () => {
          onSelect(contextMenu.primaryId);
          setContextMenu(null);
        },
      });
      actions.push({
        key: "export-record-docx",
        label: "DOCX 내보내기",
        action: async () => {
          await onExportRecord(contextMenu.primaryId);
          setContextMenu(null);
        },
      });
    }

    actions.push({
      key: "delete",
      label: contextDeleteLabel,
      destructive: true,
      action: () => handleContextDelete(),
    });

    return actions;
  }, [
    contextDeleteLabel,
    contextMenu,
    onExportMember,
    onExportRecord,
    onSelect,
    onSelectMember,
    onSpaceChange,
    router,
  ]);

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <div
      className="relative flex w-64 shrink-0 flex-col overflow-hidden border-r border-border bg-surface"
      tabIndex={0}
      onKeyDown={handleSidebarKeyDown}
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
        onOpenContextMenu={openContextMenu}
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
          onOpenContextMenu={openContextMenu}
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
        <div
          ref={contextMenuRef}
          className="fixed min-w-[168px] rounded-md border border-border-light bg-surface-3 py-1 shadow-[0_12px_32px_rgba(0,0,0,0.42)] z-[120]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextActions.map((action, index) => (
            <button
              key={action.key}
              type="button"
              className={`flex w-full items-center gap-2 px-3 py-2 bg-transparent border-none text-left text-[12px] font-medium cursor-pointer hover:bg-surface-4 disabled:opacity-50 ${
                action.destructive ? "text-red" : "text-text"
              } ${index > 0 && action.destructive ? "border-t border-border" : ""}`}
              onClick={() => void action.action()}
              disabled={
                action.key === "delete" &&
                deletingContextId === contextMenu.primaryId
              }
            >
              <span>
                {action.key === "delete"
                  ? "🗑"
                  : action.key === "open-space" ||
                      action.key === "open-member" ||
                      action.key === "open-record"
                    ? "📂"
                    : action.key === "goto-student-management" ||
                        action.key === "open-member-management"
                      ? "👥"
                      : action.key.includes("export")
                        ? "📄"
                        : "•"}
              </span>
              {action.key === "delete" &&
              deletingContextId === contextMenu.primaryId
                ? "삭제 중..."
                : action.label}
            </button>
          ))}
        </div>
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
            + 새 상담 기록
          </button>
        </div>
      ) : null}
    </div>
  );
}
