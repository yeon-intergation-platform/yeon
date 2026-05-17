"use client";

import type { ChangeEvent } from "react";
import {
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_LANGUAGE,
  TYPING_ROOM_MODE,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  type RoomSettingsUpdateMessage,
  type TypingRoomDifficulty,
  type TypingRoomLanguage,
  type TypingRoomMode,
  type TypingRoomSnapshot,
  type TypingRoomTextType,
  type TypingRoomVisibility,
} from "@yeon/race-shared";

import { normalizeDeckTitle } from "./typing-room-deck-format";
import {
  TYPING_ROOM_DIFFICULTY_LABELS,
  TYPING_ROOM_LANGUAGE_LABELS,
  TYPING_ROOM_MODE_LABELS,
  TYPING_ROOM_TEXT_TYPE_LABELS,
  TYPING_ROOM_VISIBILITY_LABELS,
} from "./typing-room-labels";
import {
  LOBBY_MAX_PARTICIPANT_OPTIONS,
  LOBBY_ROUND_COUNT_OPTIONS,
} from "./typing-room-options";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import { SHARED_FEATURE_CLASS } from "../shared-style-constants";
import type { TypingDeckOption } from "./use-typing-settings";

type TypingRoomSettingsPanelProps = {
  room: TypingRoomSnapshot;
  isHost: boolean;
  selectedDeckId: string;
  roomDeckTitle: string;
  deckOptions: readonly TypingDeckOption[];
  settingsError: string | null;
  onSendSetting: (payload: RoomSettingsUpdateMessage) => void;
  onDeckChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

const SETTINGS_FIELD_CLASS = `${SHARED_FEATURE_CLASS.text12EmphasisNeutral} grid gap-1`;
const SETTINGS_SELECT_CLASS = "h-9 rounded-lg border border-[#d7d7d7] px-2";

export function TypingRoomSettingsPanel({
  room,
  isHost,
  selectedDeckId,
  roomDeckTitle,
  deckOptions,
  settingsError,
  onSendSetting,
  onDeckChange,
}: TypingRoomSettingsPanelProps) {
  return (
    <section className="rounded-2xl border border-[#e5e5e5] bg-white p-3 xl:order-1">
      <h2 className={TYPING_SERVICE_COMMON_CLASS.panelSubheading}>방 설정</h2>
      <div className="grid grid-cols-2 gap-2">
        <label className={SETTINGS_FIELD_CLASS}>
          공개 여부
          {isHost ? (
            <select
              value={room.visibility}
              onChange={(event) =>
                onSendSetting({
                  visibility: event.target.value as TypingRoomVisibility,
                })
              }
              className={SETTINGS_SELECT_CLASS}
            >
              {Object.values(TYPING_ROOM_VISIBILITY).map((value) => (
                <option key={value} value={value}>
                  {TYPING_ROOM_VISIBILITY_LABELS[value]}
                </option>
              ))}
            </select>
          ) : (
            <p className={SHARED_FEATURE_CLASS.mutedInputPanel}>
              {TYPING_ROOM_VISIBILITY_LABELS[room.visibility]}
            </p>
          )}
        </label>

        <label className={SETTINGS_FIELD_CLASS}>
          최대 인원
          {isHost ? (
            <select
              value={room.maxParticipants}
              onChange={(event) =>
                onSendSetting({
                  maxParticipants: Number(event.target.value),
                })
              }
              className={SETTINGS_SELECT_CLASS}
            >
              {LOBBY_MAX_PARTICIPANT_OPTIONS.map((value) => (
                <option
                  key={value}
                  value={value}
                  disabled={value < room.currentParticipants}
                >
                  {value}명
                </option>
              ))}
            </select>
          ) : (
            <p className={SHARED_FEATURE_CLASS.mutedInputPanel}>
              최대 {room.maxParticipants}명
            </p>
          )}
        </label>

        <label className={SETTINGS_FIELD_CLASS}>
          언어
          {isHost ? (
            <select
              value={room.language}
              onChange={(event) =>
                onSendSetting({
                  language: event.target.value as TypingRoomLanguage,
                })
              }
              className={SETTINGS_SELECT_CLASS}
            >
              {[
                TYPING_ROOM_LANGUAGE.KO,
                TYPING_ROOM_LANGUAGE.EN,
                TYPING_ROOM_LANGUAGE.CODE,
              ].map((value) => (
                <option key={value} value={value}>
                  {TYPING_ROOM_LANGUAGE_LABELS[value]}
                </option>
              ))}
            </select>
          ) : (
            <p className={SHARED_FEATURE_CLASS.mutedInputPanel}>
              {TYPING_ROOM_LANGUAGE_LABELS[room.language]}
            </p>
          )}
        </label>

        <label className={SETTINGS_FIELD_CLASS}>
          문장 길이
          {isHost ? (
            <select
              value={room.textType}
              onChange={(event) =>
                onSendSetting({
                  textType: event.target.value as TypingRoomTextType,
                })
              }
              className={SETTINGS_SELECT_CLASS}
            >
              {Object.values(TYPING_ROOM_TEXT_TYPE).map((value) => (
                <option key={value} value={value}>
                  {TYPING_ROOM_TEXT_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          ) : (
            <p className={SHARED_FEATURE_CLASS.mutedInputPanel}>
              {TYPING_ROOM_TEXT_TYPE_LABELS[room.textType]}
            </p>
          )}
        </label>

        <label className={SETTINGS_FIELD_CLASS}>
          난이도
          {isHost ? (
            <select
              value={room.difficulty}
              onChange={(event) =>
                onSendSetting({
                  difficulty: event.target.value as TypingRoomDifficulty,
                })
              }
              className={SETTINGS_SELECT_CLASS}
            >
              {Object.values(TYPING_ROOM_DIFFICULTY).map((value) => (
                <option key={value} value={value}>
                  {TYPING_ROOM_DIFFICULTY_LABELS[value]}
                </option>
              ))}
            </select>
          ) : (
            <p className={SHARED_FEATURE_CLASS.mutedInputPanel}>
              {TYPING_ROOM_DIFFICULTY_LABELS[room.difficulty]}
            </p>
          )}
        </label>

        <label className={SETTINGS_FIELD_CLASS}>
          판 수
          {isHost ? (
            <select
              value={room.roundCount}
              onChange={(event) =>
                onSendSetting({ roundCount: Number(event.target.value) })
              }
              className={SETTINGS_SELECT_CLASS}
            >
              {LOBBY_ROUND_COUNT_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}판
                </option>
              ))}
            </select>
          ) : (
            <p className={SHARED_FEATURE_CLASS.mutedInputPanel}>
              {room.roundCount}판
            </p>
          )}
        </label>

        <label className={SETTINGS_FIELD_CLASS}>
          진행 방식
          {isHost ? (
            <select
              value={room.mode}
              onChange={(event) =>
                onSendSetting({
                  mode: event.target.value as TypingRoomMode,
                })
              }
              className={SETTINGS_SELECT_CLASS}
            >
              {[TYPING_ROOM_MODE.FINISH, TYPING_ROOM_MODE.TIME_LIMIT].map(
                (value) => (
                  <option key={value} value={value}>
                    {TYPING_ROOM_MODE_LABELS[value]}
                  </option>
                )
              )}
            </select>
          ) : (
            <p className={SHARED_FEATURE_CLASS.mutedInputPanel}>
              {TYPING_ROOM_MODE_LABELS[room.mode]}
            </p>
          )}
        </label>

        {settingsError && (
          <p className="col-span-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {settingsError}
          </p>
        )}

        <label className={`col-span-2 ${SETTINGS_FIELD_CLASS}`}>
          덱
          {isHost ? (
            <select
              value={room.selectedDeckId ?? selectedDeckId}
              onChange={onDeckChange}
              className={SETTINGS_SELECT_CLASS}
            >
              {deckOptions.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {normalizeDeckTitle(deck)}
                </option>
              ))}
            </select>
          ) : (
            <p className={SHARED_FEATURE_CLASS.mutedInputPanel}>
              {roomDeckTitle}
            </p>
          )}
        </label>
      </div>
    </section>
  );
}
