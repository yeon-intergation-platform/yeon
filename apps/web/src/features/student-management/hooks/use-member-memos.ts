"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { ActivityLog, Memo } from "../types";
import { studentManagementFetchJson } from "./student-management-fetch";
import { studentManagementQueryKeys } from "./student-management-query-keys";

interface UseMemberMemosParams {
  spaceId: string | null;
  memberId: string | null;
}

function toMemo(log: ActivityLog): Memo {
  const metadata = log.metadata ?? {};
  const noteText =
    typeof metadata.noteText === "string"
      ? metadata.noteText
      : typeof metadata.text === "string"
        ? metadata.text
        : "";
  const author =
    typeof metadata.authorLabel === "string" ? metadata.authorLabel : undefined;

  return {
    id: log.id,
    date: log.recordedAt.slice(0, 10),
    text: noteText,
    author,
  };
}

export function useMemberMemos({ spaceId, memberId }: UseMemberMemosParams) {
  const queryClient = useQueryClient();
  const [newMemoText, setNewMemoText] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const memosQueryKey = studentManagementQueryKeys.memberMemos(
    spaceId,
    memberId
  );

  const { data, isPending, error } = useQuery({
    queryKey: memosQueryKey,
    queryFn: () =>
      studentManagementFetchJson<{ logs: ActivityLog[]; totalCount: number }>(
        `/api/v1/spaces/${spaceId}/members/${memberId}/activity-logs?type=coaching-note&limit=100`,
        { method: "GET" },
        "메모를 불러오지 못했습니다."
      ),
    enabled: !!spaceId && !!memberId,
  });

  const memos = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.logs.map(toMemo).filter((memo) => memo.text.trim().length > 0);
  }, [data]);

  useEffect(() => {
    setNewMemoText("");
    setSaveError(null);
  }, [spaceId, memberId]);

  async function addMemo() {
    if (!spaceId || !memberId || !newMemoText.trim() || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = await studentManagementFetchJson<{ log?: ActivityLog }>(
        `/api/v1/spaces/${spaceId}/members/${memberId}/activity-logs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: newMemoText.trim() }),
        },
        "메모를 저장하지 못했습니다."
      );

      setNewMemoText("");

      if (!payload.log) {
        await queryClient.invalidateQueries({
          queryKey: memosQueryKey,
        });
        return;
      }

      queryClient.setQueryData<
        { logs: ActivityLog[]; totalCount: number } | undefined
      >(memosQueryKey, (current) => {
        if (!current) {
          return {
            logs: [payload.log!],
            totalCount: 1,
          };
        }

        return {
          logs: [payload.log!, ...current.logs],
          totalCount: current.totalCount + 1,
        };
      });
    } catch (caughtError) {
      setSaveError(
        caughtError instanceof Error
          ? caughtError.message
          : "메모를 저장하지 못했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return {
    memos,
    totalCount: data?.totalCount ?? 0,
    newMemoText,
    setNewMemoText,
    addMemo,
    loading: !!spaceId && !!memberId && isPending,
    error:
      saveError ||
      (error instanceof Error
        ? error.message
        : error
          ? "메모를 불러오지 못했습니다."
          : null),
    isSaving,
  };
}
