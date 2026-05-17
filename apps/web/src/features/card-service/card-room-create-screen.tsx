"use client";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { CARD_SERVICE_COMMON_CLASS } from "./card-service-common.const";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { CharacterSprite } from "@/features/typing-service/character-sprite";
import { findCharacter } from "@/features/typing-service/characters";
import { useCharacterFrameOverrides } from "@/features/typing-service/use-character-frame-overrides";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";
import { getGuestDeckDetail } from "@/lib/guest-card-service-store";
import { useIsAuthenticated } from "./auth-context";
import { createCardRoom, useCardRoomProfile, useDeckList } from "./hooks";

type CardRoomCreateFormProps = {
  onCancel?: () => void;
  onCreated?: (roomId: string) => void;
  submitLabel?: string;
};

export function CardRoomCreateForm({
  onCancel,
  onCreated,
  submitLabel = "실제 카드방 만들기",
}: CardRoomCreateFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("서로 확인하는 카드방");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    profile,
    guestId,
    loaded: profileLoaded,
    setProfile,
  } = useCardRoomProfile();
  const [nickname, setNickname] = useState(profile.nickname);
  const isAuthenticated = useIsAuthenticated();
  const decksQuery = useDeckList();
  const decks = decksQuery.data ?? [];
  const { settings } = useTypingSettings();
  const frameOverrides = useCharacterFrameOverrides();
  const character = findCharacter(profile.characterId);

  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.id === selectedDeckId) ?? decks[0],
    [decks, selectedDeckId]
  );

  useEffect(() => {
    if (profileLoaded) setNickname(profile.nickname);
  }, [profile.nickname, profileLoaded]);

  async function submit() {
    if (isSubmitting) return;
    if (!profileLoaded) {
      setErrorMessage("카드방 프로필을 불러오는 중입니다.");
      return;
    }
    if (!selectedDeck) {
      setErrorMessage("카드가 있는 덱을 먼저 만들어 주세요.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    const nextProfile = {
      nickname: nickname.trim() || "Guest",
      characterId: profile.characterId,
    };
    setProfile(nextProfile);
    try {
      const payload = isAuthenticated
        ? {
            title: title.trim() || "카드방",
            visibility,
            deckId: selectedDeck.id,
            profile: nextProfile,
          }
        : await (async () => {
            const detail = await getGuestDeckDetail(selectedDeck.id);
            if (!detail || detail.items.length === 0)
              throw new Error("카드가 있는 게스트 덱이 필요합니다.");
            return {
              title: title.trim() || "카드방",
              visibility,
              guestDeck: {
                title: detail.deck.title,
                items: detail.items.map((item) => ({
                  frontText: item.frontText,
                  backText: item.backText,
                })),
              },
              profile: nextProfile,
            };
          })();
      const created = await createCardRoom(payload, guestId);
      if (created.participant)
        sessionStorage.setItem(
          `yeon-card-room-participant:${created.room.id}`,
          created.participant.id
        );
      if (onCreated) {
        onCreated(created.room.id);
      } else {
        router.push(`/card-service/rooms/${created.room.id}`);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "카드방을 만들지 못했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-[28px] border border-[#e5e5e5] bg-white p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4">
        <p className={SHARED_FEATURE_CLASS.text13MediumSecondary}>
          카드방 프로필
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-[76px] w-[76px] items-end justify-center overflow-hidden rounded-xl bg-white">
            {profileLoaded ? (
              <CharacterSprite
                character={character}
                maxHeight={72}
                sequenceOverride={frameOverrides[character.id]}
              />
            ) : null}
          </div>
          <div>
            <p className="text-[17px] font-bold text-[#111]">
              {profileLoaded ? profile.nickname : "프로필 불러오는 중"}
            </p>
            <p className={`mt-1 ${SHARED_FEATURE_CLASS.text13EmphasisSubtle}`}>
              {profileLoaded
                ? character.label[settings.locale]
                : "잠시만 기다려주세요"}
            </p>
          </div>
        </div>
      </div>

      <h2 className={`mt-6 ${CARD_SERVICE_COMMON_CLASS.panelTitleStrong}`}>
        실제 방 설정
      </h2>
      <div className="mt-6 grid gap-5">
        <label className={CARD_SERVICE_COMMON_CLASS.panelFieldLabel}>
          방 제목
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            disabled={isSubmitting}
            className={CARD_SERVICE_COMMON_CLASS.formControlLarge}
          />
        </label>
        <label className={CARD_SERVICE_COMMON_CLASS.panelFieldLabel}>
          닉네임
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={40}
            disabled={isSubmitting}
            className={CARD_SERVICE_COMMON_CLASS.formControlLarge}
          />
        </label>
        <label className={CARD_SERVICE_COMMON_CLASS.panelFieldLabel}>
          사용할 덱
          <select
            value={selectedDeck?.id ?? ""}
            onChange={(event) => setSelectedDeckId(event.target.value)}
            disabled={isSubmitting}
            className={CARD_SERVICE_COMMON_CLASS.formControlLarge}
          >
            <option value="" disabled>
              {decksQuery.isLoading ? "덱 불러오는 중" : "덱 선택"}
            </option>
            {decks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.title} · {deck.itemCount}장
              </option>
            ))}
          </select>
        </label>
        <fieldset className="grid gap-2">
          <legend className={SHARED_FEATURE_CLASS.text13EmphasisMuted}>
            공개 여부
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["public", "private"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setVisibility(option)}
                data-active={visibility === option}
                disabled={isSubmitting}
                className="rounded-2xl border border-[#e5e5e5] bg-white px-4 py-4 text-left transition-colors hover:border-[#111] disabled:cursor-not-allowed disabled:opacity-60 data-[active=true]:border-[#111] data-[active=true]:bg-[#111] data-[active=true]:text-white"
              >
                <span className="block text-[15px] font-bold">
                  {option === "public" ? "공개방" : "비공개방"}
                </span>
                <span className="mt-1 block text-[12px] leading-[1.5] opacity-70">
                  {option === "public" ? "로비에 표시" : "초대 링크로 입장"}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      {errorMessage ? (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/card-service/decks")}
          disabled={isSubmitting}
          className={CARD_SERVICE_COMMON_CLASS.buttonSecondaryDark}
        >
          내 덱 보기
        </button>
        <button
          type="button"
          onClick={onCancel ?? (() => router.push("/card-service/rooms"))}
          disabled={isSubmitting}
          className={CARD_SERVICE_COMMON_CLASS.buttonSecondaryDark}
        >
          로비로 돌아가기
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !profileLoaded || !selectedDeck}
          className={CARD_SERVICE_COMMON_CLASS.buttonPrimarySubmit}
        >
          {isSubmitting ? "생성 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function CardRoomCreateScreen() {
  return (
    <div className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="card" />
      <main className="mx-auto grid max-w-[760px] gap-8 px-6 py-10 md:px-10">
        <section>
          <h1 className="text-[28px] font-black tracking-[-0.04em] text-[#111]">
            카드방 만들기
          </h1>
          <p
            className={`mt-3 ${SHARED_FEATURE_CLASS.text14Neutral} leading-[1.7]`}
          >
            방을 만들면 현재 덱 내용이 카드방 학습 스냅샷으로 고정됩니다. 이후
            덱을 수정해도 이 방의 카드는 바뀌지 않습니다.
          </p>
        </section>
        <CardRoomCreateForm />
      </main>
    </div>
  );
}
