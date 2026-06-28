"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useYeonRouter,
  useYeonSearchParams,
} from "@yeon/ui/runtime/YeonNavigation";
import {
  TERRITORY_BATTLE_TEAM,
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_GAME_TYPE,
  TYPING_ROOM_LANGUAGE,
  TYPING_ROOM_MODE,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  canEditTypingRoomSettings,
  canSendTypingRoomLobbyChat,
  canStartTypingRoom,
  canSwitchTypingRoomTeam,
  canToggleTypingRoomReady,
  findTypingRoomParticipant,
  isTypingRoomHostParticipant,
  isTypingRoomWaiting,
  type TypingRoomCreateMessage,
  type TypingRoomDifficulty,
  type TypingRoomGameType,
  type TypingRoomLanguage,
  type TypingRoomMode,
  type TypingRoomTextType,
  type TypingRoomVisibility,
  type RoomSettingsUpdateMessage,
  type TerritoryBattleTeam,
} from "@yeon/race-shared";
import { useCharacterFrameOverrides } from "./use-character-frame-overrides";
import { CharacterSprite } from "./character-sprite";
import { findCharacter } from "./characters";
import { usePlayerIdentity } from "./use-player-identity";
import { useRaceRoom } from "./use-race-room";
import { useTypingProfile } from "./use-typing-profile";
import { TypingRaceMultiplayerScreen } from "./typing-race-multiplayer-screen";
import { TypingServiceHeader } from "./typing-service-header";
import { TypingRoomParticipantsPanel } from "./typing-room-participants-panel";
import { TypingRoomSettingsPanel } from "./typing-room-settings-panel";
import { TypingRoomWaitingHeader } from "./typing-room-waiting-header";
import {
  getTypingUiText,
  TYPING_ROOM_DIFFICULTY_LABELS_BY_LOCALE,
  TYPING_ROOM_GAME_TYPE_LABELS_BY_LOCALE,
  TYPING_ROOM_LANGUAGE_LABELS_BY_LOCALE,
  TYPING_ROOM_MODE_LABELS_BY_LOCALE,
  TYPING_ROOM_STATUS_LABELS_BY_LOCALE,
  TYPING_ROOM_TEXT_TYPE_LABELS_BY_LOCALE,
  TYPING_ROOM_VISIBILITY_LABELS_BY_LOCALE,
  type TypingUiText,
} from "./typing-service-i18n";
import {
  resolveTypingRaceSeed,
  useSelectedTypingDeck,
  useTypingSettings,
  type TypingDeckOption,
  type TypingRaceSeed,
} from "./use-typing-settings";
import { normalizeDeckTitle } from "./typing-room-deck-format";
import { resolveTypingRoomSelectedDeck } from "./typing-room-selection";
import {
  buildTypingRoomInviteCopyError,
  buildTypingRoomParticipantSlots,
  getTypingRoomEntryEventName,
  isTypingRoomCreateMode,
  isTypingRoomJoinMode,
  type TypingRoomScreenMode,
} from "./typing-room-screen-policy";
import {
  TypingRoomConnectionErrorState,
  TypingRoomLoadingState,
  TypingRoomSeedErrorState,
} from "./typing-room-state-views";
import {
  LOBBY_MAX_PARTICIPANT_OPTIONS,
  LOBBY_ROUND_COUNT_OPTIONS,
  MAX_LOBBY_CHAT_LENGTH,
} from "./typing-room-options";
import { trackEvent } from "@/lib/analytics";
import {
  YeonButton,
  YeonField,
  YeonIcon,
  YeonView,
  YeonText,
  type YeonChangeEvent,
  type YeonMouseEvent,
  type YeonAnchorElement,
  type YeonSelectElement,
  type YeonElement,
} from "@yeon/ui";
import {
  getYeonClosestElement,
  getYeonElementAttribute,
  hasYeonElementAttribute,
  isYeonElementTagName,
} from "@yeon/ui/rich-content/YeonRichDom";
import {
  copyYeonClipboardText,
  createYeonUrl,
  getYeonLocationOrigin,
  getYeonLocationSnapshot,
  scheduleYeonTimeout,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { RoomVoiceCallPanel } from "@/features/room-voice-call/room-voice-call-panel";
import { useRoomVoiceCall } from "@/features/room-voice-call/use-room-voice-call";

type TypingRoomScreenProps = {
  roomId?: string;
  mode: TypingRoomScreenMode;
};

type DeckAwareCreateMessage = TypingRoomCreateMessage & {
  language: TypingRoomLanguage;
  selectedDeckId?: string;
  selectedDeckVisibility?: "default" | "public" | "private";
  lobbyDeckTitle?: string;
  participantDeckTitle?: string;
  raceSeed?: TypingRaceSeed;
};

type TerritoryLobbyRoomSnapshot = NonNullable<
  ReturnType<typeof useRaceRoom>["roomSnapshot"]
>;

type TerritoryLobbyParticipant =
  | TerritoryLobbyRoomSnapshot["participants"][number]
  | null;

type TerritoryLobbyPanelStateProps = {
  room: TerritoryLobbyRoomSnapshot;
  participants: TerritoryLobbyParticipant[];
  messages: TerritoryLobbyRoomSnapshot["messages"];
};

type TerritoryLobbyPanelDisplayProps = {
  labels: TypingUiText["room"];
  difficultyLabels: Record<TypingRoomDifficulty, string>;
  gameTypeLabels: Record<TypingRoomGameType, string>;
};

type TerritoryLobbyPanelActionProps = {
  canSwitchTeam: boolean;
  canToggleReady: boolean;
  isReady: boolean;
  isLeavingRoom: boolean;
  isRoomToolsVisible: boolean;
  myTeam: TerritoryBattleTeam | null;
  onLeaveRoom: () => void;
  onSwitchTeam: () => void;
  onToggleReady: () => void;
  onToggleRoomTools: () => void;
};

type TerritoryLobbyPanelChatProps = {
  chatDraft: string;
  chatError: string | null;
  canSendChat: boolean;
  onChatDraftChange: (value: string) => void;
  onChatSubmit: () => void;
};

type TerritoryLobbyPanelProps = TerritoryLobbyPanelStateProps &
  TerritoryLobbyPanelDisplayProps &
  TerritoryLobbyPanelActionProps &
  TerritoryLobbyPanelChatProps;

function localizeRoomSystemMessage(
  content: string,
  labels: TypingUiText["room"]
) {
  const normalized = content.trim();
  if (normalized === "방이 생성되었습니다.") {
    return labels.roomCreated;
  }

  const joined = normalized.match(/^(.+)님이 입장했습니다\.$/);
  if (joined?.[1]) {
    return labels.participantJoined(joined[1]);
  }

  const disconnected = normalized.match(
    /^(.+)님과의 연결이 잠시 끊겼습니다\.$/
  );
  if (disconnected?.[1]) {
    return labels.participantDisconnected(disconnected[1]);
  }

  const left = normalized.match(/^(.+)님이 퇴장했습니다\.$/);
  if (left?.[1]) {
    return labels.participantLeft(left[1]);
  }

  return content;
}

function TerritoryLobbyPanel({
  room,
  participants,
  labels,
  difficultyLabels,
  gameTypeLabels,
  messages,
  canSwitchTeam,
  canToggleReady,
  isReady,
  isLeavingRoom,
  isRoomToolsVisible,
  myTeam,
  chatDraft,
  chatError,
  canSendChat,
  onLeaveRoom,
  onSwitchTeam,
  onToggleReady,
  onToggleRoomTools,
  onChatDraftChange,
  onChatSubmit,
}: TerritoryLobbyPanelProps) {
  const isTerritoryRoom = room.gameType === TYPING_ROOM_GAME_TYPE.TERRITORY;
  const { redTeam, blueTeam } = partitionTerritoryParticipants(participants);
  const recentMessages = messages.slice(-5);
  const teamSlotCount = Math.max(4, Math.ceil(room.maxParticipants / 2));
  const nextTeamLabel =
    myTeam === TERRITORY_BATTLE_TEAM.BLUE
      ? labels.moveToRedTeam
      : labels.moveToBlueTeam;
  const roomInfo = [
    [labels.infoTitle, gameTypeLabels[room.gameType]],
    [
      labels.gameTime,
      room.mode === TYPING_ROOM_MODE.TIME_LIMIT
        ? labels.timeLimitOneMinute
        : labels.roundCountValue(room.roundCount),
    ],
    [labels.difficulty, difficultyLabels[room.difficulty]],
    [
      labels.currentParticipants,
      `${room.currentParticipants}/${room.maxParticipants}`,
    ],
    [labels.flow, isTerritoryRoom ? labels.teamMatch : labels.soloRace],
  ];

  return (
    <YeonView
      as="section"
      className="overflow-hidden rounded-lg border border-[#e5e5e5] bg-white shadow-sm"
    >
      <YeonView className="grid gap-4 p-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:p-6">
        <YeonView
          as="aside"
          className="grid content-start gap-4 rounded-lg border border-[#e5e5e5] bg-white p-5 lg:self-start"
        >
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="flex items-center gap-2 text-[18px] font-black tracking-[-0.02em] text-[#111]"
          >
            {labels.infoTitle}
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="flex h-4 w-4 items-center justify-center rounded-full border border-[#999] text-[11px] font-bold text-[#666]"
            >
              i
            </YeonText>
          </YeonText>

          <YeonView className="grid gap-0 divide-y divide-[#eeeeee]">
            {roomInfo.map(([label, value]) => (
              <YeonView
                key={label}
                className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3"
              >
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="text-[13px] font-semibold text-[#777]"
                >
                  {label}
                </YeonText>
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="text-right text-[14px] font-black text-[#111]"
                >
                  {value}
                </YeonText>
              </YeonView>
            ))}
          </YeonView>

          <YeonView className="grid gap-3 border-t border-[#eeeeee] pt-5">
            <YeonButton
              type="button"
              onClick={onLeaveRoom}
              disabled={isLeavingRoom}
              variant="secondary"
              size="md"
              className="w-full rounded-lg px-4 py-3 text-[13px] font-black"
            >
              <YeonIcon name="arrow-left" size={14} />
              {isLeavingRoom ? labels.leaving : labels.leaveRoom}
            </YeonButton>
            <YeonButton
              type="button"
              onClick={onToggleRoomTools}
              variant="secondary"
              size="md"
              className="w-full rounded-lg px-4 py-3 text-[13px] font-black"
            >
              {isRoomToolsVisible ? labels.closeSettings : labels.openSettings}
            </YeonButton>
          </YeonView>
        </YeonView>

        <YeonView className="grid min-w-0 gap-4">
          <YeonView className="rounded-lg border border-[#e5e5e5] bg-white p-4 md:p-6">
            <YeonView className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <YeonText
                as="h2"
                variant="unstyled"
                tone="inherit"
                className="flex items-center gap-2 text-[20px] font-black tracking-[-0.03em] text-[#111]"
              >
                <YeonIcon name={isTerritoryRoom ? "users" : "play"} size={21} />
                {isTerritoryRoom
                  ? labels.teamWaitingRoom
                  : labels.participantWaitingRoom}
              </YeonText>
            </YeonView>

            {isTerritoryRoom ? (
              <>
                <YeonView className="grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)]">
                  <TerritoryTeamColumn
                    title={labels.redTeam}
                    members={redTeam}
                    maxSlots={teamSlotCount}
                    tone="red"
                    labels={labels}
                  />
                  <YeonView className="flex items-center justify-center py-1 lg:h-full">
                    <YeonText
                      as="span"
                      variant="unstyled"
                      tone="inherit"
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[15px] font-black text-[#111] shadow-sm"
                    >
                      VS
                    </YeonText>
                  </YeonView>
                  <TerritoryTeamColumn
                    title={labels.blueTeam}
                    members={blueTeam}
                    maxSlots={teamSlotCount}
                    tone="blue"
                    labels={labels}
                  />
                </YeonView>

                <YeonView className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <YeonButton
                    type="button"
                    onClick={onSwitchTeam}
                    disabled={!canSwitchTeam}
                    variant="secondary"
                    size="lg"
                    title={nextTeamLabel}
                    className="min-w-[180px] rounded-lg px-5 py-3 text-[15px] font-black"
                  >
                    <YeonIcon name="arrow-left" size={15} />
                    {labels.switchTeam}
                  </YeonButton>
                  <YeonButton
                    type="button"
                    onClick={onToggleReady}
                    disabled={!canToggleReady}
                    variant={isReady ? "secondary" : "primary"}
                    size="lg"
                    className="min-w-[220px] rounded-lg px-5 py-3 text-[15px] font-black"
                  >
                    {isReady ? labels.cancelReady : labels.ready}
                  </YeonButton>
                </YeonView>
              </>
            ) : (
              <StandardRoomParticipantList
                participants={participants}
                maxSlots={room.maxParticipants}
                labels={labels}
              />
            )}
          </YeonView>

          <YeonView className="rounded-lg border border-[#e5e5e5] bg-white p-4">
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className="flex items-center gap-2 text-[16px] font-black text-[#111]"
            >
              <YeonIcon name="message-circle" size={18} />
              {labels.chat}
            </YeonText>
            <YeonView className="mt-3 h-[112px] overflow-y-auto rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3 text-[12px] leading-5 text-[#666]">
              {recentMessages.length ? (
                recentMessages.map((message) => (
                  <YeonText
                    as="p"
                    variant="unstyled"
                    tone="inherit"
                    key={message.id}
                    className="truncate"
                  >
                    {message.messageType === "system"
                      ? `[${labels.system}]`
                      : `[${message.senderLabel ?? labels.participant}]`}{" "}
                    {message.messageType === "system"
                      ? localizeRoomSystemMessage(message.content, labels)
                      : message.content}
                  </YeonText>
                ))
              ) : (
                <>
                  <YeonText as="p" variant="unstyled" tone="inherit">
                    [{labels.system}]{" "}
                    {isTerritoryRoom
                      ? labels.territoryEntered
                      : labels.standardEntered}
                  </YeonText>
                  <YeonText as="p" variant="unstyled" tone="inherit">
                    [{labels.system}]{" "}
                    {isTerritoryRoom
                      ? labels.chooseTeamReady
                      : labels.readyToStart}
                  </YeonText>
                </>
              )}
            </YeonView>
            <YeonView className="mt-3 flex gap-2">
              <YeonField
                value={chatDraft}
                onChange={(event) => onChatDraftChange(event.target.value)}
                placeholder={labels.messagePlaceholder}
                className="h-10 flex-1 rounded-lg px-3 text-[13px]"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    onChatSubmit();
                  }
                }}
              />
              <YeonButton
                type="button"
                onClick={onChatSubmit}
                disabled={!canSendChat}
                variant="primary"
                size="md"
                className="h-10 shrink-0 rounded-lg px-4"
                aria-label={labels.sendChat}
              >
                <YeonIcon name="send" size={16} />
              </YeonButton>
            </YeonView>
            {chatError && (
              <YeonText
                as="p"
                variant="caption"
                tone="primary"
                className="mt-2 font-semibold"
              >
                {chatError}
              </YeonText>
            )}
          </YeonView>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}

type TerritoryTeamColumnProps = {
  title: string;
  members: TerritoryLobbyParticipant[];
  maxSlots: number;
  tone: "red" | "blue";
  labels: TypingUiText["room"];
};

type StandardRoomParticipantListProps = {
  participants: TerritoryLobbyParticipant[];
  maxSlots: number;
  labels: TypingUiText["room"];
};

function isTerritoryLobbyMember(
  participant: TerritoryLobbyParticipant
): participant is NonNullable<TerritoryLobbyParticipant> {
  return Boolean(participant);
}

function partitionTerritoryParticipants(
  participants: TerritoryLobbyParticipant[]
) {
  const redTeam: NonNullable<TerritoryLobbyParticipant>[] = [];
  const blueTeam: NonNullable<TerritoryLobbyParticipant>[] = [];

  participants.filter(isTerritoryLobbyMember).forEach((participant, index) => {
    const team =
      participant.team ??
      (index % 2 === 0
        ? TERRITORY_BATTLE_TEAM.RED
        : TERRITORY_BATTLE_TEAM.BLUE);

    if (team === TERRITORY_BATTLE_TEAM.BLUE) {
      blueTeam.push(participant);
      return;
    }

    redTeam.push(participant);
  });

  return { redTeam, blueTeam };
}

// 대기실 슬롯 아바타. 하드코딩 🙂 대신 참가자가 선택한 캐릭터 스프라이트를 보여
// 로비/생성 모달과 일관성을 맞춘다(R2). 빈 슬롯은 "+".
function SlotAvatar({
  characterId,
  size = "md",
}: {
  characterId?: string;
  size?: "sm" | "md";
}) {
  const frameOverrides = useCharacterFrameOverrides();
  const box = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  if (!characterId) {
    return (
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        aria-hidden="true"
        className={`flex ${box} items-center justify-center rounded-full border border-dashed text-[20px] text-[#aaa]`}
      >
        +
      </YeonText>
    );
  }
  const character = findCharacter(characterId);
  return (
    <YeonView
      aria-hidden="true"
      className={`flex ${box} items-end justify-center overflow-hidden rounded-full border border-[#111] bg-[#fffbe8]`}
    >
      <CharacterSprite
        character={character}
        maxHeight={size === "sm" ? 30 : 34}
        sequenceOverride={frameOverrides[character.id]}
      />
    </YeonView>
  );
}

function StandardRoomParticipantList({
  participants,
  maxSlots,
  labels,
}: StandardRoomParticipantListProps) {
  const slots = Array.from(
    { length: maxSlots },
    (_, index) => participants[index] ?? null
  );

  return (
    <YeonView className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {slots.map((participant, index) => (
        <YeonView
          key={participant?.id ?? `standard-slot-${index}`}
          className={`grid min-h-[92px] content-center gap-2 rounded-lg border bg-white p-4 ${
            participant ? "border-[#111]" : "border-[#e5e5e5]"
          }`}
        >
          <YeonView className="flex items-center gap-3">
            <SlotAvatar characterId={participant?.characterId} size="md" />
            <YeonView className="min-w-0">
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="truncate text-[14px] font-black text-[#111]"
              >
                {participant?.label ?? labels.emptySlot}
              </YeonText>
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="mt-1 text-[11px] font-black text-[#666]"
              >
                {participant
                  ? isTypingRoomHostParticipant(participant)
                    ? labels.host
                    : participant.isReady
                      ? labels.readyDone
                      : labels.waiting
                  : labels.inviteAvailable}
              </YeonText>
            </YeonView>
          </YeonView>
        </YeonView>
      ))}
    </YeonView>
  );
}

function TerritoryTeamColumn({
  title,
  members,
  maxSlots,
  tone,
  labels,
}: TerritoryTeamColumnProps) {
  const slots = Array.from(
    { length: maxSlots },
    (_, index) => members[index] ?? null
  );
  const flagColor = tone === "blue" ? "bg-[#2563eb]" : "bg-[#111]";

  return (
    <YeonView className="min-w-0 rounded-lg border border-[#e5e5e5] bg-[#fbfbfb] p-3">
      <YeonView className="mb-3 flex items-center gap-2 px-1 text-[#111]">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={`h-3 w-3 rounded-sm ${flagColor}`}
        />
        <YeonText
          as="h3"
          variant="unstyled"
          tone="inherit"
          className="text-[17px] font-black tracking-[-0.02em]"
        >
          {title}
        </YeonText>
      </YeonView>
      <YeonView className="grid gap-2">
        {slots.map((member, index) => (
          <YeonView
            key={member?.id ?? `${title}-${index}`}
            className={`grid h-14 grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-white px-3 ${
              member ? "border-[#111]" : "border-[#e5e5e5]"
            }`}
          >
            <SlotAvatar characterId={member?.characterId} size="sm" />
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className="truncate text-[14px] font-black text-[#111]"
            >
              {member?.label ?? labels.emptySlot}
            </YeonText>
            {member ? (
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="rounded-md border border-[#d7d7d7] px-2 py-1 text-[11px] font-black text-[#555]"
              >
                {isTypingRoomHostParticipant(member)
                  ? labels.host
                  : member.isReady
                    ? labels.readyShort
                    : labels.waitingShort}
              </YeonText>
            ) : (
              <YeonIcon name="plus" size={16} className="text-[#999]" />
            )}
          </YeonView>
        ))}
      </YeonView>
    </YeonView>
  );
}

function parseEnum<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T
): T {
  return value && allowed.includes(value as T) ? (value as T) : fallback;
}

function parseNumber(
  value: string | null,
  allowed: readonly number[],
  fallback: number
) {
  const parsed = Number(value);
  return allowed.includes(parsed) ? parsed : fallback;
}

function buildRoomSummary({
  language,
  textType,
  difficulty,
  roundCount,
  mode,
  deckTitle,
  labels,
  languageLabels,
  textTypeLabels,
  difficultyLabels,
  modeLabels,
}: {
  language: TypingRoomLanguage;
  textType: TypingRoomTextType;
  difficulty: TypingRoomDifficulty;
  roundCount: number;
  mode: TypingRoomMode;
  deckTitle: string;
  labels: TypingUiText["room"];
  languageLabels: Record<TypingRoomLanguage, string>;
  textTypeLabels: Record<TypingRoomTextType, string>;
  difficultyLabels: Record<TypingRoomDifficulty, string>;
  modeLabels: Record<TypingRoomMode, string>;
}) {
  return [
    languageLabels[language],
    textTypeLabels[textType],
    difficultyLabels[difficulty],
    labels.roundCountValue(roundCount),
    modeLabels[mode],
    deckTitle,
  ].join(" · ");
}

function useCreateRoomOptions(): DeckAwareCreateMessage {
  const searchParams = useYeonSearchParams();

  return useMemo(() => {
    const language = parseEnum<TypingRoomLanguage>(
      searchParams.get("language"),
      [
        TYPING_ROOM_LANGUAGE.KO,
        TYPING_ROOM_LANGUAGE.EN,
        TYPING_ROOM_LANGUAGE.CODE,
      ],
      TYPING_ROOM_LANGUAGE.KO
    );

    return {
      selectedDeckId: searchParams.get("selectedDeckId") ?? undefined,
      title: (searchParams.get("title") || "Typing Practice Room").slice(0, 40),
      visibility: parseEnum<TypingRoomVisibility>(
        searchParams.get("visibility"),
        [TYPING_ROOM_VISIBILITY.PUBLIC, TYPING_ROOM_VISIBILITY.PRIVATE],
        TYPING_ROOM_VISIBILITY.PUBLIC
      ),
      maxParticipants: parseNumber(
        searchParams.get("maxParticipants"),
        LOBBY_MAX_PARTICIPANT_OPTIONS,
        4
      ),
      textType: parseEnum<TypingRoomTextType>(
        searchParams.get("textType"),
        [
          TYPING_ROOM_TEXT_TYPE.SHORT,
          TYPING_ROOM_TEXT_TYPE.LONG,
          TYPING_ROOM_TEXT_TYPE.CODE,
        ],
        TYPING_ROOM_TEXT_TYPE.SHORT
      ),
      language,
      difficulty: parseEnum<TypingRoomDifficulty>(
        searchParams.get("difficulty"),
        [
          TYPING_ROOM_DIFFICULTY.EASY,
          TYPING_ROOM_DIFFICULTY.NORMAL,
          TYPING_ROOM_DIFFICULTY.HARD,
        ],
        TYPING_ROOM_DIFFICULTY.NORMAL
      ),
      roundCount: parseNumber(
        searchParams.get("roundCount"),
        LOBBY_ROUND_COUNT_OPTIONS,
        1
      ),
      mode: parseEnum<TypingRoomMode>(
        searchParams.get("mode"),
        [TYPING_ROOM_MODE.FINISH, TYPING_ROOM_MODE.TIME_LIMIT],
        TYPING_ROOM_MODE.FINISH
      ),
      gameType: parseEnum<TypingRoomGameType>(
        searchParams.get("gameType"),
        [TYPING_ROOM_GAME_TYPE.STANDARD, TYPING_ROOM_GAME_TYPE.TERRITORY],
        TYPING_ROOM_GAME_TYPE.STANDARD
      ),
    };
  }, [searchParams]);
}

export function TypingRoomScreen({ roomId, mode }: TypingRoomScreenProps) {
  const router = useYeonRouter();
  const { profile, loaded: profileLoaded } = useTypingProfile();
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
  const playerId = usePlayerIdentity();
  const createRoomOptions = useCreateRoomOptions();
  const deckState = useSelectedTypingDeck(createRoomOptions.language);
  const selectedDeck = useMemo<TypingDeckOption>(
    () =>
      resolveTypingRoomSelectedDeck(
        createRoomOptions.selectedDeckId,
        deckState.decks,
        deckState.selectedDeck,
        createRoomOptions.language
      ),
    [
      createRoomOptions.language,
      createRoomOptions.selectedDeckId,
      deckState.decks,
      deckState.selectedDeck,
    ]
  );

  const [seedState, setSeedState] = useState<
    | { kind: "idle" | "loading" }
    | { kind: "ready"; seed: TypingRaceSeed | null }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [seedRetryToken, setSeedRetryToken] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [chatDraft, setChatDraft] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [useDefaultFallback, setUseDefaultFallback] = useState(false);
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);
  const [showRoomTools, setShowRoomTools] = useState(false);
  const trackedRoomEntryRef = useRef<string | null>(null);
  const hasTrackedRoomCreateSuccessRef = useRef(false);

  useEffect(() => {
    if (!isTypingRoomCreateMode(mode)) return;
    let cancelled = false;
    setSeedState({ kind: "loading" });

    if (useDefaultFallback) {
      setSeedState({ kind: "ready", seed: null });
      return;
    }

    resolveTypingRaceSeed(selectedDeck, createRoomOptions.language).then(
      (result) => {
        if (cancelled) return;
        if (result.ok) {
          setSeedState({ kind: "ready", seed: result.seed });
        } else {
          setSeedState({ kind: "error", message: result.message });
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [
    createRoomOptions.language,
    createRoomOptions.selectedDeckId,
    mode,
    seedRetryToken,
    selectedDeck,
    useDefaultFallback,
  ]);

  const deckAwareCreateRoomOptions =
    useMemo<DeckAwareCreateMessage | null>(() => {
      if (!isTypingRoomCreateMode(mode)) return null;
      if (seedState.kind !== "ready") return null;
      if (useDefaultFallback) {
        return { ...createRoomOptions, selectedDeckId: undefined };
      }

      return {
        ...createRoomOptions,
        selectedDeckId: selectedDeck.id,
        selectedDeckVisibility: selectedDeck.visibility,
        lobbyDeckTitle:
          selectedDeck.visibility === "private"
            ? roomText.privateDeck
            : selectedDeck.title,
        participantDeckTitle: selectedDeck.title,
        raceSeed: seedState.seed ?? undefined,
      };
    }, [createRoomOptions, mode, seedState, selectedDeck, useDefaultFallback]);

  const race = useRaceRoom({
    enabled:
      profileLoaded &&
      !!playerId &&
      (!isTypingRoomCreateMode(mode) || !!deckAwareCreateRoomOptions),
    playerLabel: profile.nickname,
    playerId,
    characterId: profile.characterId,
    locale: settings.locale,
    roomId: isTypingRoomJoinMode(mode) ? roomId : null,
    createRoom: deckAwareCreateRoomOptions,
  });

  useEffect(() => {
    if (!isTypingRoomCreateMode(mode)) return;
    if (!race.roomId || hasTrackedRoomCreateSuccessRef.current) {
      return;
    }

    hasTrackedRoomCreateSuccessRef.current = true;
    router.replace(`/typing-service/rooms/${race.roomId}`);
    trackEvent("room_create_success", {
      source: "typing_room_create",
      room_id: race.roomId,
      visibility: createRoomOptions.visibility,
      language: createRoomOptions.language,
      game_type: createRoomOptions.gameType,
      deck_id: selectedDeck.id,
      deck_title: selectedDeck.title,
    });
  }, [
    createRoomOptions.language,
    createRoomOptions.visibility,
    mode,
    race.roomId,
    router,
    selectedDeck.id,
    selectedDeck.title,
  ]);

  const room = race.roomSnapshot;
  const me = room
    ? findTypingRoomParticipant(room.participants, race.mySeat)
    : null;
  const voiceParticipants = useMemo(
    () =>
      (room?.participants ?? []).map((participant) => ({
        id: participant.id,
        label: participant.label,
      })),
    [room?.participants]
  );
  const normalizeVoiceCallServerError = useCallback(
    (message: string) => roomText.voiceCall.serverErrors[message] ?? message,
    [roomText.voiceCall.serverErrors]
  );
  const voiceCall = useRoomVoiceCall({
    room: race.room,
    localParticipantId: race.mySeat,
    participants: voiceParticipants,
    messageOverrides: roomText.voiceCall.messages,
    normalizeServerError: normalizeVoiceCallServerError,
  });
  const isHost = isTypingRoomHostParticipant(me);
  const isReady = Boolean(me?.isReady);
  const canEditSettings = canEditTypingRoomSettings(room, me);
  const canToggleReady = canToggleTypingRoomReady(room, me);
  const canSwitchTeam = canSwitchTypingRoomTeam(room, me);
  const canStart = canStartTypingRoom(room, me);
  const inviteOrigin = getYeonLocationOrigin();
  const inviteUrl =
    inviteOrigin && race.roomId
      ? `${inviteOrigin}/typing-service/rooms/${race.roomId}`
      : "";

  useEffect(() => {
    if (!room || !race.roomId) return;

    const trackingKey = `${mode}:${race.roomId}`;
    if (trackedRoomEntryRef.current === trackingKey) return;

    trackedRoomEntryRef.current = trackingKey;
    trackEvent(getTypingRoomEntryEventName(mode), {
      source: "typing_room",
      room_id: race.roomId,
      visibility: room.visibility,
      game_type: room.gameType,
      current_participants: room.currentParticipants,
      max_participants: room.maxParticipants,
      selected_deck_id: isTypingRoomCreateMode(mode)
        ? (deckAwareCreateRoomOptions?.selectedDeckId ?? null)
        : null,
    });
  }, [deckAwareCreateRoomOptions, mode, race.roomId, room]);

  const copyInvite = async () => {
    if (!inviteUrl) return;
    try {
      const copiedSuccessfully = await copyYeonClipboardText(inviteUrl);
      if (!copiedSuccessfully) {
        throw buildTypingRoomInviteCopyError(
          inviteUrl,
          roomText.copyUnsupported
        );
      }
      trackEvent("room_invite_copy", {
        source: "typing_room",
        room_id: race.roomId ?? roomId ?? null,
        mode,
      });
      setCopied(true);
      setCopyError(null);
      scheduleYeonTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.warn("[typing-room] invite link copy failed", error);
      setCopied(false);
      setCopyError(roomText.copyError);
    }
  };

  const sendSetting = useCallback(
    (payload: RoomSettingsUpdateMessage) => {
      if (!canEditSettings) return;
      setSettingsError(null);
      race.sendRoomSettings(payload);
    },
    [canEditSettings, race]
  );

  const canSendChat = canSendTypingRoomLobbyChat(
    room,
    chatDraft,
    MAX_LOBBY_CHAT_LENGTH
  );

  const onChatDraftChange = useCallback((value: string) => {
    setChatDraft(value);
    if (value.length > MAX_LOBBY_CHAT_LENGTH) {
      setChatError(roomText.chatTooLong(MAX_LOBBY_CHAT_LENGTH));
      return;
    }
    setChatError(null);
  }, []);

  const onChatSubmit = useCallback(() => {
    if (!canSendTypingRoomLobbyChat(room, chatDraft, MAX_LOBBY_CHAT_LENGTH)) {
      return;
    }

    setChatError(null);
    race.sendChat(chatDraft.trim());
    setChatDraft("");
  }, [chatDraft, race, room]);

  const onDeckChange = useCallback(
    async (event: YeonChangeEvent<YeonSelectElement>) => {
      const deckId = event.target.value;
      const targetDeck = deckState.decks.find((deck) => deck.id === deckId);
      if (!targetDeck) return;

      const result = await resolveTypingRaceSeed(
        targetDeck,
        room?.language ?? createRoomOptions.language
      );

      if (!result.ok) {
        setSettingsError(result.message);
        return;
      }

      sendSetting({
        selectedDeckId: deckId,
        selectedDeckVisibility: targetDeck.visibility,
        lobbyDeckTitle: normalizeDeckTitle(targetDeck, roomText.privateDeck),
        raceSeed: result.seed,
      });
    },
    [createRoomOptions.language, deckState.decks, room?.language, sendSetting]
  );

  const onStart = useCallback(async () => {
    if (!canStart || !room) return;

    const activeDeck =
      deckState.decks.find((deck) => deck.id === room.selectedDeckId) ??
      selectedDeck;
    const result = await resolveTypingRaceSeed(activeDeck, room.language);

    if (!result.ok) {
      setSettingsError(result.message);
      return;
    }

    setSettingsError(null);
    race.sendStart({
      raceSeed: result.seed ?? undefined,
    });
  }, [deckState.decks, canStart, race, room, selectedDeck]);

  const onLeaveRoom = useCallback(async () => {
    if (isLeavingRoom) return;

    setIsLeavingRoom(true);
    await race.leaveRoom();
    router.push("/typing-service/rooms");
  }, [isLeavingRoom, race, router]);

  const onRoomNavigationClickCapture = useCallback(
    (event: YeonMouseEvent<YeonElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = getYeonClosestElement<YeonAnchorElement>(
        event.target,
        "a[href]"
      );
      if (!anchor || !isYeonElementTagName(anchor, "a")) return;
      if (anchor.target || hasYeonElementAttribute(anchor, "download")) return;

      const href = getYeonElementAttribute(anchor, "href");
      if (!href || href.startsWith("#")) return;

      const currentLocation = getYeonLocationSnapshot();
      if (!currentLocation) return;
      const destination = createYeonUrl(anchor.href, currentLocation.href);
      if (destination.origin !== currentLocation.origin) return;
      if (
        destination.pathname === currentLocation.pathname &&
        destination.search === currentLocation.search &&
        destination.hash === currentLocation.hash
      ) {
        return;
      }

      if (destination.pathname === "/typing-service/territory" && race.roomId) {
        return;
      }

      event.preventDefault();
      if (isLeavingRoom) return;

      const nextPath = `${destination.pathname}${destination.search}${destination.hash}`;
      setIsLeavingRoom(true);
      void race.leaveRoom().finally(() => {
        router.push(nextPath);
      });
    },
    [isLeavingRoom, race, router]
  );

  const deckOptions = useMemo<TypingDeckOption[]>(() => {
    const language = room?.language ?? createRoomOptions.language;
    const options = deckState.decks.filter(
      (deck) =>
        deck.languageTag === "mixed" ||
        deck.languageTag === language ||
        deck.id === room?.selectedDeckId
    );
    if (
      room?.selectedDeckId &&
      !options.some((deck) => deck.id === room.selectedDeckId)
    ) {
      return options;
    }
    return options;
  }, [
    createRoomOptions.language,
    deckState.decks,
    room?.language,
    room?.selectedDeckId,
  ]);

  const roomDeckTitle =
    room?.lobbyDeckTitle ?? text.settings.selectedPracticeDeck;
  const frameOverrides = useCharacterFrameOverrides();
  const summaryLanguage =
    room?.language ?? createRoomOptions.language ?? TYPING_ROOM_LANGUAGE.KO;
  const summaryTextType =
    room?.textType ?? createRoomOptions.textType ?? TYPING_ROOM_TEXT_TYPE.SHORT;
  const summaryDifficulty =
    room?.difficulty ??
    createRoomOptions.difficulty ??
    TYPING_ROOM_DIFFICULTY.NORMAL;
  const summaryRoundCount =
    room?.roundCount ?? createRoomOptions.roundCount ?? 1;
  const summaryMode =
    room?.mode ?? createRoomOptions.mode ?? TYPING_ROOM_MODE.FINISH;
  const roomSummary = buildRoomSummary({
    language: summaryLanguage,
    textType: summaryTextType,
    difficulty: summaryDifficulty,
    roundCount: summaryRoundCount,
    mode: summaryMode,
    deckTitle: roomDeckTitle,
    labels: roomText,
    languageLabels,
    textTypeLabels,
    difficultyLabels,
    modeLabels,
  });

  const participants = useMemo(() => {
    return buildTypingRoomParticipantSlots(
      room?.participants ?? [],
      room?.maxParticipants ?? 0
    );
  }, [room?.maxParticipants, room?.participants]);

  const messages = useMemo(() => room?.messages ?? [], [room?.messages]);
  const waitingStateLabel = isTypingRoomWaiting(room)
    ? roomText.waitingState
    : room
      ? statusLabels[room.status]
      : undefined;

  if (isTypingRoomCreateMode(mode) && seedState.kind === "loading") {
    return <TypingRoomLoadingState message={roomText.selectedDeckLoading} />;
  }

  if (isTypingRoomCreateMode(mode) && seedState.kind === "error") {
    return (
      <TypingRoomSeedErrorState
        message={seedState.message}
        labels={roomText}
        onRetry={() => setSeedRetryToken((value) => value + 1)}
        onUseDefaultDeck={() => setUseDefaultFallback(true)}
      />
    );
  }

  if (race.connectionState === "connecting" || !room) {
    return (
      <TypingRoomLoadingState
        message={
          isTypingRoomCreateMode(mode)
            ? roomText.createLoading
            : roomText.joinLoading
        }
      />
    );
  }

  if (
    race.connectionState === "error" ||
    race.connectionState === "disconnected"
  ) {
    return (
      <TypingRoomConnectionErrorState
        message={race.roomError ?? roomText.alreadyStarted}
        labels={roomText}
      />
    );
  }

  if (!isTypingRoomWaiting(room)) {
    return (
      <TypingRaceMultiplayerScreen
        race={race}
        voiceCall={voiceCall}
        voiceCallLabels={roomText.voiceCall.panel}
      />
    );
  }

  return (
    <YeonView
      className={SHARED_FEATURE_CLASS.pageSurface}
      onClickCapture={onRoomNavigationClickCapture}
    >
      <TypingServiceHeader active="rooms" title={text.header.roomsTitle} />

      <YeonView
        as="main"
        className="mx-auto grid w-full max-w-[1840px] gap-4 px-4 py-4 md:px-8 md:py-5"
      >
        <TypingRoomWaitingHeader
          room={room}
          roomSummary={roomSummary}
          waitingStateLabel={waitingStateLabel ?? roomText.waitingState}
          labels={roomText}
          gameTypeLabels={gameTypeLabels}
          visibilityLabels={visibilityLabels}
          copyError={copyError}
          copied={copied}
          isHost={isHost}
          isReady={isReady}
          canStart={canStart}
          canToggleReady={canToggleReady}
          isLeavingRoom={isLeavingRoom}
          roomError={race.roomError}
          territoryHref={`/typing-service/territory?roomId=${encodeURIComponent(
            race.roomId ?? room.roomId
          )}`}
          onLeaveRoom={onLeaveRoom}
          onCopyInvite={copyInvite}
          onStart={onStart}
          onToggleReady={() => {
            if (canToggleReady) race.sendReady(!isReady);
          }}
        />

        <TerritoryLobbyPanel
          room={room}
          participants={participants}
          labels={roomText}
          difficultyLabels={difficultyLabels}
          gameTypeLabels={gameTypeLabels}
          messages={messages}
          canSwitchTeam={canSwitchTeam}
          canToggleReady={canToggleReady}
          isReady={isReady}
          isLeavingRoom={isLeavingRoom}
          isRoomToolsVisible={showRoomTools}
          myTeam={me?.team ?? null}
          chatDraft={chatDraft}
          chatError={chatError}
          canSendChat={canSendChat}
          onLeaveRoom={onLeaveRoom}
          onSwitchTeam={() => {
            if (canSwitchTeam) race.sendTeamChange();
          }}
          onToggleReady={() => {
            if (canToggleReady) race.sendReady(!isReady);
          }}
          onToggleRoomTools={() => setShowRoomTools((value) => !value)}
          onChatDraftChange={onChatDraftChange}
          onChatSubmit={onChatSubmit}
        />

        {showRoomTools && (
          <YeonView
            id="room-settings-panel"
            as="section"
            className="grid gap-3 xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)] xl:items-start"
          >
            <TypingRoomSettingsPanel
              room={room}
              isHost={isHost}
              selectedDeckId={selectedDeck.id}
              roomDeckTitle={roomDeckTitle}
              deckOptions={deckOptions}
              settingsError={settingsError}
              labels={roomText}
              visibilityLabels={visibilityLabels}
              languageLabels={languageLabels}
              textTypeLabels={textTypeLabels}
              difficultyLabels={difficultyLabels}
              modeLabels={modeLabels}
              onSendSetting={sendSetting}
              onDeckChange={onDeckChange}
            />

            <YeonView className="grid gap-3">
              <TypingRoomParticipantsPanel
                participants={participants}
                myParticipantId={me?.id ?? null}
                locale={settings.locale}
                frameOverrides={frameOverrides}
                labels={roomText}
              />
              <RoomVoiceCallPanel
                voiceCall={voiceCall}
                labels={roomText.voiceCall.panel}
              />
            </YeonView>
          </YeonView>
        )}
      </YeonView>
    </YeonView>
  );
}
