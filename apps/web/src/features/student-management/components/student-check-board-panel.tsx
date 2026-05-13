"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  LoaderCircle,
  MapPin,
  QrCode,
  Search,
} from "lucide-react";
import type {
  CreatePublicCheckSessionBody,
  PublicCheckLocationSearchResponse,
  PublicCheckLocationSearchResult,
  StudentBoardResponse,
  StudentAssignmentStatus,
  StudentAttendanceStatus,
} from "@yeon/api-contract";

import type { Member } from "../types";
import {
  usePublicCheckLocationSearch,
  useSpaceStudentBoard,
} from "../hooks/use-space-student-board";
import { useStudentManagement } from "../student-management-provider";
import { StudentBoardGrassRoster } from "./student-board-grass-roster";
import { StudentCheckBoardStatusEditor } from "./student-check-board-status-editor";

interface StudentCheckBoardPanelProps {
  spaceId: string;
  members: Member[];
}

type DraftRow = {
  attendanceStatus: StudentAttendanceStatus;
  assignmentStatus: StudentAssignmentStatus;
  assignmentLink: string;
};

const DEFAULT_LOCATION_RADIUS_METERS = 150;
const MIN_LOCATION_RADIUS_METERS = 50;
const MAX_LOCATION_RADIUS_METERS = 300;

function getCheckModeLabel(mode: CreatePublicCheckSessionBody["checkMode"]) {
  switch (mode) {
    case "attendance_only":
      return "출석";
    case "assignment_only":
      return "과제";
    case "attendance_and_assignment":
      return "출석 + 과제";
  }
}

function getCheckModeActionDescription(
  mode: CreatePublicCheckSessionBody["checkMode"]
) {
  switch (mode) {
    case "attendance_only":
      return "출석 확인";
    case "assignment_only":
      return "과제 제출";
    case "attendance_and_assignment":
      return "출석·과제 제출";
  }
}

function clampLocationRadius(value: number) {
  return Math.min(
    MAX_LOCATION_RADIUS_METERS,
    Math.max(MIN_LOCATION_RADIUS_METERS, value)
  );
}

function getLocationResultTitle(result: PublicCheckLocationSearchResult) {
  return (
    result.placeName?.trim() ||
    result.roadAddressName?.trim() ||
    result.addressName?.trim() ||
    "주소 검색 결과"
  );
}

function getLocationResultLine(
  label: string,
  value: string | null,
  fallback: string
) {
  return `${label}: ${value?.trim() || fallback}`;
}

function toLocationSearchResults(
  data: PublicCheckLocationSearchResponse | undefined
) {
  if (!data) {
    return [];
  }

  return data.results;
}

function buildAbsoluteUrl(publicPath: string) {
  if (typeof window === "undefined") {
    return publicPath;
  }

  return `${window.location.origin}${publicPath}`;
}

function buildPublicCheckEntryUrl(
  publicPath: string,
  entry: "qr" | "location"
) {
  return `${buildAbsoluteUrl(publicPath)}?entry=${entry}`;
}

function buildPublicCheckQrDownloadUrl(publicPath: string) {
  const publicToken = publicPath.split("/").filter(Boolean).at(-1);

  if (!publicToken) {
    return null;
  }

  return `/api/v1/public-check-sessions/${publicToken}/qr?entry=qr`;
}

function toBoardRows(data: StudentBoardResponse | undefined) {
  if (!data) {
    return [];
  }

  return data.rows;
}

function toBoardSessions(data: StudentBoardResponse | undefined) {
  if (!data) {
    return [];
  }

  return data.sessions;
}

function MethodToggleIndicator({ active }: { active: boolean }) {
  return (
    <div
      className={`relative flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
        active ? "border-accent/60 bg-accent/20" : "border-border bg-surface-2"
      }`}
    >
      <div
        className={`h-4 w-4 rounded-full transition-transform ${
          active
            ? "translate-x-[22px] bg-accent"
            : "translate-x-[3px] bg-text-dim/60"
        }`}
      />
    </div>
  );
}

export function StudentCheckBoardPanel({
  spaceId,
  members,
}: StudentCheckBoardPanelProps) {
  const { spaces } = useStudentManagement();
  const {
    data,
    loading,
    error,
    updateMemberBoard,
    createSession,
    updateSession,
  } = useSpaceStudentBoard(spaceId, "space");
  const boardRows = useMemo(() => toBoardRows(data), [data]);
  const boardSessions = useMemo(() => toBoardSessions(data), [data]);
  const selectedSpace = useMemo(
    () => spaces.find((space) => space.id === spaceId) ?? null,
    [spaceId, spaces]
  );
  const rowMap = useMemo(
    () => new Map(boardRows.map((row) => [row.memberId, row])),
    [boardRows]
  );
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({});
  const [isExpanded, setIsExpanded] = useState(true);
  const [isGrassOpen, setIsGrassOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(
    boardSessions.length === 0
  );
  const [sessionForm, setSessionForm] = useState<CreatePublicCheckSessionBody>({
    title: "오늘 출석/과제 체크",
    checkMode: "attendance_and_assignment",
    enabledMethods: ["qr"],
    opensAt: null,
    closesAt: null,
    locationLabel: null,
    latitude: null,
    longitude: null,
    radiusMeters: DEFAULT_LOCATION_RADIUS_METERS,
  });
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const [selectedLocationResult, setSelectedLocationResult] =
    useState<PublicCheckLocationSearchResult | null>(null);
  const deferredLocationQuery = useDeferredValue(locationQuery.trim());
  const isLocationMethodEnabled =
    sessionForm.enabledMethods.includes("location");
  const {
    data: locationSearchData,
    error: rawLocationSearchError,
    status: locationSearchStatus,
  } = usePublicCheckLocationSearch(
    spaceId,
    deferredLocationQuery,
    isLocationMethodEnabled && selectedLocationId === null
  );
  const locationResults = toLocationSearchResults(locationSearchData);
  const isLocationSearchPending = locationSearchStatus === "pending";
  const locationSearchError =
    rawLocationSearchError instanceof Error ? rawLocationSearchError : null;
  const sessionRadiusMeters = sessionForm.radiusMeters ?? null;

  useEffect(() => {
    if (boardRows.length === 0) return;

    setDrafts((prev) => {
      const next = { ...prev };
      for (const row of boardRows) {
        next[row.memberId] = {
          attendanceStatus: row.attendanceStatus,
          assignmentStatus: row.assignmentStatus,
          assignmentLink: row.assignmentLink ?? "",
        };
      }
      return next;
    });
  }, [boardRows]);

  const presentCount = boardRows.filter(
    (row) => row.attendanceStatus === "present"
  ).length;
  const assignmentDoneCount = boardRows.filter(
    (row) => row.assignmentStatus === "done"
  ).length;

  const isCreatingSession = createSession.isPending;
  const isUpdatingBoard = updateMemberBoard.isPending;
  const isUpdatingSession = updateSession.isPending;
  const checkModeActionDescription = getCheckModeActionDescription(
    sessionForm.checkMode
  );
  const trimmedLocationQuery = locationQuery.trim();
  const shouldPromptLocationQuery =
    isLocationMethodEnabled &&
    trimmedLocationQuery.length > 0 &&
    trimmedLocationQuery.length < 2;
  const shouldShowLocationResults =
    isLocationMethodEnabled &&
    trimmedLocationQuery.length >= 2 &&
    selectedLocationId === null;
  const isLocationConfigured =
    !isLocationMethodEnabled ||
    Boolean(
      sessionForm.locationLabel?.trim() &&
      sessionForm.latitude !== null &&
      sessionForm.longitude !== null &&
      sessionRadiusMeters !== null &&
      sessionRadiusMeters >= MIN_LOCATION_RADIUS_METERS &&
      sessionRadiusMeters <= MAX_LOCATION_RADIUS_METERS
    );

  const handleDraftChange = (memberId: string, patch: Partial<DraftRow>) => {
    setDrafts((prev) => ({
      ...prev,
      [memberId]: {
        attendanceStatus: prev[memberId]?.attendanceStatus ?? "unknown",
        assignmentStatus: prev[memberId]?.assignmentStatus ?? "unknown",
        assignmentLink: prev[memberId]?.assignmentLink ?? "",
        ...patch,
      },
    }));
  };

  const handleLocationQueryChange = (value: string) => {
    setLocationQuery(value);
    setSelectedLocationId(null);
    setSelectedLocationResult(null);
    setSessionForm((prev) => ({
      ...prev,
      locationLabel: null,
      latitude: null,
      longitude: null,
    }));
  };

  const handleLocationSelect = (result: PublicCheckLocationSearchResult) => {
    const normalizedLabel = result.label.slice(0, 120);
    setLocationQuery(normalizedLabel);
    setSelectedLocationId(result.id);
    setSelectedLocationResult(result);
    setSessionForm((prev) => ({
      ...prev,
      locationLabel: normalizedLabel,
      latitude: result.latitude,
      longitude: result.longitude,
      radiusMeters: clampLocationRadius(
        prev.radiusMeters ?? DEFAULT_LOCATION_RADIUS_METERS
      ),
    }));
  };

  const toggleEnabledMethod = (
    method: CreatePublicCheckSessionBody["enabledMethods"][number]
  ) => {
    setSessionForm((prev) => {
      const nextEnabledMethods = prev.enabledMethods.includes(method)
        ? prev.enabledMethods.filter((item) => item !== method)
        : [...prev.enabledMethods, method];

      return {
        ...prev,
        enabledMethods: nextEnabledMethods,
        radiusMeters:
          nextEnabledMethods.includes("location") && prev.radiusMeters === null
            ? DEFAULT_LOCATION_RADIUS_METERS
            : prev.radiusMeters,
      };
    });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text sm:text-base">
            출석 · 과제 체크 보드
          </h3>
          <p className="mt-1 text-[11px] text-text-dim">
            운영용 상태 관리 · 공개 체크인 세션
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-border-light hover:text-text"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isExpanded ? "접기" : "열기"}
        </button>
      </div>

      <div
        className="grid grid-cols-3 gap-2"
        data-tutorial="check-board-summary"
      >
        <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.14em] text-text-dim">
            전체 학생
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text">
            {members.length}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.14em] text-text-dim">
            출석
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text">
            {presentCount}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.14em] text-text-dim">
            과제 완료
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text">
            {assignmentDoneCount}
          </div>
        </div>
      </div>

      {isExpanded ? (
        <div className="space-y-4">
          <div
            className="rounded-2xl border border-border bg-surface-2 p-3 sm:p-4"
            data-tutorial="check-board-session-panel"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-text">
                  공개 체크인 세션
                </div>
                <p className="mt-1 text-[11px] text-text-dim">
                  세션을 열고 QR 또는 링크를 수강생에게 제공하면, 수강생이 직접
                  출석과 과제를 체크할 수 있습니다.
                </p>
                <p className="mt-1 text-[11px] text-text-dim">
                  QR / 위치 기반 세션 운영 · 현재{" "}
                  {
                    boardSessions.filter(
                      (session) => session.status === "active"
                    ).length
                  }
                  개 활성
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                disabled={isCreatingSession}
                onClick={() => setIsComposerOpen((prev) => !prev)}
              >
                {isComposerOpen ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
                {isComposerOpen ? "입력 닫기" : "세션 만들기"}
              </button>
            </div>

            {isComposerOpen ? (
              <div className="mt-3 grid gap-2 sm:gap-3">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
                  <input
                    className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none"
                    value={sessionForm.title}
                    onChange={(event) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    placeholder="세션 제목"
                  />
                  <select
                    className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none"
                    value={sessionForm.checkMode}
                    onChange={(event) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        checkMode: event.target
                          .value as CreatePublicCheckSessionBody["checkMode"],
                      }))
                    }
                  >
                    <option value="attendance_and_assignment">
                      출석 + 과제
                    </option>
                    <option value="attendance_only">출석만</option>
                    <option value="assignment_only">과제만</option>
                  </select>
                  <button
                    type="button"
                    aria-pressed={sessionForm.enabledMethods.includes("qr")}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      sessionForm.enabledMethods.includes("qr")
                        ? "border-accent/50 bg-accent/10 text-text"
                        : "border-border bg-surface text-text-secondary hover:border-border-light hover:text-text"
                    }`}
                    onClick={() => toggleEnabledMethod("qr")}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          sessionForm.enabledMethods.includes("qr")
                            ? "bg-accent/15 text-accent"
                            : "bg-surface-2 text-text-dim"
                        }`}
                      >
                        <QrCode size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium">QR 체크인</div>
                        <div className="mt-0.5 text-[11px] text-text-dim">
                          QR 스캔으로 {checkModeActionDescription}
                        </div>
                      </div>
                    </div>
                    <MethodToggleIndicator
                      active={sessionForm.enabledMethods.includes("qr")}
                    />
                  </button>
                  <button
                    type="button"
                    aria-pressed={sessionForm.enabledMethods.includes(
                      "location"
                    )}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      sessionForm.enabledMethods.includes("location")
                        ? "border-accent/50 bg-accent/10 text-text"
                        : "border-border bg-surface text-text-secondary hover:border-border-light hover:text-text"
                    }`}
                    onClick={() => toggleEnabledMethod("location")}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          sessionForm.enabledMethods.includes("location")
                            ? "bg-accent/15 text-accent"
                            : "bg-surface-2 text-text-dim"
                        }`}
                      >
                        <MapPin size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium">위치 인증</div>
                        <div className="mt-0.5 text-[11px] text-text-dim">
                          지정 위치에서 {checkModeActionDescription} 허용
                        </div>
                      </div>
                    </div>
                    <MethodToggleIndicator
                      active={sessionForm.enabledMethods.includes("location")}
                    />
                  </button>
                </div>

                {isLocationMethodEnabled ? (
                  <div className="rounded-2xl border border-border bg-surface p-3">
                    <div className="grid gap-3 xl:grid-cols-[minmax(0,2fr)_180px]">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-medium text-text-secondary">
                          <Search size={13} className="text-text-dim" />
                          기준 위치 검색
                        </div>
                        <input
                          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent/60"
                          value={locationQuery}
                          onChange={(event) =>
                            handleLocationQueryChange(event.target.value)
                          }
                          placeholder="건물명 또는 도로명 주소 검색"
                        />
                        <p className="text-[11px] text-text-dim">
                          운영자는 위치를 검색 결과에서 고르고, 좌표는 시스템이
                          내부에 저장합니다.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[11px] font-medium text-text-secondary">
                          허용 반경
                        </div>
                        <input
                          type="number"
                          min={MIN_LOCATION_RADIUS_METERS}
                          max={MAX_LOCATION_RADIUS_METERS}
                          step={10}
                          inputMode="numeric"
                          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent/60"
                          value={sessionRadiusMeters ?? ""}
                          onChange={(event) =>
                            setSessionForm((prev) => ({
                              ...prev,
                              radiusMeters: event.target.value
                                ? Number(event.target.value)
                                : null,
                            }))
                          }
                        />
                        <p className="text-[11px] text-text-dim">
                          기본 150m · 조정 범위 50~300m
                        </p>
                        {sessionRadiusMeters !== null &&
                        (sessionRadiusMeters < MIN_LOCATION_RADIUS_METERS ||
                          sessionRadiusMeters > MAX_LOCATION_RADIUS_METERS) ? (
                          <p className="text-[11px] text-amber-300">
                            반경은 50m에서 300m 사이로 입력해 주세요.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {sessionForm.locationLabel ? (
                      <div className="mt-3 rounded-xl border border-accent/20 bg-accent/10 px-3 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent/80">
                              선택된 위치
                            </div>
                            <div className="mt-1 break-words text-sm font-semibold leading-relaxed text-text">
                              {selectedLocationResult
                                ? getLocationResultTitle(selectedLocationResult)
                                : sessionForm.locationLabel}
                            </div>
                            {selectedLocationResult ? (
                              <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-text-secondary">
                                <div className="break-words">
                                  {getLocationResultLine(
                                    "도로명",
                                    selectedLocationResult.roadAddressName,
                                    "정보 없음"
                                  )}
                                </div>
                                <div className="break-words text-text-dim">
                                  {getLocationResultLine(
                                    "지번",
                                    selectedLocationResult.addressName,
                                    "정보 없음"
                                  )}
                                </div>
                              </div>
                            ) : null}
                            <div className="mt-2 text-[11px] text-text-secondary">
                              반경{" "}
                              {sessionRadiusMeters ??
                                DEFAULT_LOCATION_RADIUS_METERS}
                              m 안에서 체크인 허용
                            </div>
                          </div>
                          <button
                            type="button"
                            className="rounded-lg border border-border px-2 py-1 text-[11px] text-text-secondary"
                            onClick={() => handleLocationQueryChange("")}
                          >
                            다시 선택
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {shouldPromptLocationQuery ? (
                      <p className="mt-3 text-[11px] text-text-dim">
                        두 글자 이상 입력하면 위치 검색 결과를 보여줍니다.
                      </p>
                    ) : null}

                    {shouldShowLocationResults ? (
                      <div className="mt-3 rounded-xl border border-border bg-surface-2">
                        {isLocationSearchPending ? (
                          <div className="flex items-center gap-2 px-3 py-3 text-sm text-text-secondary">
                            <LoaderCircle
                              size={14}
                              className="animate-spin text-text-dim"
                            />
                            위치 검색 중...
                          </div>
                        ) : null}

                        {!isLocationSearchPending && locationSearchError ? (
                          <p className="px-3 py-3 text-sm text-red-300">
                            {locationSearchError.message}
                          </p>
                        ) : null}

                        {!isLocationSearchPending &&
                        !locationSearchError &&
                        locationResults.length === 0 ? (
                          <p className="px-3 py-3 text-sm text-text-secondary">
                            검색 결과가 없습니다. 건물명이나 도로명 주소를 더
                            구체적으로 입력해 주세요.
                          </p>
                        ) : null}

                        {!isLocationSearchPending &&
                        !locationSearchError &&
                        locationResults.length > 0 ? (
                          <div className="divide-y divide-border">
                            {locationResults.map((result) => (
                              <button
                                key={result.id}
                                type="button"
                                className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-white/5"
                                onClick={() => handleLocationSelect(result)}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="break-words text-sm font-semibold leading-relaxed text-text">
                                    {getLocationResultTitle(result)}
                                  </div>
                                  <div className="mt-1 break-words text-[11px] leading-relaxed text-text-secondary">
                                    {getLocationResultLine(
                                      "도로명",
                                      result.roadAddressName,
                                      "정보 없음"
                                    )}
                                  </div>
                                  <div className="mt-1 break-words text-[11px] leading-relaxed text-text-dim">
                                    {getLocationResultLine(
                                      "지번",
                                      result.addressName,
                                      "정보 없음"
                                    )}
                                  </div>
                                </div>
                                <div className="shrink-0 rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-text-dim">
                                  {result.source === "keyword"
                                    ? "장소"
                                    : "주소"}
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {!sessionForm.locationLabel ? (
                      <p className="mt-3 text-[11px] text-amber-300">
                        위치 인증을 쓰려면 검색 결과에서 기준 위치를 하나
                        선택해야 합니다.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <button
                    className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    disabled={
                      isCreatingSession ||
                      sessionForm.enabledMethods.length === 0 ||
                      !isLocationConfigured
                    }
                    onClick={() => createSession.mutate(sessionForm)}
                  >
                    {isCreatingSession ? "생성 중..." : "체크인 세션 생성"}
                  </button>
                </div>
                {createSession.error instanceof Error ? (
                  <p className="text-sm text-red-300">
                    {createSession.error.message}
                  </p>
                ) : null}
              </div>
            ) : null}

            {boardSessions.length > 0 ? (
              <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1">
                {boardSessions.map((session) => {
                  const qrEntryUrl = buildPublicCheckEntryUrl(
                    session.publicPath,
                    "qr"
                  );
                  const locationEntryUrl = buildPublicCheckEntryUrl(
                    session.publicPath,
                    "location"
                  );
                  const qrDownloadUrl = buildPublicCheckQrDownloadUrl(
                    session.publicPath
                  );
                  return (
                    <div
                      key={session.id}
                      className="min-w-[260px] snap-start rounded-2xl border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-3 sm:min-w-[320px]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-text">
                            {session.title}
                          </div>
                          <div className="mt-1 text-[11px] text-text-secondary">
                            {session.enabledMethods.join(" + ")} ·{" "}
                            {getCheckModeLabel(session.checkMode)}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="rounded-lg border border-border px-2 py-1 text-[11px] text-text-secondary"
                          disabled={isUpdatingSession}
                          onClick={() =>
                            updateSession.mutate({
                              sessionId: session.id,
                              body: {
                                status:
                                  session.status === "active"
                                    ? "closed"
                                    : "active",
                              },
                            })
                          }
                        >
                          {session.status === "active" ? "닫기" : "열기"}
                        </button>
                      </div>

                      <div className="mt-3 min-w-0 flex-1 space-y-2">
                        {session.enabledMethods.includes("qr") ? (
                          <div className="rounded-xl bg-surface-2 px-2.5 py-2">
                            <div className="text-[11px] font-medium text-text">
                              QR 체크인
                            </div>
                            <div className="mt-1 break-all text-[11px] text-text-secondary">
                              {qrEntryUrl}
                            </div>
                            <div className="mt-2 flex gap-2">
                              {qrDownloadUrl ? (
                                <a
                                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] text-text-secondary"
                                  href={qrDownloadUrl}
                                  download={`${session.title}-qr.svg`}
                                >
                                  <QrCode size={12} /> QR 다운로드
                                </a>
                              ) : null}
                              <a
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] text-text-secondary"
                                href={qrEntryUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink size={12} /> QR 열기
                              </a>
                            </div>
                          </div>
                        ) : null}

                        {session.enabledMethods.includes("location") ? (
                          <div className="rounded-xl bg-surface-2 px-2.5 py-2">
                            <div className="text-[11px] font-medium text-text">
                              위치 기반체크인
                            </div>
                            <div className="mt-1 break-all text-[11px] text-text-secondary">
                              {locationEntryUrl}
                            </div>
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] text-text-secondary"
                                onClick={() =>
                                  void navigator.clipboard.writeText(
                                    locationEntryUrl
                                  )
                                }
                              >
                                <Copy size={12} /> 링크 복사
                              </button>
                              <a
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] text-text-secondary"
                                href={locationEntryUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink size={12} /> 열기
                              </a>
                            </div>
                          </div>
                        ) : null}

                        {session.locationLabel ? (
                          <div className="text-[11px] text-text-secondary">
                            위치 기준: {session.locationLabel}
                            {session.radiusMeters
                              ? ` · ${session.radiusMeters}m`
                              : ""}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {loading ? (
            <p className="text-sm text-text-secondary">
              학생 보드를 불러오는 중...
            </p>
          ) : null}
          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          {!loading && !error ? (
            <div className="rounded-2xl border border-border bg-surface-2 p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-text">
                    진행기간 잔디 보기
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-border-light hover:text-text"
                  onClick={() => setIsGrassOpen((prev) => !prev)}
                >
                  {isGrassOpen ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                  {isGrassOpen ? "잔디 숨기기" : "잔디 보기"}
                </button>
              </div>

              {isGrassOpen ? (
                <div className="mt-4">
                  <StudentBoardGrassRoster
                    members={members}
                    rows={boardRows}
                    startDate={selectedSpace?.startDate ?? null}
                    endDate={selectedSpace?.endDate ?? null}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {!loading && !error ? (
            <StudentCheckBoardStatusEditor
              members={members}
              rowMap={rowMap}
              drafts={drafts}
              isUpdatingBoard={isUpdatingBoard}
              onDraftChange={handleDraftChange}
              onSave={(memberId, draft) =>
                updateMemberBoard.mutate({
                  memberId,
                  body: {
                    attendanceStatus: draft.attendanceStatus,
                    assignmentStatus: draft.assignmentStatus,
                    assignmentLink: draft.assignmentLink || null,
                  },
                })
              }
            />
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </section>
  );
}
