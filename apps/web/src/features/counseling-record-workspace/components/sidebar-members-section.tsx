"use client";

import type { MemberWithStatus } from "@/features/counseling-record-workspace/hooks/use-space-members";
import type { RecordItem } from "@/features/counseling-record-workspace/lib/types";
import {
  MemberListItem,
  type MemberItemActions,
} from "./sidebar-member-list-item";

const EMPTY_MEMBER_RECORDS: RecordItem[] = [];

interface SidebarMembersSectionProps {
  members: MemberWithStatus[];
  membersLoading: boolean;
  hasCurrentSpace: boolean;
  memberRecordsMap: ReadonlyMap<string, RecordItem[]>;
  isMemberSelection: boolean;
  selectedIdSet: ReadonlySet<string>;
  selectedMemberId: string | null;
  expandedMemberId: string | null;
  selectedRecordId: string | null;
  recordMultiSelectedSet: ReadonlySet<string>;
  actions: MemberItemActions;
}

function buildMemberRecordsSignature(records: RecordItem[]) {
  return records
    .map((record) =>
      [
        record.id,
        record.title,
        record.status,
        record.memberId ?? "",
        record.createdAt,
      ].join(":")
    )
    .join("|");
}

export function SidebarMembersSection({
  members,
  membersLoading,
  hasCurrentSpace,
  memberRecordsMap,
  isMemberSelection,
  selectedIdSet,
  selectedMemberId,
  expandedMemberId,
  selectedRecordId,
  recordMultiSelectedSet,
  actions,
}: SidebarMembersSectionProps) {
  return (
    <div className="px-2 py-2">
      <div
        className="flex items-center justify-between px-2 py-1 mb-0.5"
        data-tutorial="members-section"
      >
        <span className="text-[10px] font-semibold text-text-dim uppercase tracking-widest">
          수강생
        </span>
        {!membersLoading && (
          <span className="text-[10px] text-text-dim">{members.length}명</span>
        )}
      </div>

      {membersLoading ? (
        <div className="px-3 py-3 text-xs text-text-dim text-center">
          불러오는 중…
        </div>
      ) : members.length === 0 ? (
        <div className="px-3 py-3 text-xs text-text-dim">
          {hasCurrentSpace
            ? "등록된 수강생이 없습니다"
            : "스페이스를 선택하세요"}
        </div>
      ) : (
        members.map((member) => {
          const mappedRecords = memberRecordsMap.get(member.id);
          const memberRecords =
            mappedRecords !== undefined ? mappedRecords : EMPTY_MEMBER_RECORDS;

          return (
            <MemberListItem
              key={member.id}
              member={member}
              memberRecords={memberRecords}
              memberRecordsSignature={buildMemberRecordsSignature(
                memberRecords
              )}
              isMultiSelected={
                isMemberSelection && selectedIdSet.has(member.id)
              }
              isActive={member.id === selectedMemberId}
              isExpanded={expandedMemberId === member.id}
              selectedRecordId={selectedRecordId}
              recordMultiSelectedSet={recordMultiSelectedSet}
              actions={actions}
            />
          );
        })
      )}
    </div>
  );
}
