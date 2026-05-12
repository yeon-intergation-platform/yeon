import { useMemo, useRef } from "react";
import type React from "react";
import type { MemberItemActions } from "@/features/counseling-record-workspace/components/sidebar-member-list-item";
import type { MemberWithStatus } from "@/features/counseling-record-workspace/hooks/use-space-members";
import type { RecordItem } from "@/features/counseling-record-workspace/lib/types";
import type { useCounselingSidebarSelection } from "./use-counseling-sidebar-selection";

type SidebarSelectionController = Pick<
  ReturnType<typeof useCounselingSidebarSelection>,
  "beginDragSelection" | "extendDragSelection" | "handleSelectableClick"
>;

type SidebarContextMenuRequest = {
  kind: "member" | "record";
  id: string;
  label: string;
  index?: number;
};

type UseCounselingSidebarMemberItemActionsParams =
  SidebarSelectionController & {
    memberOrderIds: string[];
    visibleRecordOrderIds: string[];
    visibleRecordOrder: RecordItem[];
    visibleRecordIndexById: ReadonlyMap<string, number>;
    members: MemberWithStatus[];
    onSelectMember: (id: string) => void;
    onSelectRecord: (id: string) => void;
    setExpandedMemberId: React.Dispatch<React.SetStateAction<string | null>>;
    onOpenContextMenu: (
      event: React.MouseEvent,
      menu: SidebarContextMenuRequest
    ) => void;
  };

export function useCounselingSidebarMemberItemActions({
  beginDragSelection,
  extendDragSelection,
  handleSelectableClick,
  memberOrderIds,
  visibleRecordOrderIds,
  visibleRecordOrder,
  visibleRecordIndexById,
  members,
  onSelectMember,
  onSelectRecord,
  setExpandedMemberId,
  onOpenContextMenu,
}: UseCounselingSidebarMemberItemActionsParams): MemberItemActions {
  const sidebarActionsRef = useRef({
    beginDragSelection,
    extendDragSelection,
    handleSelectableClick,
    onOpenContextMenu,
    onSelectMember,
    onSelectRecord,
    setExpandedMemberId,
    memberOrderIds,
    visibleRecordOrderIds,
    visibleRecordOrder,
    visibleRecordIndexById,
    members,
  });

  sidebarActionsRef.current = {
    beginDragSelection,
    extendDragSelection,
    handleSelectableClick,
    onOpenContextMenu,
    onSelectMember,
    onSelectRecord,
    setExpandedMemberId,
    memberOrderIds,
    visibleRecordOrderIds,
    visibleRecordOrder,
    visibleRecordIndexById,
    members,
  };

  return useMemo<MemberItemActions>(
    () => ({
      onMemberClick: (event, id) => {
        const actions = sidebarActionsRef.current;
        const index = actions.members.findIndex((member) => member.id === id);
        actions.handleSelectableClick({
          event,
          kind: "member",
          id,
          index,
          orderedIds: actions.memberOrderIds,
          onDefault: () => {
            actions.onSelectMember(id);
            actions.setExpandedMemberId(id);
          },
        });
      },
      onMemberMouseDown: (event, id) => {
        const actions = sidebarActionsRef.current;
        actions.beginDragSelection({
          event,
          kind: "member",
          id,
          orderedIds: actions.memberOrderIds,
        });
      },
      onMemberMouseEnter: (event, id) => {
        const actions = sidebarActionsRef.current;
        const index = actions.members.findIndex((member) => member.id === id);
        actions.extendDragSelection({
          event,
          kind: "member",
          id,
          index,
          orderedIds: actions.memberOrderIds,
        });
      },
      onMemberContextMenu: (event, id, label) => {
        const actions = sidebarActionsRef.current;
        const index = actions.members.findIndex((member) => member.id === id);
        actions.onOpenContextMenu(event, { kind: "member", id, label, index });
      },
      onRecordClick: (event, id) => {
        const actions = sidebarActionsRef.current;
        const index = actions.visibleRecordIndexById.get(id) ?? 0;
        actions.handleSelectableClick({
          event,
          kind: "record",
          id,
          index,
          orderedIds: actions.visibleRecordOrder.map((record) => record.id),
          onDefault: () => actions.onSelectRecord(id),
        });
      },
      onRecordMouseDown: (event, id) => {
        const actions = sidebarActionsRef.current;
        actions.beginDragSelection({
          event,
          kind: "record",
          id,
          orderedIds: actions.visibleRecordOrderIds,
        });
      },
      onRecordMouseEnter: (event, id) => {
        const actions = sidebarActionsRef.current;
        const index = actions.visibleRecordIndexById.get(id) ?? 0;
        actions.extendDragSelection({
          event,
          kind: "record",
          id,
          index,
          orderedIds: actions.visibleRecordOrderIds,
        });
      },
      onRecordContextMenu: (event, id, label) => {
        const actions = sidebarActionsRef.current;
        const index = actions.visibleRecordIndexById.get(id) ?? 0;
        actions.onOpenContextMenu(event, { kind: "record", id, label, index });
      },
    }),
    []
  );
}
