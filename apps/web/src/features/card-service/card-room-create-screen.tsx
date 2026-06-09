"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { CARD_SERVICE_COMMON_CLASS } from "./card-service-common.const";
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
import { useCardRoomCreateFormState } from "./use-card-room-create-form-state";

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
  const form = useCardRoomCreateFormState({ onCreated });

  return (
    <YeonSurface
      as="form"
      variant="outlined"
      className="rounded-[28px] p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void form.submit();
      }}
    >
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
              {form.profileLoaded
                ? form.profile.nickname
                : "프로필 불러오는 중"}
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
              {form.decksQuery.isLoading ? "덱 불러오는 중" : "덱 선택"}
            </YeonOption>
            {form.decks.map((deck) => (
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
      </YeonView>
      {form.errorMessage ? (
        <YeonText
          as="p"
          variant="label"
          tone="primary"
          className="mt-5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3"
        >
          {form.errorMessage}
        </YeonText>
      ) : null}
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
