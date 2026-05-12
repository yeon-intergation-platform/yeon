"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { CharacterSprite } from "@/features/typing-service/character-sprite";
import { findCharacter } from "@/features/typing-service/characters";
import { useCharacterFrameOverrides } from "@/features/typing-service/use-character-frame-overrides";
import { useTypingProfile } from "@/features/typing-service/use-typing-profile";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";
import { CARD_ROOM_SAMPLE_CARDS } from "./card-room-fixtures";
import {
  CARD_RESULT,
  CARD_ROOM_PHASE,
  CARD_ROOM_PHASE_LABELS,
  CARD_ROOM_ROLE_LABELS,
  PARTICIPANT_ROLE,
  type CardResult,
  type CardRoomPhase,
  type ParticipantRole,
} from "./card-room-model";

type CardRoomScreenProps = {
  roomId: string;
};

type ChatMessage = {
  id: string;
  author: string;
  text: string;
  tone: "me" | "system" | "other";
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "system-1",
    author: "시스템",
    text: "외우는 사람은 앞면만 보고 답을 말합니다.",
    tone: "system",
  },
  {
    id: "checker-1",
    author: "봐주는 사람",
    text: "준비되면 답을 채팅으로 말해줘.",
    tone: "other",
  },
];

function resultLabel(result: CardResult) {
  return result === CARD_RESULT.OK ? "OK" : "GIVE_UP";
}

export function CardRoomScreen({ roomId }: CardRoomScreenProps) {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<ParticipantRole>(PARTICIPANT_ROLE.MEMORIZER);
  const [phase, setPhase] = useState<CardRoomPhase>(CARD_ROOM_PHASE.ANSWERING);
  const [cardIndex, setCardIndex] = useState(0);
  const [results, setResults] = useState<Record<string, CardResult>>({});
  const [checkerBackVisible, setCheckerBackVisible] = useState(false);
  const [mobileTab, setMobileTab] = useState<"card" | "chat">("card");
  const [chatDraft, setChatDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const { profile } = useTypingProfile();
  const { settings } = useTypingSettings();
  const frameOverrides = useCharacterFrameOverrides();
  const character = findCharacter(profile.characterId);
  const checkerCharacter = findCharacter("guga");

  const roomTitle = searchParams.get("title") || "카드방 암기 검증";
  const deckTitle = searchParams.get("deckTitle") || "샘플 암기 덱";
  const currentCard = CARD_ROOM_SAMPLE_CARDS[cardIndex];
  const isChecker = role === PARTICIPANT_ROLE.CHECKER;
  const canShowBack =
    (isChecker && checkerBackVisible) || phase === CARD_ROOM_PHASE.GIVEN_UP;
  const canMoveNext =
    phase === CARD_ROOM_PHASE.PASSED || phase === CARD_ROOM_PHASE.GIVEN_UP;

  const resultSummary = useMemo(() => {
    const values = Object.values(results);
    return {
      ok: values.filter((result) => result === CARD_RESULT.OK).length,
      giveUp: values.filter((result) => result === CARD_RESULT.GIVE_UP).length,
    };
  }, [results]);

  const appendSystemMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `system-${prev.length + 1}`,
        author: "시스템",
        text,
        tone: "system",
      },
    ]);
  };

  const applyResult = (result: CardResult) => {
    if (!currentCard) return;
    setResults((prev) => ({ ...prev, [currentCard.id]: result }));
    setPhase(
      result === CARD_RESULT.OK
        ? CARD_ROOM_PHASE.PASSED
        : CARD_ROOM_PHASE.GIVEN_UP
    );
    appendSystemMessage(`${cardIndex + 1}번 카드 결과: ${resultLabel(result)}`);
  };

  const moveNext = () => {
    if (cardIndex >= CARD_ROOM_SAMPLE_CARDS.length - 1) {
      setPhase(CARD_ROOM_PHASE.FINISHED);
      appendSystemMessage("모든 카드 확인이 끝났습니다.");
      return;
    }
    setCardIndex((prev) => prev + 1);
    setPhase(CARD_ROOM_PHASE.ANSWERING);
    setCheckerBackVisible(false);
    setMobileTab("card");
  };

  const submitChat = () => {
    const text = chatDraft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `me-${prev.length + 1}`,
        author: profile.nickname,
        text,
        tone: "me",
      },
    ]);
    setChatDraft("");
  };

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
                  {CARD_ROOM_PHASE_LABELS[phase]}
                </span>
              </div>
              <h1 className="mt-3 text-[24px] font-black tracking-[-0.04em] md:text-[30px]">
                {roomTitle}
              </h1>
              <p className="mt-2 text-[14px] font-medium text-[#666]">
                {deckTitle} · {cardIndex + 1} / {CARD_ROOM_SAMPLE_CARDS.length}{" "}
                · 현재 역할 {CARD_ROOM_ROLE_LABELS[role]}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-1">
                {(
                  [
                    PARTICIPANT_ROLE.MEMORIZER,
                    PARTICIPANT_ROLE.CHECKER,
                  ] as const
                ).map((nextRole) => (
                  <button
                    key={nextRole}
                    type="button"
                    onClick={() => {
                      setRole(nextRole);
                      setCheckerBackVisible(false);
                    }}
                    data-active={role === nextRole}
                    className="rounded-lg px-3 py-2 text-[12px] font-bold text-[#666] data-[active=true]:bg-[#111] data-[active=true]:text-white"
                  >
                    {CARD_ROOM_ROLE_LABELS[nextRole]}
                  </button>
                ))}
              </div>
              <Link
                href="/card-service/rooms"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#e5e5e5] px-4 text-[13px] font-bold text-[#666] no-underline transition-colors hover:border-[#111] hover:text-[#111]"
              >
                로비로
              </Link>
            </div>
          </div>
        </header>

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
                    참여자 캐릭터
                  </h2>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-[#111] bg-[#fafafa] p-3 text-center">
                      <div className="mx-auto flex h-[92px] items-end justify-center overflow-hidden rounded-xl bg-white">
                        <CharacterSprite
                          character={character}
                          maxHeight={86}
                          sequenceOverride={frameOverrides[character.id]}
                        />
                      </div>
                      <p className="mt-2 truncate text-[13px] font-bold">
                        {profile.nickname}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#777]">
                        {character.label[settings.locale]}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-3 text-center">
                      <div className="mx-auto flex h-[92px] items-end justify-center overflow-hidden rounded-xl bg-white">
                        <CharacterSprite
                          character={checkerCharacter}
                          maxHeight={86}
                          sequenceOverride={frameOverrides[checkerCharacter.id]}
                        />
                      </div>
                      <p className="mt-2 truncate text-[13px] font-bold">
                        봐주는 사람
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#777]">
                        {checkerCharacter.label[settings.locale]}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e5e5e5] bg-white p-4">
                  {phase === CARD_ROOM_PHASE.FINISHED ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                      <h2 className="text-[28px] font-black tracking-[-0.05em]">
                        학습 완료
                      </h2>
                      <p className="mt-3 text-[15px] font-semibold text-[#666]">
                        OK {resultSummary.ok}개 · 포기 {resultSummary.giveUp}개
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCardIndex(0);
                          setResults({});
                          setPhase(CARD_ROOM_PHASE.ANSWERING);
                          setCheckerBackVisible(false);
                        }}
                        className="mt-6 rounded-xl bg-[#111] px-5 py-3 text-[14px] font-bold text-white"
                      >
                        다시 확인하기
                      </button>
                    </div>
                  ) : currentCard ? (
                    <>
                      <button
                        type="button"
                        disabled={
                          !isChecker || phase !== CARD_ROOM_PHASE.ANSWERING
                        }
                        onClick={() => setCheckerBackVisible((prev) => !prev)}
                        className="flex min-h-[250px] w-full flex-col items-center justify-center rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-5 text-center disabled:cursor-not-allowed"
                      >
                        <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#999]">
                          {canShowBack ? "Back" : "Front"}
                        </span>
                        <span className="mt-5 text-[26px] font-black tracking-[-0.04em] text-[#111]">
                          {canShowBack ? currentCard.back : currentCard.front}
                        </span>
                        {isChecker && phase === CARD_ROOM_PHASE.ANSWERING ? (
                          <span className="mt-5 text-[12px] font-semibold text-[#777]">
                            클릭해서 뒷면 {checkerBackVisible ? "닫기" : "확인"}
                          </span>
                        ) : null}
                      </button>

                      <div className="mt-4 grid gap-3">
                        {phase === CARD_ROOM_PHASE.ANSWERING ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <button
                              type="button"
                              disabled={!isChecker}
                              onClick={() => applyResult(CARD_RESULT.OK)}
                              className="h-12 rounded-xl bg-[#111] text-[14px] font-bold text-white transition-colors hover:bg-[#333] disabled:border disabled:border-[#e5e5e5] disabled:bg-[#f5f5f5] disabled:text-[#aaa]"
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              onClick={() => applyResult(CARD_RESULT.GIVE_UP)}
                              className="h-12 rounded-xl border border-[#e5e5e5] bg-white text-[14px] font-bold text-[#666] transition-colors hover:border-[#111] hover:text-[#111]"
                            >
                              포기
                            </button>
                          </div>
                        ) : null}
                        {canMoveNext ? (
                          <button
                            type="button"
                            onClick={moveNext}
                            className="h-12 rounded-xl bg-[#111] text-[14px] font-bold text-white transition-colors hover:bg-[#333]"
                          >
                            {cardIndex >= CARD_ROOM_SAMPLE_CARDS.length - 1
                              ? "결과 보기"
                              : "다음 카드"}
                          </button>
                        ) : null}
                      </div>
                    </>
                  ) : null}
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
                실시간 연동 전 화면 골격입니다. 메시지는 현재 브라우저 상태에만
                남습니다.
              </p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-2xl px-4 py-3 ${
                    message.tone === "me"
                      ? "ml-auto max-w-[78%] bg-[#111] text-white"
                      : message.tone === "system"
                        ? "mx-auto max-w-[88%] border border-[#e5e5e5] bg-[#fafafa] text-center text-[#666]"
                        : "mr-auto max-w-[78%] border border-[#e5e5e5] bg-white text-[#111]"
                  }`}
                >
                  <p className="text-[11px] font-bold opacity-70">
                    {message.author}
                  </p>
                  <p className="mt-1 text-[14px] leading-[1.6]">
                    {message.text}
                  </p>
                </div>
              ))}
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
