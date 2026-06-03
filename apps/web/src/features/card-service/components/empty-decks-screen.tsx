import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { YeonButton, YeonSurface, YeonText } from "@yeon/ui";
interface EmptyDecksScreenProps {
  onCreate: () => void;
}

export function EmptyDecksScreen({ onCreate }: EmptyDecksScreenProps) {
  return (
    <YeonSurface
      variant="empty"
      className="flex min-h-[360px] flex-col items-center justify-center px-6 py-10"
    >
      <YeonText
        as="h3"
        variant="unstyled"
        tone="inherit"
        className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis15}
      >
        아직 덱이 없습니다
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className={`mt-2 break-keep ${SHARED_FEATURE_CLASS.text14Neutral}`}
      >
        첫 덱을 만들어 시작해보세요.
      </YeonText>
      <YeonButton
        type="button"
        variant="primary"
        onClick={onCreate}
        className={`mt-5 min-h-11 ${SHARED_FEATURE_CLASS.primaryActionButtonMd14}`}
      >
        첫 덱 만들기
      </YeonButton>
    </YeonSurface>
  );
}
