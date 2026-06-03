"use client";

import { Link2 } from "lucide-react";
import type {
  StudentAssignmentStatus,
  StudentAttendanceStatus,
  StudentBoardResponse,
} from "@yeon/api-contract";

import type { Member } from "../types";

type BoardRow = StudentBoardResponse["rows"][number];

type DraftRow = {
  attendanceStatus: StudentAttendanceStatus;
  assignmentStatus: StudentAssignmentStatus;
  assignmentLink: string;
};

interface StudentCheckBoardStatusEditorProps {
  members: Member[];
  rowMap: Map<string, BoardRow>;
  drafts: Record<string, DraftRow>;
  isUpdatingBoard: boolean;
  onDraftChange: (memberId: string, patch: Partial<DraftRow>) => void;
  onSave: (memberId: string, draft: DraftRow) => void;
}

const DEFAULT_DRAFT: DraftRow = {
  attendanceStatus: "unknown",
  assignmentStatus: "unknown",
  assignmentLink: "",
};

function formatLastPublicCheckAt(value: string | null | undefined) {
  if (!value) {
    return "기록 없음";
  }

  return new Date(value).toLocaleString("ko-KR");
}

function SelfCheckReadyBadge({ ready }: { ready: boolean }) {
  return ready ? (
    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300">
      가능
    </span>
  ) : (
    <span className="rounded-full bg-[#fafafa] px-2 py-1 text-[11px] text-text-secondary-300">
      전화번호 필요
    </span>
  );
}

function getDraft(drafts: Record<string, DraftRow>, memberId: string) {
  return drafts[memberId] ?? DEFAULT_DRAFT;
}

export function StudentCheckBoardStatusEditor({
  members,
  rowMap,
  drafts,
  isUpdatingBoard,
  onDraftChange,
  onSave,
}: StudentCheckBoardStatusEditorProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface-2 p-3 sm:p-4">
      <div>
        <div className="text-sm font-semibold text-text">
          현재 상태 빠른 수정
        </div>
        <p className="mt-1 text-[11px] text-text-dim">
          최신 보드는 계속 유지하고, 실제 변경이 있을 때만 날짜 이력도 함께
          남깁니다.
        </p>
      </div>

      <div
        className="space-y-2 sm:hidden"
        data-tutorial="check-board-member-board-mobile"
      >
        {members.map((member) => {
          const row = rowMap.get(member.id);
          const draft = getDraft(drafts, member.id);

          return (
            <article
              key={member.id}
              className="rounded-xl border border-border bg-surface px-2.5 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold tracking-[-0.02em] text-text">
                    {member.name}
                  </div>
                </div>
                <SelfCheckReadyBadge ready={Boolean(row?.isSelfCheckReady)} />
              </div>

              <div className="mt-1.5 grid grid-cols-[80px_80px_minmax(0,1fr)_58px] gap-1.5">
                <select
                  aria-label={`${member.name} 출석 상태`}
                  className="h-10 rounded-lg border border-border bg-surface-2 px-2 text-[12px] text-text outline-none"
                  value={draft.attendanceStatus}
                  onChange={(event) =>
                    onDraftChange(member.id, {
                      attendanceStatus: event.target
                        .value as StudentAttendanceStatus,
                    })
                  }
                >
                  <option value="unknown">미정</option>
                  <option value="present">출석</option>
                  <option value="absent">미출석</option>
                </select>
                <select
                  aria-label={`${member.name} 과제 상태`}
                  className="h-10 rounded-lg border border-border bg-surface-2 px-2 text-[12px] text-text outline-none"
                  value={draft.assignmentStatus}
                  onChange={(event) =>
                    onDraftChange(member.id, {
                      assignmentStatus: event.target
                        .value as StudentAssignmentStatus,
                    })
                  }
                >
                  <option value="unknown">미정</option>
                  <option value="done">완료</option>
                  <option value="not_done">미완료</option>
                </select>
                <div className="flex h-10 min-w-0 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5">
                  <Link2 size={12} className="shrink-0 text-text-dim" />
                  <input
                    aria-label={`${member.name} 과제 링크`}
                    className="w-full min-w-0 bg-transparent text-[12px] text-text outline-none placeholder:text-text-dim"
                    value={draft.assignmentLink}
                    onChange={(event) =>
                      onDraftChange(member.id, {
                        assignmentLink: event.target.value,
                      })
                    }
                    placeholder="링크"
                  />
                </div>
                <button
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 px-2 text-[12px] font-medium text-text-secondary disabled:opacity-50"
                  disabled={isUpdatingBoard}
                  onClick={() => onSave(member.id, draft)}
                >
                  저장
                </button>
              </div>

              <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[10px] leading-none text-text-secondary">
                <span className="truncate">
                  {member.phone ?? "전화번호 없음"}
                </span>
                <span className="shrink-0 text-text-dim">·</span>
                <span className="truncate">
                  최근 공개체크{" "}
                  {formatLastPublicCheckAt(row?.lastPublicCheckAt)}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div
        className="hidden overflow-hidden rounded-2xl border border-border bg-surface xl:block"
        data-tutorial="check-board-member-board-desktop"
      >
        <div className="border-b border-border bg-surface-2 px-4 py-2 text-[11px] font-medium tracking-[0.04em] text-text-dim">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="min-w-0 flex-[1.8] truncate">수강생</span>
            <span className="w-[64px] shrink-0 text-center">셀프체크</span>
            <span className="w-[92px] shrink-0">출석</span>
            <span className="w-[92px] shrink-0">과제</span>
            <span className="min-w-0 flex-[1.35] truncate">과제 링크</span>
            <span className="w-[112px] shrink-0 truncate text-right">
              최근 공개체크
            </span>
            <span className="w-[72px] shrink-0 text-center">저장</span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {members.map((member) => {
            const row = rowMap.get(member.id);
            const draft = getDraft(drafts, member.id);

            return (
              <div
                key={member.id}
                className="flex min-w-0 items-center gap-2.5 px-4 py-2.5"
              >
                <div className="min-w-0 flex-[1.8]">
                  <div className="truncate text-[13px] font-semibold tracking-[-0.02em] text-text">
                    {member.name}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] leading-none text-text-dim">
                    {member.phone ?? "전화번호 없음"}
                  </div>
                </div>

                <div className="flex w-[64px] shrink-0 justify-center">
                  <SelfCheckReadyBadge ready={Boolean(row?.isSelfCheckReady)} />
                </div>

                <select
                  className="h-9 w-[92px] shrink-0 rounded-lg border border-border bg-surface-2 px-2.5 text-[13px] text-text outline-none transition-colors hover:border-border-light"
                  value={draft.attendanceStatus}
                  onChange={(event) =>
                    onDraftChange(member.id, {
                      attendanceStatus: event.target
                        .value as StudentAttendanceStatus,
                    })
                  }
                >
                  <option value="unknown">미정</option>
                  <option value="present">출석</option>
                  <option value="absent">미출석</option>
                </select>

                <select
                  className="h-9 w-[92px] shrink-0 rounded-lg border border-border bg-surface-2 px-2.5 text-[13px] text-text outline-none transition-colors hover:border-border-light"
                  value={draft.assignmentStatus}
                  onChange={(event) =>
                    onDraftChange(member.id, {
                      assignmentStatus: event.target
                        .value as StudentAssignmentStatus,
                    })
                  }
                >
                  <option value="unknown">미정</option>
                  <option value="done">완료</option>
                  <option value="not_done">미완료</option>
                </select>

                <div className="flex h-9 min-w-0 flex-[1.35] items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 transition-colors hover:border-border-light">
                  <Link2 size={13} className="shrink-0 text-text-dim" />
                  <input
                    className="w-full min-w-0 bg-transparent text-[13px] text-text outline-none placeholder:text-text-dim"
                    value={draft.assignmentLink}
                    onChange={(event) =>
                      onDraftChange(member.id, {
                        assignmentLink: event.target.value,
                      })
                    }
                    placeholder="과제 링크"
                  />
                </div>

                <div className="w-[112px] shrink-0 truncate text-right text-[11px] text-text-secondary">
                  {formatLastPublicCheckAt(row?.lastPublicCheckAt)}
                </div>

                <button
                  className="inline-flex h-9 w-[72px] shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 px-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:border-border-light hover:text-text disabled:opacity-50"
                  disabled={isUpdatingBoard}
                  onClick={() => onSave(member.id, draft)}
                >
                  저장
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden gap-3 sm:grid xl:hidden">
        {members.map((member) => {
          const row = rowMap.get(member.id);
          const draft = getDraft(drafts, member.id);

          return (
            <article
              key={member.id}
              className="rounded-2xl border border-border bg-surface px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold tracking-[-0.02em] text-text">
                    {member.name}
                  </div>
                  <div className="mt-1 truncate text-[12px] text-text-dim">
                    {member.phone ?? "전화번호 없음"}
                  </div>
                </div>

                <SelfCheckReadyBadge ready={Boolean(row?.isSelfCheckReady)} />
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[96px_96px_minmax(0,1fr)_88px]">
                <select
                  className="h-10 rounded-xl border border-border bg-surface-2 px-3 text-sm text-text outline-none transition-colors hover:border-border-light"
                  value={draft.attendanceStatus}
                  onChange={(event) =>
                    onDraftChange(member.id, {
                      attendanceStatus: event.target
                        .value as StudentAttendanceStatus,
                    })
                  }
                >
                  <option value="unknown">출석 · 미정</option>
                  <option value="present">출석</option>
                  <option value="absent">미출석</option>
                </select>

                <select
                  className="h-10 rounded-xl border border-border bg-surface-2 px-3 text-sm text-text outline-none transition-colors hover:border-border-light"
                  value={draft.assignmentStatus}
                  onChange={(event) =>
                    onDraftChange(member.id, {
                      assignmentStatus: event.target
                        .value as StudentAssignmentStatus,
                    })
                  }
                >
                  <option value="unknown">과제 · 미정</option>
                  <option value="done">완료</option>
                  <option value="not_done">미완료</option>
                </select>

                <div className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 transition-colors hover:border-border-light">
                  <Link2 size={14} className="shrink-0 text-text-dim" />
                  <input
                    className="w-full min-w-0 bg-transparent text-sm text-text outline-none placeholder:text-text-dim"
                    value={draft.assignmentLink}
                    onChange={(event) =>
                      onDraftChange(member.id, {
                        assignmentLink: event.target.value,
                      })
                    }
                    placeholder="과제 링크"
                  />
                </div>

                <button
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface-2 px-3 text-sm font-medium text-text-secondary transition-colors hover:border-border-light hover:text-text disabled:opacity-50"
                  disabled={isUpdatingBoard}
                  onClick={() => onSave(member.id, draft)}
                >
                  저장
                </button>
              </div>

              <div className="mt-2 text-[11px] text-text-secondary">
                최근 공개체크: {formatLastPublicCheckAt(row?.lastPublicCheckAt)}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
