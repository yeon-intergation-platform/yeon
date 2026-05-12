"use client";

import type { MouseEvent } from "react";
import type { RecordItem } from "@/features/counseling-record-workspace/lib/types";
import { UnlinkedRecordListItem } from "./sidebar-unlinked-record-list-item";

interface UnlinkedRecordsSectionProps {
  records: RecordItem[];
  selectedId: string | null;
  selectedIdSet: ReadonlySet<string>;
  isRecordSelection: boolean;
  visibleRecordOrderIds: string[];
  visibleRecordOrder: Array<{ id: string }>;
  visibleRecordIndexById: ReadonlyMap<string, number>;
  onBeginDragSelection: (params: {
    event: MouseEvent;
    kind: "record";
    id: string;
    orderedIds: string[];
  }) => void;
  onExtendDragSelection: (params: {
    event: MouseEvent;
    kind: "record";
    id: string;
    index: number;
    orderedIds: string[];
  }) => void;
  onHandleSelectableClick: (params: {
    event: MouseEvent;
    kind: "record";
    id: string;
    index: number;
    orderedIds: string[];
    onDefault: () => void;
  }) => void;
  onOpenContextMenu: (
    event: MouseEvent,
    target: {
      kind: "record";
      id: string;
      label: string;
      index: number;
    }
  ) => void;
  onSelect: (id: string) => void;
}

export function UnlinkedRecordsSection({
  records,
  selectedId,
  selectedIdSet,
  isRecordSelection,
  visibleRecordOrderIds,
  visibleRecordOrder,
  visibleRecordIndexById,
  onBeginDragSelection,
  onExtendDragSelection,
  onHandleSelectableClick,
  onOpenContextMenu,
  onSelect,
}: UnlinkedRecordsSectionProps) {
  if (records.length === 0) {
    return null;
  }

  const orderedIds = visibleRecordOrder.map((item) => item.id);

  return (
    <div className="px-2 py-2 border-t border-border">
      <div className="flex items-center justify-between px-2 py-1 mb-0.5">
        <span className="text-[10px] font-semibold text-text-dim uppercase tracking-widest">
          미분류
        </span>
        <span className="text-[10px] text-text-dim">{records.length}</span>
      </div>

      {records.map((record) => {
        const index = visibleRecordIndexById.get(record.id) ?? 0;

        return (
          <UnlinkedRecordListItem
            key={record.id}
            record={record}
            isSelected={isRecordSelection && selectedIdSet.has(record.id)}
            isActive={record.id === selectedId}
            onMouseDown={(event) =>
              onBeginDragSelection({
                event,
                kind: "record",
                id: record.id,
                orderedIds: visibleRecordOrderIds,
              })
            }
            onMouseEnter={(event) =>
              onExtendDragSelection({
                event,
                kind: "record",
                id: record.id,
                index,
                orderedIds: visibleRecordOrderIds,
              })
            }
            onClick={(event) =>
              onHandleSelectableClick({
                event,
                kind: "record",
                id: record.id,
                index,
                orderedIds,
                onDefault: () => onSelect(record.id),
              })
            }
            onContextMenu={(event) =>
              onOpenContextMenu(event, {
                kind: "record",
                id: record.id,
                label: record.title,
                index,
              })
            }
          />
        );
      })}
    </div>
  );
}
