"use client";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Crown, Search, Users } from "lucide-react";
import {
  YeonBadge,
  YeonButton,
  YeonField,
  YeonSurface,
  getYeonSurfaceClassName,
  joinClassNames,
} from "@/components/yeon-ui";
import { TypingServiceHeader } from "./typing-service-header";
import { trackEvent } from "@/lib/analytics";
import {
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_MODE,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  type TypingRoomCreateMessage,
  type TypingRoomSummary,
  type TypingRoomVisibility,
} from "@yeon/race-shared";
import {
  resolveTypingRaceSeed,
  useSelectedTypingDeck,
  useTypingSettings,
  type TypingRaceSeed,
} from "./use-typing-settings";
import {
  RoomCharacterSummaryCard,
  RoomCreateDialog,
  ROOM_LOBBY_CLASS,
} from "@/features/room-shared";
import { useTypingRoomLobby } from "./use-typing-room-lobby";
import { usePlayerIdentity } from "./use-player-identity";
import { useRaceRoom } from "./use-race-room";
import {
  TYPING_ROOM_DIFFICULTY_LABELS,
  TYPING_ROOM_LANGUAGE_LABELS,
  TYPING_ROOM_MODE_LABELS,
  TYPING_ROOM_STATUS_LABELS,
  TYPING_ROOM_TEXT_TYPE_LABELS,
  TYPING_ROOM_VISIBILITY_LABELS,
} from "./typing-room-labels";
import { useTypingProfile } from "./use-typing-profile";

const FIXED_MAX_PARTICIPANTS = 4;
const FIXED_TEXT_TYPE = TYPING_ROOM_TEXT_TYPE.SHORT;
const FIXED_DIFFICULTY = TYPING_ROOM_DIFFICULTY.NORMAL;
const FIXED_ROUND_COUNT = 1;
const FIXED_MODE = TYPING_ROOM_MODE.FINISH;

type LobbyFilter = "all" | "public" | "available";

type LobbyCreateRoomRequest = TypingRoomCreateMessage & {
  selectedDeckId: string;
  selectedDeckVisibility: "default" | "public" | "private";
  lobbyDeckTitle: string;
  participantDeckTitle: string;
  raceSeed?: TypingRaceSeed;
};

type CreateRoomIdentity = {
  characterId?: string;
  playerId: string;
  playerLabel: string;
};

const FILTERS: { label: string; value: LobbyFilter }[] = [
  { label: "전체", value: "all" },
  { label: "공개방", value: "public" },
  { label: "입장 가능", value: "available" },
];

function getRoomOccupancy(room: TypingRoomSummary) {
  const hostCount = room.currentParticipants > 0 ? 1 : 0;
  const guestCount = Math.max(room.currentParticipants - hostCount, 0);
  const openSeats = Math.max(
    room.maxParticipants - room.currentParticipants,
    0
  );
  const isFull = openSeats === 0;

  return {
    guestCount,
    hostCount,
    isFull,
    openSeats,
    seatLabel: isFull ? "만석" : `${openSeats}자리 남음`,
  };
}

export function TypingRoomLobbyScreen() {
  const router = useRouter();
  const { state } = useTypingRoomLobby();
  const { settings } = useTypingSettings();
  const { profile, loaded: profileLoaded } = useTypingProfile();
  const playerId = usePlayerIdentity();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<TypingRoomVisibility>(
    TYPING_ROOM_VISIBILITY.PUBLIC
  );
  const [selectedFilter, setSelectedFilter] = useState<LobbyFilter>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [createRoomRequest, setCreateRoomRequest] =
    useState<LobbyCreateRoomRequest | null>(null);
  const [createRoomIdentity, setCreateRoomIdentity] =
    useState<CreateRoomIdentity | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const hasHandledCreateSuccessRef = useRef(false);
  const fixedLanguage = settings.locale;
  const deckState = useSelectedTypingDeck(fixedLanguage);
  const roomDeckOptions = useMemo(
    () => deckState.decks.filter((deck) => deck.visibility !== "private"),
    [deckState.decks]
  );
  const selectedDeck = useMemo(
    () =>
      roomDeckOptions.find((deck) => deck.id === deckState.selectedDeckId) ??
      roomDeckOptions[0] ??
      deckState.selectedDeck,
    [deckState.selectedDeck, deckState.selectedDeckId, roomDeckOptions]
  );

  const createRace = useRaceRoom({
    enabled: Boolean(createRoomRequest && createRoomIdentity?.playerId),
    playerLabel: createRoomIdentity?.playerLabel ?? profile.nickname,
    playerId: createRoomIdentity?.playerId ?? null,
    characterId: createRoomIdentity?.characterId,
    locale: settings.locale,
    createRoom: createRoomRequest,
  });

  const generatedTitle = `${TYPING_ROOM_LANGUAGE_LABELS[fixedLanguage]} ${TYPING_ROOM_TEXT_TYPE_LABELS[FIXED_TEXT_TYPE]} 같이 치기`;

  const rooms = state.kind === "ready" ? state.rooms : [];
  const filteredRooms = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return rooms.filter((room) => {
      const occupancy = getRoomOccupancy(room);
      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "public" &&
          room.visibility === TYPING_ROOM_VISIBILITY.PUBLIC) ||
        (selectedFilter === "available" && !occupancy.isFull);
      const matchesSearch =
        keyword.length === 0 ||
        room.title.toLowerCase().includes(keyword) ||
        room.roomCode.toLowerCase().includes(keyword) ||
        (room.hostLabel?.toLowerCase().includes(keyword) ?? false);

      return matchesFilter && matchesSearch;
    });
  }, [rooms, searchKeyword, selectedFilter]);

  useEffect(() => {
    if (!createRoomRequest || !createRace.roomId) return;
    if (hasHandledCreateSuccessRef.current) return;

    hasHandledCreateSuccessRef.current = true;
    setIsCreating(false);
    setIsCreateModalOpen(false);
    trackEvent("room_create_success", {
      source: "typing_room_lobby",
      room_id: createRace.roomId,
      visibility: createRoomRequest.visibility,
      language: createRoomRequest.language,
      deck_id: createRoomRequest.selectedDeckId,
      deck_title: createRoomRequest.participantDeckTitle,
    });
    router.push(`/typing-service/rooms/${createRace.roomId}`);
  }, [createRace.roomId, createRoomRequest, router]);

  useEffect(() => {
    if (!createRoomRequest) return;
    if (
      createRace.connectionState !== "error" &&
      createRace.connectionState !== "disconnected"
    ) {
      return;
    }

    setCreateError(
      createRace.roomError ??
        "타자방을 만들 수 없습니다. 잠시 후 다시 시도해주세요."
    );
    setCreateRoomRequest(null);
    setCreateRoomIdentity(null);
    setIsCreating(false);
    hasHandledCreateSuccessRef.current = false;
  }, [createRace.connectionState, createRace.roomError, createRoomRequest]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreating) return;

    if (!playerId) {
      setCreateError(
        "플레이어 정보를 준비하는 중입니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }

    setCreateError(null);
    setIsCreating(true);
    hasHandledCreateSuccessRef.current = false;
    const createIdentity: CreateRoomIdentity = {
      characterId: profile.characterId,
      playerId,
      playerLabel: profile.nickname,
    };
    trackEvent("room_create_intent", {
      source: "typing_room_lobby",
      visibility,
      language: fixedLanguage,
      deck_id: selectedDeck.id,
      deck_title: selectedDeck.title,
    });

    const seedResult = await resolveTypingRaceSeed(selectedDeck, fixedLanguage);
    if (!seedResult.ok) {
      setCreateError(seedResult.message);
      setIsCreating(false);
      return;
    }

    setCreateRoomIdentity(createIdentity);
    setCreateRoomRequest({
      title: title.trim() || generatedTitle,
      visibility,
      maxParticipants: FIXED_MAX_PARTICIPANTS,
      textType: FIXED_TEXT_TYPE,
      language: fixedLanguage,
      difficulty: FIXED_DIFFICULTY,
      roundCount: FIXED_ROUND_COUNT,
      mode: FIXED_MODE,
      selectedDeckId: selectedDeck.id,
      selectedDeckVisibility: selectedDeck.visibility,
      lobbyDeckTitle:
        selectedDeck.visibility === "private"
          ? "비공개 덱"
          : selectedDeck.title,
      participantDeckTitle: selectedDeck.title,
      raceSeed: seedResult.seed ?? undefined,
    });
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
    trackEvent("room_create_modal_open", {
      source: "typing_room_lobby",
      language: fixedLanguage,
    });
  };

  const closeCreateModal = useCallback(() => {
    if (isCreating) return;
    setIsCreateModalOpen(false);
  }, [isCreating]);

  const isInitialEmpty =
    state.kind === "empty" ||
    (state.kind === "ready" &&
      rooms.length === 0 &&
      searchKeyword.trim().length === 0);

  return (
    <div className={SHARED_FEATURE_CLASS.pageSurface}>
      <TypingServiceHeader active="rooms" title="YEON 타자방" />

      <main>
        <section className={ROOM_LOBBY_CLASS.heroSection}>
          <div>
            <h1 className={ROOM_LOBBY_CLASS.heroTitle}>타자방</h1>
            <p className={ROOM_LOBBY_CLASS.heroDescription}>
              실시간으로 함께 타자를 치고 실력을 겨루는 공간입니다.
            </p>
          </div>
          <RoomCharacterSummaryCard
            loaded={profileLoaded}
            nickname={profile.nickname}
            characterId={profile.characterId}
            locale={settings.locale}
            changeHref="/typing-service"
          />
        </section>

        <section className={ROOM_LOBBY_CLASS.listTopBorder}>
          {!isInitialEmpty && (
            <div className={ROOM_LOBBY_CLASS.filterRow}>
              <div className={ROOM_LOBBY_CLASS.filterScroller}>
                {FILTERS.map((filter) => (
                  <YeonButton
                    key={filter.value}
                    type="button"
                    onClick={() => setSelectedFilter(filter.value)}
                    data-active={selectedFilter === filter.value}
                    variant="pill"
                    className="h-[50px] shrink-0 px-7 text-[16px] data-[active=true]:border-[#111] data-[active=true]:bg-[#fafafa] data-[active=true]:font-bold data-[active=true]:text-[#111] data-[active=true]:shadow-[inset_0_0_0_1px_#111]"
                  >
                    {filter.label}
                  </YeonButton>
                ))}
              </div>

              <div className={ROOM_LOBBY_CLASS.inputButtonRow}>
                <label className={ROOM_LOBBY_CLASS.searchField}>
                  <Search
                    aria-hidden="true"
                    size={22}
                    className={ROOM_LOBBY_CLASS.searchIcon}
                  />
                  <YeonField
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    placeholder="방 검색"
                    aria-label="방 검색"
                    className="h-[50px] rounded-lg pl-12 pr-4 text-[16px] font-medium placeholder:text-[#888]"
                  />
                </label>
                <YeonButton
                  type="button"
                  onClick={openCreateModal}
                  variant="primary"
                  className="hidden h-[50px] rounded-lg px-8 text-[16px] font-bold md:inline-flex"
                >
                  방 만들기
                </YeonButton>
              </div>
            </div>
          )}

          <YeonSurface className="mt-7 min-h-[520px]">
            {state.kind === "loading" && (
              <div
                className={`flex min-h-[520px] items-center justify-center ${SHARED_FEATURE_CLASS.text16Secondary}`}
              >
                열린 타자방을 불러오는 중입니다.
              </div>
            )}

            {state.kind === "error" && (
              <div className="flex min-h-[520px] items-center justify-center px-6 text-center text-[16px] font-semibold text-red-600">
                {state.message}
              </div>
            )}

            {(state.kind === "empty" ||
              (state.kind === "ready" && filteredRooms[0] === undefined)) && (
              <div className="flex min-h-[520px] flex-col items-center justify-center rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-6 py-12 text-center">
                <Image
                  src="/illustrations/typing-empty-keyboard.png"
                  alt=""
                  aria-hidden="true"
                  width={160}
                  height={160}
                  className="h-40 w-40 object-contain"
                />
                <h2 className="mt-6 max-w-[300px] break-keep text-[28px] font-black leading-tight tracking-[-0.05em] text-[#111]">
                  {state.kind === "ready"
                    ? "검색 결과가 없어요"
                    : "아직 열린 타자방이 없어요"}
                </h2>
                <p
                  className={`mt-3 max-w-[320px] break-keep leading-6 ${SHARED_FEATURE_CLASS.text16Secondary}`}
                >
                  {state.kind === "ready"
                    ? "다른 키워드로 검색해 보세요. 원하는 방이 없다면 직접 만들 수 있어요."
                    : "공개방은 누구나 입장할 수 있고, 비공개방은 방 코드를 받은 사람만 들어와요."}
                </p>
                <YeonButton
                  type="button"
                  onClick={
                    state.kind === "ready"
                      ? () => setSearchKeyword("")
                      : openCreateModal
                  }
                  variant="primary"
                  size="xl"
                  className="mt-8 rounded-lg shadow-[0_3px_10px_rgba(0,0,0,0.10)]"
                >
                  {state.kind === "ready" ? "검색 초기화" : "첫 방 만들기"}
                </YeonButton>
              </div>
            )}

            {state.kind === "ready" && filteredRooms[0] !== undefined && (
              <div className={ROOM_LOBBY_CLASS.roomListRow}>
                {filteredRooms.map((room) => {
                  const occupancy = getRoomOccupancy(room);

                  return (
                    <Link
                      key={room.roomId}
                      href={`/typing-service/rooms/${room.roomId}`}
                      aria-label={`${room.title} 입장, ${occupancy.seatLabel}`}
                      className={joinClassNames(
                        getYeonSurfaceClassName({
                          variant: "panel",
                          className:
                            "group grid gap-5 p-5 no-underline transition-colors hover:border-[#111] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111] md:grid-cols-[1fr_auto]",
                        })
                      )}
                      onClick={() =>
                        trackEvent("room_join_click", {
                          source: "typing_room_lobby",
                          room_id: room.roomId,
                          visibility: room.visibility,
                          language: room.language,
                          current_participants: room.currentParticipants,
                        })
                      }
                    >
                      <div>
                        <div
                          className={SHARED_FEATURE_CLASS.wrapItemsCenterGap2}
                        >
                          <YeonBadge variant="success" className="text-[11px]">
                            {TYPING_ROOM_STATUS_LABELS[room.status]}
                          </YeonBadge>
                          <YeonBadge className="text-[11px] text-[#111]">
                            {occupancy.seatLabel}
                          </YeonBadge>
                          <span
                            className={
                              TYPING_SERVICE_COMMON_CLASS.subtleInfoMono
                            }
                          >
                            #{room.roomCode}
                          </span>
                        </div>
                        <h2 className={ROOM_LOBBY_CLASS.roomMetaRow}>
                          {room.title}
                        </h2>
                        <p
                          className={`mt-2 ${SHARED_FEATURE_CLASS.text13MediumSecondary}`}
                        >
                          {TYPING_ROOM_LANGUAGE_LABELS[room.language]} ·{" "}
                          {TYPING_ROOM_TEXT_TYPE_LABELS[room.textType]} ·{" "}
                          {TYPING_ROOM_DIFFICULTY_LABELS[room.difficulty]} ·{" "}
                          {room.roundCount}판 ·{" "}
                          {TYPING_ROOM_MODE_LABELS[room.mode]}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-semibold">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-[#666]">
                            <Crown size={13} className="text-[#b7791f]" />{" "}
                            {room.hostLabel
                              ? `${room.hostLabel}님의 방`
                              : `방장 ${occupancy.hostCount}명`}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-[#666]">
                            <Users size={13} className="text-[#111]" /> 참가자{" "}
                            {occupancy.guestCount}명
                          </span>
                        </div>
                      </div>
                      <div className={ROOM_LOBBY_CLASS.roomStatusArea}>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border border-[#ddd] bg-white px-3 py-1.5 ${SHARED_FEATURE_CLASS.text13PrimaryBold}`}
                        >
                          <Users size={14} /> {room.currentParticipants} /{" "}
                          {room.maxParticipants}
                        </span>
                        <span className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-bold text-white transition-opacity group-hover:opacity-90">
                          입장하기
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </YeonSurface>
        </section>
      </main>

      {!isInitialEmpty && (
        <YeonButton
          type="button"
          onClick={openCreateModal}
          variant="primary"
          aria-label="방 만들기"
          className="fixed bottom-5 right-5 z-30 rounded-full px-6 py-4 text-[15px] shadow-lg md:hidden"
        >
          방 만들기
        </YeonButton>
      )}

      <RoomCreateDialog
        open={isCreateModalOpen}
        titleId="create-typing-room-title"
        title="방 만들기"
        closeLabel="방 만들기 닫기"
        onClose={closeCreateModal}
        as="form"
        onSubmit={handleCreate}
        closeDisabled={isCreating}
        panelClassName={getYeonSurfaceClassName({
          className:
            "relative z-10 max-h-[calc(100vh-3rem)] w-full max-w-[456px] overflow-y-auto rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.22)]",
        })}
        bodyClassName="p-7 pt-6"
      >
        <div className="grid gap-6">
          <label className="grid gap-3 text-[15px] font-bold text-[#111]">
            방 제목
            <YeonField
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 오늘의 타자 연습"
              maxLength={40}
              disabled={isCreating}
              className="h-[50px] rounded-lg px-4 text-[16px] font-medium"
            />
          </label>

          <fieldset className="grid gap-3 text-[15px] font-bold text-[#111]">
            <legend>공개 설정</legend>
            <div className="grid grid-cols-2 gap-2">
              {[
                TYPING_ROOM_VISIBILITY.PUBLIC,
                TYPING_ROOM_VISIBILITY.PRIVATE,
              ].map((option) => (
                <label
                  key={option}
                  className={`flex h-[52px] cursor-pointer items-center justify-center rounded-lg border text-[16px] font-semibold transition-colors ${
                    visibility === option
                      ? "border-[#111] bg-white text-[#111] shadow-[inset_0_0_0_1px_#111]"
                      : "border-[#d7d7d7] bg-white text-[#111] hover:border-[#111]"
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option}
                    checked={visibility === option}
                    onChange={() => setVisibility(option)}
                    disabled={isCreating}
                    className="sr-only"
                  />
                  {TYPING_ROOM_VISIBILITY_LABELS[option]}
                </label>
              ))}
            </div>
          </fieldset>

          <p className="text-[14px] font-medium leading-6 text-[#777]">
            세부 설정은 방에 들어간 뒤 시작 전에 바꿀 수 있어요.
          </p>

          {createError && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[13px] font-semibold leading-5 text-red-600">
              {createError}
            </p>
          )}

          <YeonButton
            type="submit"
            variant="primary"
            disabled={isCreating}
            className="h-[60px] rounded-lg px-4 text-[18px] shadow-[0_3px_10px_rgba(0,0,0,0.10)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? "타자방 만드는 중..." : "만들고 입장하기"}
          </YeonButton>
        </div>
      </RoomCreateDialog>
    </div>
  );
}
