"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { useYeonRouter } from "@yeon/ui/runtime/YeonNavigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  YeonBadge,
  YeonButton,
  YeonField,
  YeonIcon,
  YeonImage,
  YeonSurface,
  getYeonSurfaceClassName,
  joinClassNames,
  YeonLabel,
  YeonView,
  YeonText,
  YeonLink,
  type YeonFormEvent,
  type YeonFormElement,
  YEON_WEB_SHADOW_CLASS,
} from "@yeon/ui";
import { TypingServiceHeader } from "./typing-service-header";
import { trackEvent } from "@/lib/analytics";
import {
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_GAME_TYPE,
  TYPING_ROOM_MODE,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  type TypingRoomCreateMessage,
  type TypingRoomGameType,
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
  RoomLobbySpinner,
  ROOM_LOBBY_CLASS,
} from "@/features/room-shared";
import { useTypingRoomLobby } from "./use-typing-room-lobby";
import { usePlayerIdentity } from "./use-player-identity";
import { useRaceRoom } from "./use-race-room";
import { useTypingProfile } from "./use-typing-profile";
import {
  getTypingUiText,
  TYPING_ROOM_DIFFICULTY_LABELS_BY_LOCALE,
  TYPING_ROOM_GAME_TYPE_LABELS_BY_LOCALE,
  TYPING_ROOM_LANGUAGE_LABELS_BY_LOCALE,
  TYPING_ROOM_MODE_LABELS_BY_LOCALE,
  TYPING_ROOM_STATUS_LABELS_BY_LOCALE,
  TYPING_ROOM_TEXT_TYPE_LABELS_BY_LOCALE,
  TYPING_ROOM_VISIBILITY_LABELS_BY_LOCALE,
} from "./typing-service-i18n";

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

const FILTERS: LobbyFilter[] = ["all", "public", "available"];

const GAME_TYPE_OPTIONS: {
  value: TypingRoomGameType;
  icon: "play" | "swords";
}[] = [
  {
    value: TYPING_ROOM_GAME_TYPE.STANDARD,
    icon: "play",
  },
  {
    value: TYPING_ROOM_GAME_TYPE.TERRITORY,
    icon: "swords",
  },
];

type RoomCreateActionGroupProps = {
  className?: string;
  compact?: boolean;
  labels: ReturnType<typeof getTypingUiText>["room"];
  onCreate: (gameType: TypingRoomGameType) => void;
};

function getRoomOccupancy(
  room: TypingRoomSummary,
  labels: ReturnType<typeof getTypingUiText>["room"]
) {
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
    seatLabel: isFull ? labels.full : labels.seatsLeft(openSeats),
  };
}

function RoomCreateActionGroup({
  className,
  compact = false,
  labels,
  onCreate,
}: RoomCreateActionGroupProps) {
  const buttonClassName = compact
    ? "h-11 rounded-full px-4 text-[13px] font-black"
    : "h-[50px] rounded-lg px-6 text-[15px] font-black";

  return (
    <YeonView className={joinClassNames("flex flex-wrap gap-2", className)}>
      <YeonButton
        type="button"
        onClick={() => onCreate(TYPING_ROOM_GAME_TYPE.STANDARD)}
        variant="primary"
        className={buttonClassName}
      >
        <YeonIcon name="play" size={compact ? 14 : 16} />
        {compact ? labels.standardCreateShort : labels.standardCreate}
      </YeonButton>
      <YeonButton
        type="button"
        onClick={() => onCreate(TYPING_ROOM_GAME_TYPE.TERRITORY)}
        variant="secondary"
        className={buttonClassName}
      >
        <YeonIcon name="swords" size={compact ? 14 : 16} />
        {compact ? labels.territoryCreateShort : labels.territoryCreate}
      </YeonButton>
    </YeonView>
  );
}

export function TypingRoomLobbyScreen() {
  const router = useYeonRouter();
  const { state } = useTypingRoomLobby();
  const { settings } = useTypingSettings();
  const text = getTypingUiText(settings.locale);
  const roomText = text.room;
  const languageLabels = TYPING_ROOM_LANGUAGE_LABELS_BY_LOCALE[settings.locale];
  const textTypeLabels =
    TYPING_ROOM_TEXT_TYPE_LABELS_BY_LOCALE[settings.locale];
  const difficultyLabels =
    TYPING_ROOM_DIFFICULTY_LABELS_BY_LOCALE[settings.locale];
  const modeLabels = TYPING_ROOM_MODE_LABELS_BY_LOCALE[settings.locale];
  const gameTypeLabels =
    TYPING_ROOM_GAME_TYPE_LABELS_BY_LOCALE[settings.locale];
  const visibilityLabels =
    TYPING_ROOM_VISIBILITY_LABELS_BY_LOCALE[settings.locale];
  const statusLabels = TYPING_ROOM_STATUS_LABELS_BY_LOCALE[settings.locale];
  const { profile, loaded: profileLoaded } = useTypingProfile();
  const playerId = usePlayerIdentity();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<TypingRoomVisibility>(
    TYPING_ROOM_VISIBILITY.PUBLIC
  );
  const [gameType, setGameType] = useState<TypingRoomGameType>(
    TYPING_ROOM_GAME_TYPE.STANDARD
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
  const selectedGameTypeOption =
    GAME_TYPE_OPTIONS.find((option) => option.value === gameType) ??
    GAME_TYPE_OPTIONS[0];

  const createRace = useRaceRoom({
    enabled: Boolean(createRoomRequest && createRoomIdentity?.playerId),
    playerLabel: createRoomIdentity?.playerLabel ?? profile.nickname,
    playerId: createRoomIdentity?.playerId ?? null,
    characterId: createRoomIdentity?.characterId,
    locale: settings.locale,
    createRoom: createRoomRequest,
  });

  const generatedTitle =
    gameType === TYPING_ROOM_GAME_TYPE.TERRITORY
      ? roomText.generatedTerritoryTitle(
          languageLabels[fixedLanguage],
          textTypeLabels[FIXED_TEXT_TYPE]
        )
      : roomText.generatedStandardTitle(
          languageLabels[fixedLanguage],
          textTypeLabels[FIXED_TEXT_TYPE]
        );

  const rooms = state.kind === "ready" ? state.rooms : [];
  const filteredRooms = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return rooms.filter((room) => {
      const occupancy = getRoomOccupancy(room, roomText);
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
      game_type: createRoomRequest.gameType,
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

    setCreateError(createRace.roomError ?? roomText.createError);
    setCreateRoomRequest(null);
    setCreateRoomIdentity(null);
    setIsCreating(false);
    hasHandledCreateSuccessRef.current = false;
  }, [createRace.connectionState, createRace.roomError, createRoomRequest]);

  const handleCreate = async (event: YeonFormEvent<YeonFormElement>) => {
    event.preventDefault();
    if (isCreating) return;

    if (!playerId) {
      setCreateError(roomText.playerPreparing);
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
      game_type: gameType,
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
      gameType,
      selectedDeckId: selectedDeck.id,
      selectedDeckVisibility: selectedDeck.visibility,
      lobbyDeckTitle:
        selectedDeck.visibility === "private"
          ? roomText.privateDeck
          : selectedDeck.title,
      participantDeckTitle: selectedDeck.title,
      raceSeed: seedResult.seed ?? undefined,
    });
  };

  const openCreateModal = (nextGameType: TypingRoomGameType) => {
    setGameType(nextGameType);
    setIsCreateModalOpen(true);
    trackEvent("room_create_modal_open", {
      source: "typing_room_lobby",
      language: fixedLanguage,
      game_type: nextGameType,
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
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <TypingServiceHeader active="rooms" title={text.header.roomsTitle} />

      <YeonView as="main">
        <YeonView as="section" className={ROOM_LOBBY_CLASS.heroSection}>
          <YeonView>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className={ROOM_LOBBY_CLASS.heroTitle}
            >
              {roomText.heroTitle}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={ROOM_LOBBY_CLASS.heroDescription}
            >
              {roomText.heroDescription}
            </YeonText>
          </YeonView>
          <RoomCharacterSummaryCard
            loaded={profileLoaded}
            nickname={profile.nickname}
            characterId={profile.characterId}
            locale={settings.locale}
            changeHref="/typing-service"
          />
        </YeonView>

        <YeonView as="section" className={ROOM_LOBBY_CLASS.listTopBorder}>
          {!isInitialEmpty && (
            <YeonView className={ROOM_LOBBY_CLASS.filterRow}>
              <YeonView className={ROOM_LOBBY_CLASS.filterScroller}>
                {FILTERS.map((filter) => (
                  <YeonButton
                    key={filter}
                    type="button"
                    onClick={() => setSelectedFilter(filter)}
                    data-active={selectedFilter === filter}
                    aria-pressed={selectedFilter === filter}
                    variant="pill"
                    className="h-10 shrink-0 px-4 text-[14px] data-[active=true]:border-[#111] data-[active=true]:bg-[#fafafa] data-[active=true]:font-bold data-[active=true]:text-[#111] data-[active=true]:shadow-[inset_0_0_0_1px_#111]"
                  >
                    {roomText.filters[filter]}
                  </YeonButton>
                ))}
              </YeonView>

              <YeonView className={ROOM_LOBBY_CLASS.inputButtonRow}>
                <YeonLabel className={ROOM_LOBBY_CLASS.searchField}>
                  <YeonIcon
                    name="search"
                    size={22}
                    className={ROOM_LOBBY_CLASS.searchIcon}
                  />
                  <YeonField
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    placeholder={roomText.searchPlaceholder}
                    aria-label={roomText.searchAriaLabel}
                    className="h-[50px] rounded-lg pl-12 pr-4 text-[16px] font-medium placeholder:text-[#aaa]"
                  />
                </YeonLabel>
                <RoomCreateActionGroup
                  className="hidden shrink-0 md:flex"
                  labels={roomText}
                  onCreate={openCreateModal}
                />
              </YeonView>
            </YeonView>
          )}

          <YeonSurface className="mt-7 min-h-[520px]">
            {state.kind === "loading" && (
              <RoomLobbySpinner label={roomText.loadingRooms} />
            )}

            {state.kind === "error" && (
              <YeonView className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-6 text-center">
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="max-w-[360px] break-keep text-[16px] font-semibold leading-6 text-[#666]"
                >
                  {settings.locale === "ko"
                    ? state.message
                    : roomText.connectionErrorTitle}
                </YeonText>
                <YeonButton
                  type="button"
                  onClick={() => window.location.reload()}
                  variant="secondary"
                  className="h-11 rounded-lg px-5 text-[14px] font-bold"
                >
                  {settings.locale === "ko" ? "다시 시도" : "Try again"}
                </YeonButton>
              </YeonView>
            )}

            {(state.kind === "empty" ||
              (state.kind === "ready" && filteredRooms[0] === undefined)) && (
              <YeonView className="flex min-h-[520px] flex-col items-center justify-center rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-6 py-12 text-center">
                <YeonImage
                  src="/illustrations/typing-empty-keyboard.png"
                  alt=""
                  aria-hidden="true"
                  width={160}
                  height={160}
                  className="h-40 w-40 object-contain"
                />
                <YeonText
                  as="h2"
                  variant="unstyled"
                  tone="inherit"
                  className="mt-6 max-w-[300px] break-keep text-[28px] font-black leading-tight tracking-[-0.05em] text-[#111]"
                >
                  {state.kind === "ready"
                    ? roomText.noSearchResults
                    : roomText.noRooms}
                </YeonText>
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className={`mt-3 max-w-[320px] break-keep leading-6 ${SHARED_FEATURE_CLASS.text16Secondary}`}
                >
                  {state.kind === "ready"
                    ? roomText.searchEmptyHelp
                    : roomText.emptyHelp}
                </YeonText>
                {state.kind === "ready" ? (
                  <YeonButton
                    type="button"
                    onClick={() => setSearchKeyword("")}
                    variant="primary"
                    size="xl"
                    className={`mt-8 rounded-lg ${YEON_WEB_SHADOW_CLASS.actionSoft}`}
                  >
                    {roomText.resetSearch}
                  </YeonButton>
                ) : (
                  <RoomCreateActionGroup
                    className="mt-8 justify-center"
                    labels={roomText}
                    onCreate={openCreateModal}
                  />
                )}
              </YeonView>
            )}

            {state.kind === "ready" && filteredRooms[0] !== undefined && (
              <YeonView className={ROOM_LOBBY_CLASS.roomListRow}>
                {filteredRooms.map((room) => {
                  const occupancy = getRoomOccupancy(room, roomText);

                  return (
                    <YeonLink
                      key={room.roomId}
                      href={`/typing-service/rooms/${room.roomId}`}
                      aria-label={roomText.enterRoomAria(
                        room.title,
                        occupancy.seatLabel
                      )}
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
                          game_type: room.gameType,
                          current_participants: room.currentParticipants,
                        })
                      }
                    >
                      <YeonView>
                        <YeonView
                          className={SHARED_FEATURE_CLASS.wrapItemsCenterGap2}
                        >
                          <YeonBadge variant="success" className="text-[11px]">
                            {statusLabels[room.status]}
                          </YeonBadge>
                          <YeonBadge className="text-[11px] text-[#111]">
                            {occupancy.seatLabel}
                          </YeonBadge>
                          <YeonBadge className="text-[11px] text-[#111]">
                            {gameTypeLabels[room.gameType]}
                          </YeonBadge>
                          <YeonText
                            as="span"
                            variant="unstyled"
                            tone="inherit"
                            className="inline-flex items-center rounded-md border border-[#e5e5e5] bg-white px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#888]"
                          >
                            #{room.roomCode}
                          </YeonText>
                        </YeonView>
                        <YeonText
                          as="h2"
                          variant="unstyled"
                          tone="inherit"
                          className={ROOM_LOBBY_CLASS.roomMetaRow}
                        >
                          {room.title}
                        </YeonText>
                        <YeonText
                          as="p"
                          variant="unstyled"
                          tone="inherit"
                          className={`mt-2 ${SHARED_FEATURE_CLASS.text13MediumSecondary}`}
                        >
                          {languageLabels[room.language]} ·{" "}
                          {textTypeLabels[room.textType]} ·{" "}
                          {difficultyLabels[room.difficulty]} ·{" "}
                          {roomText.roomRounds(room.roundCount)} ·{" "}
                          {modeLabels[room.mode]}
                        </YeonText>
                        <YeonView className="mt-4 flex flex-wrap gap-2 text-[12px] font-semibold">
                          <YeonText
                            as="span"
                            variant="unstyled"
                            tone="inherit"
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-[#666]"
                          >
                            <YeonIcon
                              name="crown"
                              size={13}
                              className="text-[#666]"
                            />{" "}
                            {room.hostLabel
                              ? roomText.hostRoom(room.hostLabel)
                              : roomText.hostCount(occupancy.hostCount)}
                          </YeonText>
                          <YeonText
                            as="span"
                            variant="unstyled"
                            tone="inherit"
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-[#666]"
                          >
                            <YeonIcon
                              name="users"
                              size={13}
                              className="text-[#111]"
                            />{" "}
                            {roomText.participantCount(occupancy.guestCount)}
                          </YeonText>
                        </YeonView>
                      </YeonView>
                      <YeonView className={ROOM_LOBBY_CLASS.roomStatusArea}>
                        <YeonText
                          as="span"
                          variant="unstyled"
                          tone="inherit"
                          className={`inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 ${SHARED_FEATURE_CLASS.text13PrimaryBold}`}
                        >
                          <YeonIcon name="users" size={14} />{" "}
                          {room.currentParticipants} / {room.maxParticipants}
                        </YeonText>
                        <YeonText
                          as="span"
                          variant="unstyled"
                          tone="inherit"
                          className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-bold text-white transition-opacity group-hover:opacity-90"
                        >
                          {roomText.enterRoom}
                        </YeonText>
                      </YeonView>
                    </YeonLink>
                  );
                })}
              </YeonView>
            )}
          </YeonSurface>
        </YeonView>
      </YeonView>

      {state.kind === "ready" && !isInitialEmpty && (
        <RoomCreateActionGroup
          compact
          // 모바일 전용 플로팅 생성 버튼(방 목록이 있을 때만). 챗 위젯(fixed bottom-3, z-40)
          // 위로 올리고 좌우 inset으로 가로 넘침을 막는다. 로딩/에러 상태에선 숨겨 겹침을 방지.
          className="fixed inset-x-4 bottom-[84px] z-40 justify-end md:hidden"
          labels={roomText}
          onCreate={openCreateModal}
        />
      )}

      <RoomCreateDialog
        open={isCreateModalOpen}
        titleId="create-typing-room-title"
        title={roomText.createTitle(gameTypeLabels[gameType])}
        closeLabel={roomText.closeCreate}
        onClose={closeCreateModal}
        as="form"
        onSubmit={handleCreate}
        closeDisabled={isCreating}
        panelClassName={getYeonSurfaceClassName({
          className: `relative z-10 max-h-[calc(100vh-3rem)] w-full max-w-[456px] overflow-y-auto rounded-xl ${YEON_WEB_SHADOW_CLASS.popover}`,
        })}
        bodyClassName="p-7 pt-6"
      >
        <YeonView className="grid gap-6">
          <YeonLabel className="grid gap-3 text-[15px] font-bold text-[#111]">
            {roomText.roomTitle}
            <YeonField
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={roomText.roomTitlePlaceholder}
              maxLength={40}
              disabled={isCreating}
              className="h-[50px] rounded-lg px-4 text-[16px] font-medium"
            />
          </YeonLabel>

          <YeonView className="grid gap-2 rounded-lg border border-[#111] bg-[#fafafa] p-4 shadow-[inset_0_0_0_1px_#111]">
            <YeonView className="flex items-center gap-2 text-[#111]">
              <YeonIcon name={selectedGameTypeOption.icon} size={17} />
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="text-[16px] font-black"
              >
                {gameTypeLabels[gameType]}
              </YeonText>
            </YeonView>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[13px] font-semibold leading-5 text-[#666]"
            >
              {gameType === TYPING_ROOM_GAME_TYPE.STANDARD
                ? roomText.standardDescription
                : roomText.territoryDescription}{" "}
              {roomText.gameTypeLocked}
            </YeonText>
          </YeonView>

          <YeonView
            as="fieldset"
            className="grid gap-3 text-[15px] font-bold text-[#111]"
          >
            <YeonText as="legend" variant="unstyled" tone="inherit">
              {roomText.visibility}
            </YeonText>
            <YeonView className="grid grid-cols-2 gap-2">
              {[
                TYPING_ROOM_VISIBILITY.PUBLIC,
                TYPING_ROOM_VISIBILITY.PRIVATE,
              ].map((option) => (
                <YeonLabel
                  key={option}
                  className={`flex h-[52px] cursor-pointer items-center justify-center rounded-lg border text-[16px] font-semibold transition-colors ${
                    visibility === option
                      ? "border-[#111] bg-white text-[#111] shadow-[inset_0_0_0_1px_#111]"
                      : "border-[#e5e5e5] bg-white text-[#111] hover:border-[#111]"
                  }`}
                >
                  <YeonField
                    type="radio"
                    name="visibility"
                    value={option}
                    checked={visibility === option}
                    onChange={() => setVisibility(option)}
                    disabled={isCreating}
                    className="sr-only"
                  />
                  {visibilityLabels[option]}
                </YeonLabel>
              ))}
            </YeonView>
          </YeonView>

          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[14px] font-medium leading-6 text-[#666]"
          >
            {roomText.detailsAfterEntry}
          </YeonText>

          {createError && (
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-[13px] font-semibold leading-5 text-[#111]"
            >
              {createError}
            </YeonText>
          )}

          <YeonButton
            type="submit"
            variant="primary"
            disabled={isCreating}
            className={`h-[60px] rounded-lg px-4 text-[18px] disabled:cursor-not-allowed disabled:opacity-60 ${YEON_WEB_SHADOW_CLASS.actionSoft}`}
          >
            {isCreating
              ? roomText.creatingRoom
              : roomText.createAndEnter(gameTypeLabels[gameType])}
          </YeonButton>
        </YeonView>
      </RoomCreateDialog>
    </YeonView>
  );
}
