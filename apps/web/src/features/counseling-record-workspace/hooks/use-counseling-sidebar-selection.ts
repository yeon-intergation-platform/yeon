import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";

export type CounselingSidebarSelectionKind = "space" | "member" | "record";

export type CounselingSidebarContextMenuState = {
  kind: CounselingSidebarSelectionKind;
  ids: string[];
  primaryId: string;
  label: string;
  x: number;
  y: number;
} | null;

type SelectionState = {
  kind: CounselingSidebarSelectionKind | null;
  ids: string[];
};

type DragSelectionState = {
  kind: CounselingSidebarSelectionKind;
  orderedIds: string[];
  anchorId: string;
};

type UseCounselingSidebarSelectionParams = {
  spaceOrderIds: string[];
  memberOrderIds: string[];
  visibleRecordOrderIds: string[];
  getSelectionLabel: (
    kind: CounselingSidebarSelectionKind,
    id: string
  ) => string;
  onDeleteRecord: (id: string) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
  onDeleteSpace: (id: string) => Promise<void>;
};

export function useCounselingSidebarSelection({
  spaceOrderIds,
  memberOrderIds,
  visibleRecordOrderIds,
  getSelectionLabel,
  onDeleteRecord,
  onDeleteMember,
  onDeleteSpace,
}: UseCounselingSidebarSelectionParams) {
  const [contextMenu, setContextMenu] =
    useState<CounselingSidebarContextMenuState>(null);
  const [selection, setSelection] = useState<SelectionState>({
    kind: null,
    ids: [],
  });
  const [deletingContextId, setDeletingContextId] = useState<string | null>(
    null
  );
  const lastSelectedIdRef = useRef<
    Record<CounselingSidebarSelectionKind, string | null>
  >({
    space: null,
    member: null,
    record: null,
  });
  const dragSelectionRef = useRef<DragSelectionState | null>(null);
  const suppressDefaultActionRef = useRef(false);

  const selectedIdSet = useMemo(() => new Set(selection.ids), [selection.ids]);

  useEffect(() => {
    if (selection.kind === null) {
      return;
    }

    const orderedIds = getOrderedIdsForKind(selection.kind);
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

  function getOrderedIdsForKind(kind: CounselingSidebarSelectionKind) {
    if (kind === "space") return spaceOrderIds;
    if (kind === "member") return memberOrderIds;
    return visibleRecordOrderIds;
  }

  function clearSelection() {
    setSelection({ kind: null, ids: [] });
    setContextMenu(null);
  }

  function closeContextMenu() {
    setContextMenu(null);
  }

  function clearBrowserTextSelection() {
    window.getSelection()?.removeAllRanges();
  }

  function buildDeleteConfirmationMessage(params: {
    kind: CounselingSidebarSelectionKind;
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
    kind: CounselingSidebarSelectionKind;
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

  function handleSidebarKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
    activeKindFallback: CounselingSidebarSelectionKind
  ) {
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
        selection.kind ?? contextMenu?.kind ?? activeKindFallback;
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

  function beginDragSelection(params: {
    event: React.MouseEvent;
    kind: CounselingSidebarSelectionKind;
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
    kind: CounselingSidebarSelectionKind;
    id?: string;
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
    kind: CounselingSidebarSelectionKind,
    ids: string[],
    anchorId: string
  ) {
    setSelection({ kind, ids });
    lastSelectedIdRef.current[kind] = anchorId;
  }

  function handleSelectableClick(params: {
    event: React.MouseEvent;
    kind: CounselingSidebarSelectionKind;
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
        ? baseIds.filter((itemId) => itemId !== id)
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
      kind: CounselingSidebarSelectionKind;
      id: string;
      label: string;
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

  return {
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
  };
}
