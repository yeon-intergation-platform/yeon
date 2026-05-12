import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  counselingWorkspaceFetchJson,
  counselingWorkspaceFetchJsonOr,
  counselingWorkspaceFetchVoid,
} from "@/features/counseling-record-workspace/api/counseling-workspace-fetch";
import { counselingWorkspaceQueryKeys } from "@/features/counseling-record-workspace/api/counseling-workspace-query-keys";
import { detectRecordMemberMismatch } from "@/features/counseling-record-workspace/lib/record-member-mismatch";
import type { RecordItem } from "@/features/counseling-record-workspace/lib/types";
import { resolveApiHrefForCurrentPath } from "@/lib/app-route-paths";

const LAST_SPACE_KEY = "yeon_last_space_id";

export type LinkMemberMode = "existing" | "new";

export interface LinkMemberSpace {
  id: string;
  name: string;
}

export interface LinkMemberMember {
  id: string;
  name: string;
  email?: string | null;
  status: string;
}

type UseLinkMemberModalControllerParams = {
  recordId: string;
  record: RecordItem;
  studentName: string;
  currentMemberId: string | null;
  onClose: () => void;
  onLinked: (memberId: string | null) => void;
};

export function useLinkMemberModalController({
  recordId,
  record,
  studentName,
  currentMemberId,
  onClose,
  onLinked,
}: UseLinkMemberModalControllerParams) {
  const [mode, setMode] = useState<LinkMemberMode>("existing");
  const [selectedSpaceId, setSelectedSpaceId] = useState("");
  const [query, setQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    currentMemberId
  );
  const [newName, setNewName] = useState(studentName || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: spacesData, isPending: spacesLoading } = useQuery({
    queryKey: counselingWorkspaceQueryKeys.spaces(),
    queryFn: async () =>
      counselingWorkspaceFetchJsonOr<{ spaces: LinkMemberSpace[] }>(
        resolveApiHrefForCurrentPath("/api/v1/spaces"),
        { spaces: [] }
      ),
  });
  const spaces = spacesData ? spacesData.spaces : [];

  useEffect(() => {
    if (!spacesData || spaces.length === 0) return;
    const lastId = localStorage.getItem(LAST_SPACE_KEY);
    const defaultId =
      lastId && spaces.some((space) => space.id === lastId)
        ? lastId
        : spaces[0]
          ? spaces[0].id
          : "";
    setSelectedSpaceId(defaultId);
  }, [spacesData, spaces]);

  const { data: membersData, isPending: membersLoading } = useQuery({
    queryKey: counselingWorkspaceQueryKeys.spaceMembers(selectedSpaceId),
    queryFn: async () =>
      counselingWorkspaceFetchJsonOr<{ members: LinkMemberMember[] }>(
        resolveApiHrefForCurrentPath(
          `/api/v1/spaces/${selectedSpaceId}/members`
        ),
        { members: [] }
      ),
    enabled: !!selectedSpaceId,
  });
  const members = membersData ? membersData.members : [];

  const trimmedQuery = query.trim().toLowerCase();
  const filteredMembers = trimmedQuery
    ? members.filter((member) =>
        member.name.toLowerCase().includes(trimmedQuery)
      )
    : members;

  const mismatchWarning = detectRecordMemberMismatch(
    record,
    members,
    mode === "existing" ? selectedMemberId : currentMemberId
  );

  const patchMember = async (memberId: string | null) => {
    await counselingWorkspaceFetchVoid(
      resolveApiHrefForCurrentPath(`/api/v1/counseling-records/${recordId}`),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      },
      "연결에 실패했습니다."
    );
  };

  const handleLinkExisting = async () => {
    if (!selectedMemberId) return;
    setError(null);
    setSubmitting(true);
    try {
      await patchMember(selectedMemberId);
      if (selectedSpaceId) {
        localStorage.setItem(LAST_SPACE_KEY, selectedSpaceId);
      }
      onLinked(selectedMemberId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAndLink = async () => {
    if (!newName.trim() || !selectedSpaceId) return;
    setError(null);
    setSubmitting(true);
    try {
      const { member } = await counselingWorkspaceFetchJson<{
        member: LinkMemberMember;
      }>(
        resolveApiHrefForCurrentPath(
          `/api/v1/spaces/${selectedSpaceId}/members`
        ),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName.trim() }),
        },
        "수강생을 등록하지 못했습니다."
      );

      await patchMember(member.id);
      localStorage.setItem(LAST_SPACE_KEY, selectedSpaceId);
      onLinked(member.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlink = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await patchMember(null);
      onLinked(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    mode,
    setMode,
    selectedSpaceId,
    setSelectedSpaceId,
    query,
    setQuery,
    selectedMemberId,
    setSelectedMemberId,
    newName,
    setNewName,
    submitting,
    error,
    spacesLoading,
    spaces,
    membersLoading,
    filteredMembers,
    mismatchWarning,
    handleLinkExisting,
    handleCreateAndLink,
    handleUnlink,
  };
}
