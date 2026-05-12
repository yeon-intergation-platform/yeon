"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import {
  CARD_ROOM_RESULT,
  CARD_ROOM_ROLE,
  CARD_ROOM_STATUS,
} from "@yeon/api-contract/card-rooms";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { CharacterSprite } from "@/features/typing-service/character-sprite";
import { findCharacter } from "@/features/typing-service/characters";
import { useCharacterFrameOverrides } from "@/features/typing-service/use-character-frame-overrides";
import {
  joinCardRoom,
  useCardRoomConnection,
  useCardRoomProfile,
} from "./hooks";

type CardRoomScreenProps = { roomId: string };

const STATUS_LABELS = {
  waiting: "대기중",
  answering: "답변 중",
  passed: "OK",
  given_up: "포기",
  revealed: "정답 공개",
  finished: "완료",
} as const;

const ROLE_LABELS = {
  MEMORIZER: "외우는 사람",
  CHECKER: "봐주는 사람",
} as const;

export function CardRoomScreen({ roomId }: CardRoomScreenProps) {
  const { profile, guestId, loaded: profileLoaded } = useCardRoomProfile();
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"card" | "chat">("card");
  const [chatDraft, setChatDraft] = useState("");
  const room = useCardRoomConnection(roomId, participantId);
  const frameOverrides = useCharacterFrameOverrides();

  useEffect(() => {
    if (!profileLoaded) return;
    const key = `yeon-card-room-participant:${roomId}`;
    const existing = sessionStorage.getItem(key);
    if (existing) {
      setParticipantId(existing);
      return;
    }
    let cancelled = false;
    joinCardRoom(roomId, { profile }, guestId)
      .then((joined) => {
        if (cancelled) return;
        sessionStorage.setItem(key, joined.participant.id);
        setParticipantId(joined.participant.id);
      })
      .catch((error) => {
        if (!cancelled)
          setJoinError(
            error instanceof Error
              ? error.message
              : "카드방에 입장하지 못했습니다."
          );
      });
    return () => {
      cancelled = true;
    };
  }, [guestId, profile, profileLoaded, roomId]);

  const state = room.state;
  const myParticipant =
    state?.participants.find(
      (participant) => participant.id === participantId
    ) ?? null;
  const currentCard = state?.cards[state.currentCardIndex] ?? null;
  const isChecker = myParticipant?.role === CARD_ROOM_ROLE.CHECKER;
  const isMemorizer = myParticipant?.role === CARD_ROOM_ROLE.MEMORIZER;
  const shouldShowBack =
    state?.status === CARD_ROOM_STATUS.GIVEN_UP ||
    state?.status === CARD_ROOM_STATUS.REVEALED ||
    state?.status === CARD_ROOM_STATUS.PASSED;
  const canMoveNext =
    state?.status === CARD_ROOM_STATUS.PASSED ||
    state?.status === CARD_ROOM_STATUS.GIVEN_UP ||
    state?.status === CARD_ROOM_STATUS.REVEALED;
  const resultSummary = useMemo(
    () => ({
      ok:
        state?.results.filter(
          (r) =>
            r.result === CARD_ROOM_RESULT.OK ||
            r.result === CARD_ROOM_RESULT.HINTED_OK
        ).length ?? 0,
      giveUp:
        state?.results.filter((r) => r.result === CARD_ROOM_RESULT.GIVE_UP)
          .length ?? 0,
    }),
    [state?.results]
  );

  function submitChat() {
    const text = chatDraft.trim();
    if (!text) return;
    room.sendChat(text);
    setChatDraft("");
  }

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <CommonProductHeader activeService="card" />
      <main className="px-4 py-5 md:px-8 md:py-6">
        <header className="rounded-3xl border border-[#e5e5e5] bg-white p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-[12px] font-bold text-[#666]">
                  #{roomId}
                </span>
                <span className="rounded-full border border-[#d9ead3] bg-[#eef8ea] px-3 py-1 text-[12px] font-bold text-[#2f7d32]">
                  {state ? STATUS_LABELS[state.status] : room.connectionState}
                </span>
              </div>
              <h1 className="mt-3 text-[24px] font-black tracking-[-0.04em] md:text-[30px]">
                {state?.title ?? "카드방 입장 중"}
              </h1>
              <p className="mt-2 text-[14px] font-medium text-[#666]">
                {state
                  ? `${state.deckTitle} · ${Math.min(state.currentCardIndex + 1, state.cards.length)} / ${state.cards.length} · 현재 역할 ${myParticipant ? ROLE_LABELS[myParticipant.role] : "입장 중"}`
                  : "Spring 카드방 상태를 불러오는 중입니다."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {myParticipant ? (
                <div className="inline-flex rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-1">
                  {(
                    [CARD_ROOM_ROLE.MEMORIZER, CARD_ROOM_ROLE.CHECKER] as const
                  ).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => room.sendRole(role)}
                      data-active={myParticipant.role === role}
                      className="rounded-lg px-3 py-2 text-[12px] font-bold text-[#666] data-[active=true]:bg-[#111] data-[active=true]:text-white"
                    >
                      {ROLE_LABELS[role]}
                    </button>
                  ))}
                </div>
              ) : null}
              <Link
                href="/card-service/rooms"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#e5e5e5] px-4 text-[13px] font-bold text-[#666] no-underline transition-colors hover:border-[#111] hover:text-[#111]"
              >
                로비로
              </Link>
            </div>
          </div>
        </header>

        {joinError || room.error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">
            {joinError ?? room.error}
          </p>
        ) : null}

        <section className="mt-4 grid gap-4 lg:grid-cols-[35fr_65fr]">
          <section className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-3 md:p-4">
            <div className="mb-3 flex rounded-xl border border-[#e5e5e5] bg-white p-1 lg:hidden">
              {(["card", "chat"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMobileTab(tab)}
                  data-active={mobileTab === tab}
                  className="flex-1 rounded-lg px-3 py-2 text-[13px] font-bold text-[#666] data-[active=true]:bg-[#111] data-[active=true]:text-white"
                >
                  {tab === "card" ? "카드" : "채팅"}
                </button>
              ))}
            </div>
            <div
              className={`${mobileTab === "chat" ? "hidden lg:block" : "block"}`}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-[#e5e5e5] bg-white p-4">
                  <h2 className="text-[14px] font-bold text-[#111]">
                    실제 참가자
                  </h2>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {state?.participants.map((participant) => {
                      const character = findCharacter(participant.characterId);
                      return (
                        <div
                          key={participant.id}
                          className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-3 text-center data-[me=true]:border-[#111]"
                          data-me={participant.id === participantId}
                        >
                          <div className="mx-auto flex h-[92px] items-end justify-center overflow-hidden rounded-xl bg-white">
                            <CharacterSprite
                              character={character}
                              maxHeight={86}
                              sequenceOverride={frameOverrides[character.id]}
                            />
                          </div>
                          <p className="mt-2 truncate text-[13px] font-bold">
                            {participant.nickname}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#777]">
                            {ROLE_LABELS[participant.role]}
                          </p>
                        </div>
                      );
                    }) ?? <p className="text-[13px] text-[#777]">입장 중...</p>}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#e5e5e5] bg-white p-4">
                  {state?.status === CARD_ROOM_STATUS.FINISHED ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                      <h2 className="text-[28px] font-black tracking-[-0.05em]">
                        학습 완료
                      </h2>
                      <p className="mt-3 text-[15px] font-semibold text-[#666]">
                        OK {resultSummary.ok}개 · 포기 {resultSummary.giveUp}개
                      </p>
                    </div>
                  ) : currentCard ? (
                    <>
                      <button
                        type="button"
                        disabled={!isChecker}
                        onClick={room.sendReveal}
                        aria-live="polite"
                        className="flex min-h-[250px] w-full flex-col items-center justify-center rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-5 text-center disabled:cursor-not-allowed"
                      >
                        <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#999]">
                          {shouldShowBack ? "Back" : "Front"}
                        </span>
                        <span className="mt-5 text-[26px] font-black tracking-[-0.04em] text-[#111]">
                          {shouldShowBack
                            ? currentCard.backText
                            : currentCard.frontText}
                        </span>
                        <span className="mt-5 text-[12px] font-semibold text-[#777]">
                          {isChecker
                            ? "클릭해서 정답 공개"
                            : "외우는 사람은 앞면만 보고 답변합니다."}
                        </span>
                      </button>
                      <div className="mt-4 grid gap-3">
                        {state?.status === CARD_ROOM_STATUS.ANSWERING ||
                        state?.status === CARD_ROOM_STATUS.WAITING ||
                        state?.status === CARD_ROOM_STATUS.REVEALED ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <button
                              type="button"
                              disabled={!isChecker || !currentCard}
                              onClick={() =>
                                currentCard &&
                                room.sendResult(
                                  currentCard.id,
                                  CARD_ROOM_RESULT.OK
                                )
                              }
                              className="h-12 rounded-xl bg-[#111] text-[14px] font-bold text-white transition-colors hover:bg-[#333] disabled:border disabled:border-[#e5e5e5] disabled:bg-[#f5f5f5] disabled:text-[#aaa]"
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              disabled={!isMemorizer || !currentCard}
                              onClick={() =>
                                currentCard &&
                                room.sendResult(
                                  currentCard.id,
                                  CARD_ROOM_RESULT.GIVE_UP
                                )
                              }
                              className="h-12 rounded-xl border border-[#e5e5e5] bg-white text-[14px] font-bold text-[#666] transition-colors hover:border-[#111] hover:text-[#111] disabled:text-[#ccc]"
                            >
                              포기
                            </button>
                          </div>
                        ) : null}
                        {canMoveNext ? (
                          <button
                            type="button"
                            onClick={room.sendNext}
                            className="h-12 rounded-xl bg-[#111] text-[14px] font-bold text-white transition-colors hover:bg-[#333]"
                          >
                            {state.currentCardIndex >= state.cards.length - 1
                              ? "결과 보기"
                              : "다음 카드"}
                          </button>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <div className="flex min-h-[280px] items-center justify-center text-[14px] font-bold text-[#777]">
                      카드방 상태를 기다리는 중...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section
            className={`${mobileTab === "card" ? "hidden lg:flex" : "flex"} min-h-[560px] flex-col rounded-3xl border border-[#e5e5e5] bg-white`}
          >
            <div className="border-b border-[#e5e5e5] p-4">
              <h2 className="text-[16px] font-bold text-[#111]">답변 채팅</h2>
              <p className="mt-1 text-[13px] text-[#777]">
                메시지는 race-server를 통해 브로드캐스트되고 Spring 카드방
                메시지로 저장됩니다.
              </p>
            </div>
            <div
              className="flex-1 space-y-3 overflow-y-auto p-4"
              aria-live="polite"
            >
              {state?.messages.map((message) => {
                const mine = message.senderParticipantId === participantId;
                return (
                  <div
                    key={message.id}
                    className={`rounded-2xl px-4 py-3 ${mine ? "ml-auto max-w-[78%] bg-[#111] text-white" : message.messageType === "system" ? "mx-auto max-w-[88%] border border-[#e5e5e5] bg-[#fafafa] text-center text-[#666]" : "mr-auto max-w-[78%] border border-[#e5e5e5] bg-white text-[#111]"}`}
                  >
                    <p className="text-[11px] font-bold opacity-70">
                      {message.senderNickname ?? "시스템"}
                    </p>
                    <p className="mt-1 text-[14px] leading-[1.6]">
                      {message.content}
                    </p>
                  </div>
                );
              })}
            </div>
            <form
              className="flex gap-2 border-t border-[#e5e5e5] p-4"
              onSubmit={(event) => {
                event.preventDefault();
                submitChat();
              }}
            >
              <input
                value={chatDraft}
                onChange={(event) => setChatDraft(event.target.value)}
                placeholder="답변을 입력하세요"
                className="h-12 min-w-0 flex-1 rounded-xl border border-[#d9d9d9] px-4 text-[14px] outline-none focus:border-[#111]"
              />
              <button
                type="submit"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#111] text-white transition-colors hover:bg-[#333]"
                aria-label="채팅 보내기"
              >
                <Send size={18} />
              </button>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}
