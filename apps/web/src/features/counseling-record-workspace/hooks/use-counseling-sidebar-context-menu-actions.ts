import { useMemo } from "react";
import type { SidebarContextMenuAction } from "@/features/counseling-record-workspace/components/sidebar-context-menu";
import type { CounselingSidebarContextMenuState } from "./use-counseling-sidebar-selection";

type UseCounselingSidebarContextMenuActionsParams = {
  contextMenu: CounselingSidebarContextMenuState;
  contextDeleteLabel: string;
  onOpenSpace: (id: string) => void;
  onOpenMember: (id: string) => void;
  onOpenRecord: (id: string) => void;
  onOpenStudentManagement: () => void;
  onOpenMemberManagement: (id: string) => void;
  onExportMember: (id: string) => Promise<void>;
  onExportRecord: (id: string) => Promise<void>;
  onDelete: () => Promise<void> | void;
  onCloseContextMenu: () => void;
};

export function useCounselingSidebarContextMenuActions({
  contextMenu,
  contextDeleteLabel,
  onOpenSpace,
  onOpenMember,
  onOpenRecord,
  onOpenStudentManagement,
  onOpenMemberManagement,
  onExportMember,
  onExportRecord,
  onDelete,
  onCloseContextMenu,
}: UseCounselingSidebarContextMenuActionsParams) {
  return useMemo(() => {
    if (!contextMenu) return [] as SidebarContextMenuAction[];

    const single = contextMenu.ids.length === 1;
    const actions: SidebarContextMenuAction[] = [];

    if (contextMenu.kind === "space" && single) {
      actions.push({
        key: "open-space",
        label: "열기",
        action: () => {
          onOpenSpace(contextMenu.primaryId);
          onCloseContextMenu();
        },
      });
      actions.push({
        key: "goto-student-management",
        label: "수강생 관리로 이동",
        action: () => {
          onOpenStudentManagement();
          onCloseContextMenu();
        },
      });
    }

    if (contextMenu.kind === "member" && single) {
      actions.push({
        key: "open-member",
        label: "열기",
        action: () => {
          onOpenMember(contextMenu.primaryId);
          onCloseContextMenu();
        },
      });
      actions.push({
        key: "open-member-management",
        label: "수강생 관리에서 열기",
        action: () => {
          onOpenMemberManagement(contextMenu.primaryId);
          onCloseContextMenu();
        },
      });
      actions.push({
        key: "export-member-report",
        label: "리포트 내보내기",
        action: async () => {
          await onExportMember(contextMenu.primaryId);
          onCloseContextMenu();
        },
      });
    }

    if (contextMenu.kind === "record" && single) {
      actions.push({
        key: "open-record",
        label: "열기",
        action: () => {
          onOpenRecord(contextMenu.primaryId);
          onCloseContextMenu();
        },
      });
      actions.push({
        key: "export-record-docx",
        label: "DOCX 내보내기",
        action: async () => {
          await onExportRecord(contextMenu.primaryId);
          onCloseContextMenu();
        },
      });
    }

    actions.push({
      key: "delete",
      label: contextDeleteLabel,
      destructive: true,
      action: () => onDelete(),
    });

    return actions;
  }, [
    contextDeleteLabel,
    contextMenu,
    onCloseContextMenu,
    onDelete,
    onExportMember,
    onExportRecord,
    onOpenMember,
    onOpenMemberManagement,
    onOpenRecord,
    onOpenSpace,
    onOpenStudentManagement,
  ]);
}
