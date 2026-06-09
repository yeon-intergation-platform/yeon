"use client";

import type { useCardRoomCreateFormState } from "./use-card-room-create-form-state";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { CARD_SERVICE_COMMON_CLASS } from "./card-service-common.const";
import {
  YeonButton,
  YeonField,
  YeonLabel,
  YeonOption,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { CharacterSprite } from "@/features/typing-service/character-sprite";

type CardRoomCreateFormState = ReturnType<typeof useCardRoomCreateFormState>;

type CardRoomCreateFormPartProps = {
  form: CardRoomCreateFormState;
};

const CARD_ROOM_CREATE_VISIBILITY_OPTIONS = ["public", "private"] as const;

export function CardRoomCreateProfilePanel({
  form,
}: CardRoomCreateFormPartProps) {
  return (
    <YeonSurface variant="panel" className="p-4">
      <YeonText variant="label" tone="secondary">
        카드방 프로필
      </YeonText>
      <YeonView className="mt-4 flex items-center gap-4">
        <YeonView className="flex h-[76px] w-[76px] items-end justify-center overflow-hidden rounded-xl bg-white">
          {form.profileLoaded ? (
            <CharacterSprite
              character={form.character}
              maxHeight={72}
              sequenceOverride={form.frameOverrides[form.character.id]}
            />
          ) : null}
        </YeonView>
        <YeonView>
          <YeonText as="p" variant="label" className="text-[17px]">
            {form.profileLoaded ? form.profile.nickname : "프로필 불러오는 중"}
          </YeonText>
          <YeonText
            as="p"
            variant="caption"
            tone="secondary"
            className={`mt-1 ${SHARED_FEATURE_CLASS.text13EmphasisSubtle}`}
          >
            {form.profileLoaded
              ? form.character.label[form.settings.locale]
              : "잠시만 기다려주세요"}
          </YeonText>
        </YeonView>
      </YeonView>
    </YeonSurface>
  );
}

export function CardRoomCreateSettingsFields({
  form,
}: CardRoomCreateFormPartProps) {
  return (
    <YeonView className="mt-6 grid gap-5">
      <YeonLabel className={CARD_SERVICE_COMMON_CLASS.panelFieldLabel}>
        방 제목
        <YeonField
          value={form.title}
          onChange={(event) => form.setTitle(event.target.value)}
          maxLength={80}
          disabled={form.isSubmitting}
          className="min-h-[52px]"
        />
      </YeonLabel>
      <YeonLabel className={CARD_SERVICE_COMMON_CLASS.panelFieldLabel}>
        닉네임
        <YeonField
          value={form.nickname}
          onChange={(event) => form.setNickname(event.target.value)}
          maxLength={40}
          disabled={form.isSubmitting}
          className="min-h-[52px]"
        />
      </YeonLabel>
      <YeonLabel className={CARD_SERVICE_COMMON_CLASS.panelFieldLabel}>
        사용할 덱
        <YeonField
          as="select"
          value={form.selectedDeck?.id ?? ""}
          onChange={(event) => form.setSelectedDeckId(event.target.value)}
          disabled={form.isSubmitting}
          className="min-h-[52px]"
        >
          <YeonOption value="" disabled>
            {form.deckSelectPlaceholder}
          </YeonOption>
          {form.decks.map((deck) => (
            <YeonOption key={deck.id} value={deck.id}>
              {deck.title} · {deck.itemCount}장
            </YeonOption>
          ))}
        </YeonField>
      </YeonLabel>
      <CardRoomCreateVisibilitySelector form={form} />
    </YeonView>
  );
}

function CardRoomCreateVisibilitySelector({
  form,
}: CardRoomCreateFormPartProps) {
  return (
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
        {CARD_ROOM_CREATE_VISIBILITY_OPTIONS.map((option) => (
          <YeonButton
            key={option}
            type="button"
            onClick={() => form.setVisibility(option)}
            disabled={form.isSubmitting}
            variant={form.visibility === option ? "primary" : "secondary"}
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
  );
}

export function CardRoomCreateErrorMessage({
  form,
}: CardRoomCreateFormPartProps) {
  if (!form.errorMessage) {
    return null;
  }

  return (
    <YeonText
      as="p"
      variant="label"
      tone="primary"
      className="mt-5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3"
    >
      {form.errorMessage}
    </YeonText>
  );
}

type CardRoomCreateActionsProps = CardRoomCreateFormPartProps & {
  onCancel?: () => void;
  submitLabel: string;
};

export function CardRoomCreateActions({
  form,
  onCancel,
  submitLabel,
}: CardRoomCreateActionsProps) {
  return (
    <YeonView className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
      <YeonButton
        type="button"
        onClick={form.goToDecks}
        disabled={form.isSubmitting}
        variant="secondary"
        size="lg"
      >
        내 덱 보기
      </YeonButton>
      <YeonButton
        type="button"
        onClick={onCancel ?? form.goToLobby}
        disabled={form.isSubmitting}
        variant="secondary"
        size="lg"
      >
        로비로 돌아가기
      </YeonButton>
      <YeonButton
        type="submit"
        disabled={
          form.isSubmitting || !form.profileLoaded || !form.selectedDeck
        }
        variant="primary"
        size="lg"
      >
        {form.isSubmitting ? "생성 중..." : submitLabel}
      </YeonButton>
    </YeonView>
  );
}
