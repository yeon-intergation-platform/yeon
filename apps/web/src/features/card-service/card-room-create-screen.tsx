"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { CARD_SERVICE_COMMON_CLASS } from "./card-service-common.const";
import { useEffect, useMemo, useState } from "react";
import { useYeonRouter } from "@yeon/ui/runtime/YeonNavigation";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import { writeYeonSessionStorageItem } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import {
  YeonButton,
  YeonField,
  YeonSurface,
  YeonText,
  YeonLabel,
  YeonView,
  YeonOption,
} from "@yeon/ui";
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
  const router = useYeonRouter();
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
        writeYeonSessionStorageItem(
          `yeon-card-room-participant:${created.room.id}`,
          created.participant.id
        );
      if (onCreated) {
        onCreated(created.room.id);
      } else {
        router.push(
          resolveYeonWebPath("cardRoomDetail", { roomId: created.room.id })
        );
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
    <YeonSurface
      as="form"
      variant="outlined"
      className="rounded-[28px] p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <YeonSurface variant="panel" className="p-4">
        <YeonText variant="label" tone="secondary">
          카드방 프로필
        </YeonText>
        <YeonView className="mt-4 flex items-center gap-4">
          <YeonView className="flex h-[76px] w-[76px] items-end justify-center overflow-hidden rounded-xl bg-white">
            {profileLoaded ? (
              <CharacterSprite
                character={character}
                maxHeight={72}
                sequenceOverride={frameOverrides[character.id]}
              />
            ) : null}
          </YeonView>
          <YeonView>
            <YeonText as="p" variant="label" className="text-[17px]">
              {profileLoaded ? profile.nickname : "프로필 불러오는 중"}
            </YeonText>
            <YeonText
              as="p"
              variant="caption"
              tone="secondary"
              className={`mt-1 ${SHARED_FEATURE_CLASS.text13EmphasisSubtle}`}
            >
              {profileLoaded
                ? character.label[settings.locale]
                : "잠시만 기다려주세요"}
            </YeonText>
          </YeonView>
        </YeonView>
      </YeonSurface>

      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className={`mt-6 ${CARD_SERVICE_COMMON_CLASS.panelTitleStrong}`}
      >
        실제 방 설정
      </YeonText>
      <YeonView className="mt-6 grid gap-5">
        <YeonLabel className={CARD_SERVICE_COMMON_CLASS.panelFieldLabel}>
          방 제목
          <YeonField
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            disabled={isSubmitting}
            className="min-h-[52px]"
          />
        </YeonLabel>
        <YeonLabel className={CARD_SERVICE_COMMON_CLASS.panelFieldLabel}>
          닉네임
          <YeonField
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={40}
            disabled={isSubmitting}
            className="min-h-[52px]"
          />
        </YeonLabel>
        <YeonLabel className={CARD_SERVICE_COMMON_CLASS.panelFieldLabel}>
          사용할 덱
          <YeonField
            as="select"
            value={selectedDeck?.id ?? ""}
            onChange={(event) => setSelectedDeckId(event.target.value)}
            disabled={isSubmitting}
            className="min-h-[52px]"
          >
            <YeonOption value="" disabled>
              {decksQuery.isLoading ? "덱 불러오는 중" : "덱 선택"}
            </YeonOption>
            {decks.map((deck) => (
              <YeonOption key={deck.id} value={deck.id}>
                {deck.title} · {deck.itemCount}장
              </YeonOption>
            ))}
          </YeonField>
        </YeonLabel>
        <YeonView as="fieldset" className="grid gap-2">
          <YeonText
            as="legend"
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text13EmphasisMuted}
          >
            공개 여부
          </YeonText>
          <YeonView className="grid gap-3 sm:grid-cols-2">
            {(["public", "private"] as const).map((option) => (
              <YeonButton
                key={option}
                type="button"
                onClick={() => setVisibility(option)}
                disabled={isSubmitting}
                variant={visibility === option ? "primary" : "secondary"}
                size="lg"
                className="h-auto flex-col items-start rounded-2xl px-4 py-4 text-left"
              >
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="block text-[15px] font-bold"
                >
                  {option === "public" ? "공개방" : "비공개방"}
                </YeonText>
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="mt-1 block text-[12px] leading-[1.5] opacity-70"
                >
                  {option === "public" ? "로비에 표시" : "초대 링크로 입장"}
                </YeonText>
              </YeonButton>
            ))}
          </YeonView>
        </YeonView>
      </YeonView>
      {errorMessage ? (
        <YeonText
          as="p"
          variant="label"
          tone="primary"
          className="mt-5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3"
        >
          {errorMessage}
        </YeonText>
      ) : null}
      <YeonView className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <YeonButton
          type="button"
          onClick={() => router.push("/card-service/decks")}
          disabled={isSubmitting}
          variant="secondary"
          size="lg"
        >
          내 덱 보기
        </YeonButton>
        <YeonButton
          type="button"
          onClick={
            onCancel ?? (() => router.push(resolveYeonWebPath("cardRoomList")))
          }
          disabled={isSubmitting}
          variant="secondary"
          size="lg"
        >
          로비로 돌아가기
        </YeonButton>
        <YeonButton
          type="submit"
          disabled={isSubmitting || !profileLoaded || !selectedDeck}
          variant="primary"
          size="lg"
        >
          {isSubmitting ? "생성 중..." : submitLabel}
        </YeonButton>
      </YeonView>
    </YeonSurface>
  );
}

export function CardRoomCreateScreen() {
  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="card" />
      <YeonView
        as="main"
        className="mx-auto grid max-w-[760px] gap-8 px-6 py-10 md:px-10"
      >
        <YeonView as="section">
          <YeonText
            as="h1"
            variant="unstyled"
            tone="inherit"
            className="text-[28px] font-black tracking-[-0.04em] text-[#111]"
          >
            카드방 만들기
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`mt-3 ${SHARED_FEATURE_CLASS.text14Neutral} leading-[1.7]`}
          >
            방을 만들면 현재 덱 내용이 카드방 학습 스냅샷으로 고정됩니다. 이후
            덱을 수정해도 이 방의 카드는 바뀌지 않습니다.
          </YeonText>
        </YeonView>
        <CardRoomCreateForm />
      </YeonView>
    </YeonView>
  );
}
