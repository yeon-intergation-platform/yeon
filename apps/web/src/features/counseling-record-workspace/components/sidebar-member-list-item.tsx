"use client";

import { memo } from "react";
import type { MouseEvent } from "react";
import type { MemberWithStatus } from "@/features/counseling-record-workspace/hooks/use-space-members";
import type { RecordItem } from "@/features/counseling-record-workspace/lib/types";

function fmtDaysSince(days: number | null): string {
  if (days === null) return "상담 없음";
  if (days === 0) return "오늘";
  return `${days}일 전`;
}

// ---------------------------------------------------------------------------
// MemberListItem — React.memo로 변경되지 않은 항목의 re-render를 차단
// 141명 기준 클릭 시 141번 → 2~3번(이전 선택 + 새 선택 + 확장 변경)으로 감소
// ---------------------------------------------------------------------------

interface MemberListItemProps {
  member: MemberWithStatus;
  memberRecords: RecordItem[];
  memberRecordsSignature: string;
  isMultiSelected: boolean;
  isActive: boolean;
  isExpanded: boolean;
  selectedRecordId: string | null;
  recordMultiSelectedSet: ReadonlySet<string>;
  /** ref 기반 안정 핸들러 — 참조가 변하지 않음 */
  actions: MemberItemActions;
}

export interface MemberItemActions {
  onMemberClick: (
    e: MouseEvent,
    id: string,
    index: number,
    name: string
  ) => void;
  onMemberMouseDown: (e: MouseEvent, id: string) => void;
  onMemberMouseEnter: (e: MouseEvent, id: string, index: number) => void;
  onMemberContextMenu: (
    e: MouseEvent,
    id: string,
    name: string,
    index: number
  ) => void;
  onRecordClick: (e: MouseEvent, id: string, index: number) => void;
  onRecordMouseDown: (e: MouseEvent, id: string) => void;
  onRecordMouseEnter: (e: MouseEvent, id: string, index: number) => void;
  onRecordContextMenu: (
    e: MouseEvent,
    id: string,
    title: string,
    index: number
  ) => void;
}

export const MemberListItem = memo(
  function MemberListItem({
    member,
    memberRecords,
    memberRecordsSignature: _memberRecordsSignature,
    isMultiSelected,
    isActive,
    isExpanded,
    selectedRecordId,
    recordMultiSelectedSet,
    actions,
  }: MemberListItemProps) {
    return (
      <div>
        <button
          className={`select-none w-full flex items-center gap-2 px-2 py-[7px] rounded-md text-left transition-colors cursor-pointer font-[inherit] border-none ${
            isMultiSelected
              ? "bg-accent-dim border border-accent-border"
              : isActive
                ? "bg-surface-3 border border-border-light"
                : "bg-transparent hover:bg-surface-3"
          }`}
          onMouseDown={(e) => actions.onMemberMouseDown(e, member.id)}
          onMouseEnter={(e) =>
            actions.onMemberMouseEnter(
              e,
              member.id,
              0 /* index resolved in parent */
            )
          }
          onClick={(e) => actions.onMemberClick(e, member.id, 0, member.name)}
          onContextMenu={(e) =>
            actions.onMemberContextMenu(e, member.id, member.name, 0)
          }
        >
          {member.indicator === "recent" && (
            <span className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" />
          )}
          {member.indicator === "warning" && (
            <span className="w-1.5 h-1.5 rounded-full bg-text-secondary flex-shrink-0" />
          )}
          {member.indicator === "none" && (
            <span className="w-1.5 h-1.5 rounded-full bg-surface-4 border border-border flex-shrink-0" />
          )}

          <span className="flex-1 text-sm truncate text-text">
            {member.name}
          </span>

          <span
            className={`text-[10px] flex-shrink-0 tabular-nums ${
              member.indicator === "recent"
                ? "text-green"
                : member.indicator === "warning"
                  ? "text-text-secondary"
                  : "text-text-dim"
            }`}
          >
            {fmtDaysSince(member.daysSinceLast)}
          </span>

          {memberRecords.length > 0 && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className={`flex-shrink-0 text-text-dim transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`}
            >
              <path
                d="M3 2l4 3-4 3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {isExpanded && memberRecords.length > 0 && (
          <div className="ml-4 border-l border-border pl-2 mb-1">
            {memberRecords.map((rec) => (
              <button
                key={rec.id}
                className={`select-none w-full text-left px-2 py-[5px] rounded text-xs truncate transition-colors cursor-pointer font-[inherit] border-none ${
                  recordMultiSelectedSet.has(rec.id)
                    ? "bg-accent-dim text-text border border-accent-border"
                    : rec.id === selectedRecordId
                      ? "bg-surface-3 text-accent"
                      : "bg-transparent text-text-dim hover:text-text hover:bg-surface-3"
                }`}
                onMouseDown={(e) => actions.onRecordMouseDown(e, rec.id)}
                onMouseEnter={(e) => actions.onRecordMouseEnter(e, rec.id, 0)}
                onDragStart={(e) => e.preventDefault()}
                onClick={(e) => actions.onRecordClick(e, rec.id, 0)}
                onContextMenu={(e) =>
                  actions.onRecordContextMenu(e, rec.id, rec.title, 0)
                }
              >
                {rec.title}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
  (prev, next) =>
    // member 객체는 records 폴링마다 새 참조 → 필드 레벨 비교 필수
    prev.member.id === next.member.id &&
    prev.member.indicator === next.member.indicator &&
    prev.member.daysSinceLast === next.member.daysSinceLast &&
    prev.member.counselingCount === next.member.counselingCount &&
    prev.member.name === next.member.name &&
    prev.isMultiSelected === next.isMultiSelected &&
    prev.isActive === next.isActive &&
    prev.isExpanded === next.isExpanded &&
    prev.selectedRecordId === next.selectedRecordId &&
    prev.memberRecordsSignature === next.memberRecordsSignature &&
    prev.recordMultiSelectedSet === next.recordMultiSelectedSet &&
    prev.actions === next.actions
);
