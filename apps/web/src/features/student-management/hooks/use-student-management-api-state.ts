"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { Member, Space } from "../types";
import { studentManagementFetchJson } from "./student-management-fetch";
import { studentManagementQueryKeys } from "./student-management-query-keys";
import { createPatchedHref } from "@/lib/route-state/search-params";
import { useAppRoute } from "@/lib/app-route-context";

function isStudentDetailPath(pathname: string) {
  const prefix = "/counseling-service/student-management/";

  if (!pathname.startsWith(prefix)) {
    return false;
  }

  const rest = pathname.slice(prefix.length);

  return !!rest && !rest.includes("/") && rest !== "check-board";
}

export function useStudentManagementApiState() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { normalizeAppPathname, resolveApiHref } = useAppRoute();
  const queryClient = useQueryClient();

  const {
    data: spacesData,
    isPending: spacesLoading,
    error: spacesQueryError,
  } = useQuery({
    queryKey: studentManagementQueryKeys.spaces(),
    queryFn: () =>
      studentManagementFetchJson<{ spaces: Space[] }>(
        resolveApiHref("/api/v1/spaces"),
        { method: "GET" },
        "스페이스 목록을 불러오지 못했습니다."
      ),
  });

  const spaces = spacesData ? spacesData.spaces : [];
  const spacesError =
    spacesQueryError instanceof Error
      ? spacesQueryError.message
      : spacesQueryError
        ? "스페이스 목록을 불러오지 못했습니다."
        : null;

  const normalizedPathname = normalizeAppPathname(pathname);
  const currentSearchParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );
  const spaceIdFromQuery = currentSearchParams.get("spaceId");
  const pendingSpaceIdRef = useRef<string | null>(null);
  const lastSelectedSpaceIdRef = useRef<string | null>(null);
  const [optimisticSpaceId, setOptimisticSpaceId] = useState<string | null>(
    null
  );
  const shouldDeferDefaultSpaceSelection =
    isStudentDetailPath(normalizedPathname) &&
    (!spaceIdFromQuery ||
      !spaces.some((space) => space.id === spaceIdFromQuery));
  const matchedSpaceFromQuery = useMemo(
    () =>
      spaceIdFromQuery
        ? (spaces.find((space) => space.id === spaceIdFromQuery) ?? null)
        : null,
    [spaceIdFromQuery, spaces]
  );

  const replaceSearchState = useCallback(
    (patch: Record<string, string | null>) => {
      const nextUrl = createPatchedHref(pathname, currentSearchParams, patch);
      router.replace(nextUrl);
    },
    [currentSearchParams, pathname, router]
  );

  useEffect(() => {
    const currentQuerySpaceId = matchedSpaceFromQuery?.id ?? null;
    if (!currentQuerySpaceId) {
      return;
    }

    if (pendingSpaceIdRef.current === currentQuerySpaceId) {
      pendingSpaceIdRef.current = null;
    }
    lastSelectedSpaceIdRef.current = currentQuerySpaceId;

    setOptimisticSpaceId((current) =>
      current === currentQuerySpaceId ? null : current
    );
  }, [matchedSpaceFromQuery]);

  useEffect(() => {
    if (spaces.length === 0 || shouldDeferDefaultSpaceSelection) {
      return;
    }

    if (matchedSpaceFromQuery) {
      return;
    }

    const nextSpaceId =
      (lastSelectedSpaceIdRef.current &&
      spaces.some((space) => space.id === lastSelectedSpaceIdRef.current)
        ? lastSelectedSpaceIdRef.current
        : null) ??
      spaces[0]?.id ??
      null;
    if (!nextSpaceId) {
      return;
    }

    if (
      pendingSpaceIdRef.current &&
      pendingSpaceIdRef.current !== nextSpaceId
    ) {
      return;
    }

    pendingSpaceIdRef.current = nextSpaceId;
    setOptimisticSpaceId((current) => current ?? nextSpaceId);
    replaceSearchState({ spaceId: nextSpaceId });
  }, [
    matchedSpaceFromQuery,
    replaceSearchState,
    shouldDeferDefaultSpaceSelection,
    spaces,
  ]);

  const selectedSpaceId =
    optimisticSpaceId ?? matchedSpaceFromQuery?.id ?? null;
  const setSelectedSpaceId = useCallback(
    (id: string | null) => {
      if (selectedSpaceId === id && pendingSpaceIdRef.current === null) {
        return;
      }

      pendingSpaceIdRef.current = id;
      lastSelectedSpaceIdRef.current = id;
      setOptimisticSpaceId(id);
      replaceSearchState({ spaceId: id });
    },
    [replaceSearchState, selectedSpaceId]
  );

  useEffect(() => {
    if (!optimisticSpaceId) {
      return;
    }

    if (pendingSpaceIdRef.current === optimisticSpaceId) {
      return;
    }

    if (matchedSpaceFromQuery?.id === optimisticSpaceId) {
      return;
    }

    if (spaces.some((space) => space.id === optimisticSpaceId)) {
      return;
    }

    setOptimisticSpaceId(null);
  }, [matchedSpaceFromQuery, optimisticSpaceId, spaces]);

  const {
    data: membersData,
    isPending: membersPending,
    error: membersQueryError,
  } = useQuery({
    queryKey: studentManagementQueryKeys.members(selectedSpaceId),
    queryFn: () =>
      studentManagementFetchJson<{ members: Member[] }>(
        resolveApiHref(`/api/v1/spaces/${selectedSpaceId}/members`),
        { method: "GET" },
        "수강생 목록을 불러오지 못했습니다."
      ),
    enabled: !!selectedSpaceId,
  });

  const members = membersData ? membersData.members : [];
  const membersLoading = !!selectedSpaceId && membersPending;
  const membersError =
    membersQueryError instanceof Error
      ? membersQueryError.message
      : membersQueryError
        ? "수강생 목록을 불러오지 못했습니다."
        : null;

  const refetchSpaces = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: studentManagementQueryKeys.spaces(),
    });
  }, [queryClient]);

  const refetchMembers = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: studentManagementQueryKeys.membersRoot(),
    });
  }, [queryClient]);

  const patchMemberInCaches = useCallback(
    (memberId: string, patch: Partial<Member>) => {
      queryClient.setQueriesData<{ members: Member[] }>(
        { queryKey: studentManagementQueryKeys.membersRoot() },
        (current) => {
          if (!current) return current;

          return {
            ...current,
            members: current.members.map((member) =>
              member.id === memberId ? { ...member, ...patch } : member
            ),
          };
        }
      );

      queryClient.setQueryData<{ member: Member } | undefined>(
        studentManagementQueryKeys.member(memberId),
        (current) => {
          if (!current) return current;
          return {
            ...current,
            member: { ...current.member, ...patch },
          };
        }
      );
    },
    [queryClient]
  );

  return {
    spaces,
    spacesLoading,
    spacesError,
    selectedSpaceId,
    setSelectedSpaceId,
    refetchSpaces,
    members,
    membersLoading,
    membersError,
    refetchMembers,
    patchMemberInCaches,
  };
}
