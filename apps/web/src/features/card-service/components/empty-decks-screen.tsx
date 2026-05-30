import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

interface EmptyDecksScreenProps {
  onCreate: () => void;
}

export function EmptyDecksScreen({ onCreate }: EmptyDecksScreenProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#e5e5e5] px-6 py-10 text-center">
      <h3 className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis15}>
        아직 덱이 없습니다
      </h3>
      <p className={`mt-2 break-keep ${SHARED_FEATURE_CLASS.text14Neutral}`}>
        첫 덱을 만들어 시작해보세요.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className={`mt-5 inline-flex min-h-11 items-center justify-center ${SHARED_FEATURE_CLASS.primaryActionButtonMd14}`}
      >
        첫 덱 만들기
      </button>
    </div>
  );
}
