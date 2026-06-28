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
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[12px] font-medium leading-[1.5] text-[#888]"
        >
          방에서 다른 참가자에게 보일 이름이에요.
        </YeonText>
      </YeonLabel>
      {form.showNoDeckGuide ? (
        // 막다른 길 방지(#27): 덱이 없으면 비활성 셀렉트 대신 덱 생성 동선을 안내한다.
        <YeonView className="grid gap-2 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[14px] font-bold text-[#111]"
          >
            아직 사용할 덱이 없어요
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[13px] leading-[1.6] text-[#666]"
          >
            카드방은 덱의 카드를 스냅샷으로 사용합니다. 먼저 덱을 만들고 카드를
            추가한 뒤 다시 와 주세요.
          </YeonText>
          <YeonButton
            type="button"
            onClick={form.goToDecks}
            variant="primary"
            size="lg"
            className="mt-1 w-fit"
          >
            덱 만들고 카드 추가하기
          </YeonButton>
        </YeonView>
      ) : (
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
      )}
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
      variant="unstyled"
      tone="inherit"
      role="alert"
      className="mt-5 rounded-xl border border-[#e0376b] bg-[#fdeaf1] px-4 py-3 text-[13px] font-semibold leading-5 text-[#c01f54]"
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
    // 모달이 길어도 주 CTA가 항상 보이도록 하단 고정 바(#25). 보조 액션은 약하게(#26).
    <YeonView className="sticky bottom-0 z-10 -mx-6 -mb-6 mt-8 flex flex-col gap-2 border-t border-[#eee] bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
      <YeonView className="flex gap-2">
        <YeonButton
          type="button"
          onClick={form.goToDecks}
          disabled={form.isSubmitting}
          variant="secondary"
          size="md"
        >
          내 덱 보기
        </YeonButton>
        <YeonButton
          type="button"
          onClick={onCancel ?? form.goToLobby}
          disabled={form.isSubmitting}
          variant="secondary"
          size="md"
        >
          로비로 돌아가기
        </YeonButton>
      </YeonView>
      <YeonButton
        type="submit"
        disabled={
          form.isSubmitting || !form.profileLoaded || !form.selectedDeck
        }
        variant="primary"
        size="lg"
        className="sm:min-w-[200px]"
      >
        {form.isSubmitting ? "생성 중..." : submitLabel}
      </YeonButton>
    </YeonView>
  );
}
