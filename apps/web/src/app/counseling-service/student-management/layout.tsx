"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useSpaceSidebarActions } from "./_hooks/use-space-sidebar-actions";
import { useSpaceSidebarSelection } from "./_hooks/use-space-sidebar-selection";
import { StudentManagementProvider } from "@/features/student-management";
import { studentManagementFetchJson } from "@/features/student-management/hooks/student-management-fetch";
import { studentManagementQueryKeys } from "@/features/student-management/hooks/student-management-query-keys";
import { useStudentManagement } from "@/features/student-management/student-management-provider";
import { StudentSpaceCreateModal } from "@/features/student-management/components/space-create-modal";
import { CounselingSpaceGate } from "@/features/counseling-service-shell/counseling-space-gate";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import {
  useCounselingSidebarLayout,
  useSidebarToggleVisibility,
} from "@/features/counseling-service-shell/counseling-sidebar-layout-context";
import {
  SpaceSettingsDrawerProvider,
  SpaceSettingsDrawerHost,
  useSpaceSettingsDrawer,
} from "@/features/space-settings";
import type { LocalImportDraftSummary } from "./_lib/space-sidebar-types";
import { getStudentManagementLayoutUiPolicy } from "./_lib/student-management-layout-ui-policy";
import {
  StudentManagementDeleteSpaceDialog,
  StudentManagementMobileSpaceActionSheet,
  StudentManagementRenameSpaceDialog,
  StudentManagementSpaceContextMenu,
} from "./_components/student-management-space-actions";
import {
  StudentManagementDesktopSpaceSidebar,
  StudentManagementMobileRouteTabs,
  StudentManagementMobileSpaceDrawer,
} from "./_components/student-management-space-navigation";
import { createPatchedHref } from "@/lib/route-state/search-params";
import { useAppRoute } from "@/lib/app-route-context";

/* ── OAuth 결과 토스트 ──
 * URL query param으로 OAuth 결과를 전달받아 표시하는 컴포넌트.
 * useSearchParams()는 브라우저 URL을 읽는 클라이언트 전용 API이므로
 * next/dynamic ssr:false로 명시적으로 클라이언트에서만 실행한다.
 * Suspense 안에서 useSearchParams를 쓰면 Next.js가 해당 서브트리를
 * SSR에서 제외하면서 hydration 불일치가 발생하기 때문이다.
 */

type ToastState = { text: string; type: "success" | "error" } | null;

function OAuthResultToastInner() {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const gdError = searchParams.get("googledrive_error");
    const gdConnected = searchParams.get("googledrive_connected");
    const odError = searchParams.get("onedrive_error");
    const odConnected = searchParams.get("onedrive_connected");

    if (gdConnected === "true") {
      setToast({ text: "Google Drive 연동이 완료됐습니다.", type: "success" });
    } else if (gdError) {
      setToast({
        text: "Google Drive 연동에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
    } else if (odConnected === "true") {
      setToast({ text: "OneDrive 연동이 완료됐습니다.", type: "success" });
    } else if (odError) {
      setToast({
        text: "OneDrive 연동에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
    }

    if (gdError || gdConnected || odError || odConnected) {
      const params = new URLSearchParams(window.location.search);
      params.delete("googledrive_error");
      params.delete("googledrive_connected");
      params.delete("onedrive_error");
      params.delete("onedrive_connected");
      const qs = params.toString();
      router.replace(window.location.pathname + (qs ? `?${qs}` : ""));
    }
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const Icon = toast.type === "success" ? CheckCircle : AlertCircle;
  const bg = toast.type === "success" ? "var(--accent)" : "#ef4444";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: bg,
        color: "#fff",
        padding: "12px 18px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        zIndex: 9999,
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={16} strokeWidth={2.5} />
      {toast.text}
    </div>
  );
}

const OAuthResultToast = dynamic(() => Promise.resolve(OAuthResultToastInner), {
  ssr: false,
});

function SidebarContent({ children }: { children: React.ReactNode }) {
  const {
    spaces,
    spacesLoading,
    selectedSpaceId,
    setSelectedSpaceId,
    refetchSpaces,
    members,
  } = useStudentManagement();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const { normalizeAppPathname, resolveApiHref, resolveAppHref } =
    useAppRoute();
  const normalizedPathname = normalizeAppPathname(pathname);

  const noSpaces = !spacesLoading && spaces.length === 0;
  const isCheckBoardRoute =
    normalizedPathname === "/counseling-service/student-management/check-board";
  const currentSpace =
    spaces.find((space) => space.id === selectedSpaceId) ?? null;
  const [mobileSpaceDrawerOpen, setMobileSpaceDrawerOpen] = useState(false);
  const { studentSidebarCollapsed } = useCounselingSidebarLayout();
  const isStudentDetailRoute =
    /^\/counseling-service\/student-management\/[^/]+$/.test(
      normalizedPathname
    ) &&
    normalizedPathname !==
      "/counseling-service/student-management/members/new" &&
    normalizedPathname !== "/counseling-service/student-management/check-board";

  function resetDetailRouteIfNeeded(
    nextSpaceId: string | null = selectedSpaceId
  ) {
    if (isStudentDetailRoute) {
      router.replace(
        createPatchedHref(
          resolveAppHref("/counseling-service/student-management"),
          new URLSearchParams(window.location.search),
          { spaceId: nextSpaceId }
        )
      );
    }
  }

  const {
    spaceSelection,
    setSpaceSelection,
    contextMenu,
    setContextMenu,
    handleSpaceClick,
    handleSpaceContextMenu,
  } = useSpaceSidebarSelection({
    spaces,
    selectedSpaceId,
    setSelectedSpaceId,
    resetDetailRouteIfNeeded,
  });
  const {
    createModalState,
    closeCreateModal,
    openCreateModal,
    updateCreateModalRouteState,
    spaceActionError,
    setSpaceActionError,
    deletingSpaceId,
    renamingSpaceId,
    renameTarget,
    setRenameTarget,
    renameValue,
    setRenameValue,
    deleteTarget,
    setDeleteTarget,
    openRenameDialog,
    openDeleteDialog,
    handleRenameSpace,
    handleDeleteSpace,
  } = useSpaceSidebarActions({
    selectedSpaceId,
    setSelectedSpaceId,
    refetchSpaces,
    resetDetailRouteIfNeeded,
    setSpaceSelection,
    closeContextMenu: () => setContextMenu(null),
  });
  const contextMenuRef = useClickOutside<HTMLDivElement>(
    () => setContextMenu(null),
    !!contextMenu
  );
  const {
    data: localDraftsData,
    isPending: localDraftsLoading,
    error: localDraftsQueryError,
    refetch: refetchLocalDrafts,
  } = useQuery({
    queryKey: studentManagementQueryKeys.localImportDrafts(),
    queryFn: () =>
      studentManagementFetchJson<{ drafts: LocalImportDraftSummary[] }>(
        resolveApiHref("/api/v1/integrations/local/drafts?limit=100"),
        { method: "GET" },
        "임시 가져오기 초안을 불러오지 못했습니다."
      ),
  });
  const localDrafts = localDraftsData?.drafts ?? [];
  const localDraftCount = localDrafts.length;
  const { openSpaceSettings } = useSpaceSettingsDrawer();
  const handleCreateModalRouteStateChange = useCallback(
    ({
      step,
      draftId,
    }: {
      step: "choose" | "blank" | "import";
      draftId: string | null;
    }) => {
      updateCreateModalRouteState({
        mode: step === "import" ? "import" : step,
        step,
        draftId,
      });
    },
    [updateCreateModalRouteState]
  );
  const localDraftsError =
    localDraftsQueryError instanceof Error
      ? localDraftsQueryError.message
      : localDraftsQueryError
        ? "임시 가져오기 초안을 불러오지 못했습니다."
        : null;

  useEffect(() => {
    setMobileSpaceDrawerOpen(false);
  }, [pathname, selectedSpaceId]);

  const [mobileActionTarget, setMobileActionTarget] = useState<{
    spaceId: string;
    spaceName: string;
  } | null>(null);

  const openMobileSpaceActions = (target: {
    spaceId: string;
    spaceName: string;
  }) => {
    setMobileSpaceDrawerOpen(false);
    window.setTimeout(() => {
      setMobileActionTarget(target);
    }, 140);
  };
  const studentLayoutUiPolicy = getStudentManagementLayoutUiPolicy({
    spacesLoading,
    spaceCount: spaces.length,
  });

  useSidebarToggleVisibility(
    "students",
    studentLayoutUiPolicy.canToggleSidebar
  );

  return (
    <div className="flex flex-1 overflow-hidden md:flex-row flex-col">
      {studentLayoutUiPolicy.showStudentShell ? (
        <StudentManagementMobileRouteTabs
          isCheckBoardRoute={isCheckBoardRoute}
          currentSpaceName={currentSpace?.name ?? "스페이스를 선택해 주세요"}
          onNavigateStudents={() =>
            router.push(
              createPatchedHref(
                resolveAppHref("/counseling-service/student-management"),
                new URLSearchParams(window.location.search),
                { spaceId: selectedSpaceId }
              )
            )
          }
          onNavigateCheckBoard={() =>
            router.push(
              createPatchedHref(
                resolveAppHref(
                  "/counseling-service/student-management/check-board"
                ),
                new URLSearchParams(window.location.search),
                { spaceId: selectedSpaceId }
              )
            )
          }
          onOpenSpaceDrawer={() => setMobileSpaceDrawerOpen(true)}
        />
      ) : null}

      {studentLayoutUiPolicy.showStudentShell ? (
        <StudentManagementDesktopSpaceSidebar
          collapsed={studentSidebarCollapsed}
          spaces={spaces}
          spacesLoading={spacesLoading}
          noSpaces={noSpaces}
          selectedSpaceId={selectedSpaceId}
          spaceSelection={spaceSelection}
          activeMemberCount={members.length}
          spaceActionError={spaceActionError}
          localDraftCount={localDraftCount}
          localDraftsLoading={localDraftsLoading}
          localDraftsError={localDraftsError}
          onCreateSpace={() => openCreateModal("choose")}
          onOpenImportDrafts={() => openCreateModal("import")}
          onSpaceClick={handleSpaceClick}
          onSpaceContextMenu={handleSpaceContextMenu}
        />
      ) : null}
      <main
        className={`scrollbar-subtle flex-1 overflow-y-auto ${
          studentLayoutUiPolicy.showStudentShell
            ? "p-8 max-md:px-3 max-md:py-4"
            : ""
        }`}
      >
        {studentLayoutUiPolicy.surface === "space-gate" ? (
          <CounselingSpaceGate
            variant="student-management"
            onCreateBlankSpace={() => openCreateModal("blank")}
            onImportSpace={() => openCreateModal("import")}
          />
        ) : (
          children
        )}
      </main>
      <StudentManagementMobileSpaceDrawer
        open={mobileSpaceDrawerOpen}
        spaces={spaces}
        selectedSpaceId={selectedSpaceId}
        spaceSelection={spaceSelection}
        activeMemberCount={members.length}
        spaceActionError={spaceActionError}
        localDraftCount={localDraftCount}
        onClose={() => setMobileSpaceDrawerOpen(false)}
        onCreateSpace={() => {
          openCreateModal("choose");
          setMobileSpaceDrawerOpen(false);
        }}
        onOpenImportDrafts={() => {
          openCreateModal("import");
          setMobileSpaceDrawerOpen(false);
        }}
        onSpaceClick={(event, spaceId, index) => {
          handleSpaceClick(event, spaceId, index);
          setMobileSpaceDrawerOpen(false);
        }}
        onOpenSpaceActions={openMobileSpaceActions}
      />
      <StudentManagementMobileSpaceActionSheet
        target={mobileActionTarget}
        onClose={() => setMobileActionTarget(null)}
        onOpenSpaceSettings={(spaceId) => {
          openSpaceSettings({ spaceId });
          setMobileActionTarget(null);
          setMobileSpaceDrawerOpen(false);
        }}
        onRename={(target) => {
          openRenameDialog(target);
          setMobileActionTarget(null);
          setMobileSpaceDrawerOpen(false);
        }}
        onDelete={(target) => {
          openDeleteDialog(target);
          setMobileActionTarget(null);
          setMobileSpaceDrawerOpen(false);
        }}
      />
      {createModalState.open ? (
        <StudentSpaceCreateModal
          initialStep={createModalState.initialStep}
          initialLocalDraftId={createModalState.initialLocalDraftId}
          onRouteStateChange={handleCreateModalRouteStateChange}
          onDraftDiscarded={() => {
            void refetchLocalDrafts();
          }}
          onClose={closeCreateModal}
          onCreated={(space) => {
            setSpaceActionError(null);
            setSelectedSpaceId(space.id);
            refetchSpaces();
            resetDetailRouteIfNeeded(space.id);
            closeCreateModal();
          }}
          onImported={(result) => {
            setSpaceActionError(null);
            const importedSpaceId = result.spaceIds[0] ?? null;
            if (importedSpaceId) {
              setSelectedSpaceId(importedSpaceId);
              resetDetailRouteIfNeeded(importedSpaceId);
            }
            refetchSpaces();
            for (const spaceId of result.spaceIds) {
              void queryClient.invalidateQueries({
                queryKey: studentManagementQueryKeys.members(spaceId),
                exact: true,
              });
            }
            void refetchLocalDrafts();
          }}
        />
      ) : null}

      <StudentManagementSpaceContextMenu
        contextMenu={contextMenu}
        contextMenuRef={contextMenuRef}
        renamingSpaceId={renamingSpaceId}
        deletingSpaceId={deletingSpaceId}
        onRename={openRenameDialog}
        onDelete={openDeleteDialog}
      />
      <StudentManagementRenameSpaceDialog
        target={renameTarget}
        renameValue={renameValue}
        renamingSpaceId={renamingSpaceId}
        onChangeRenameValue={setRenameValue}
        onClose={() => setRenameTarget(null)}
        onConfirm={(spaceId, currentName) =>
          void handleRenameSpace(spaceId, currentName)
        }
      />
      <StudentManagementDeleteSpaceDialog
        target={deleteTarget}
        deletingSpaceId={deletingSpaceId}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(spaceId) => void handleDeleteSpace(spaceId)}
      />
    </div>
  );
}

export default function StudentManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <StudentManagementProvider>
        <SpaceSettingsDrawerProvider>
          <Suspense fallback={null}>
            <SidebarContent>{children}</SidebarContent>
          </Suspense>
          <SpaceSettingsDrawerHost />
        </SpaceSettingsDrawerProvider>
        <Suspense fallback={null}>
          <OAuthResultToast />
        </Suspense>
      </StudentManagementProvider>
    </Suspense>
  );
}
