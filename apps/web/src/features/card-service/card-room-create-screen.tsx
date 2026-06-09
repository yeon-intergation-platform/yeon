"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { CARD_SERVICE_COMMON_CLASS } from "./card-service-common.const";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { YeonSurface, YeonText, YeonView } from "@yeon/ui";
import { useCardRoomCreateFormState } from "./use-card-room-create-form-state";
import {
  CardRoomCreateActions,
  CardRoomCreateErrorMessage,
  CardRoomCreateProfilePanel,
  CardRoomCreateSettingsFields,
} from "./card-room-create-form-parts";

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
      <CardRoomCreateProfilePanel form={form} />
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className={`mt-6 ${CARD_SERVICE_COMMON_CLASS.panelTitleStrong}`}
      >
        실제 방 설정
      </YeonText>
      <CardRoomCreateSettingsFields form={form} />
      <CardRoomCreateErrorMessage form={form} />
      <CardRoomCreateActions
        form={form}
        onCancel={onCancel}
        submitLabel={submitLabel}
      />
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
