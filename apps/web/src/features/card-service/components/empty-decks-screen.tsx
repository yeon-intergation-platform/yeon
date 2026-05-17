import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

interface EmptyDecksScreenProps {
  onCreate: () => void;
}

export function EmptyDecksScreen({ onCreate }: EmptyDecksScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e5e5e5] py-20 text-center">
      <h3 className={CARD_SERVICE_COMMON_CLASS.panelBodyTitle}>
        아직 덱이 없습니다
      </h3>
      <p className={`mt-2 ${SHARED_FEATURE_CLASS.text14Neutral}`}>
        첫 덱을 만들고 학습할 카드를 추가해보세요.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className={`mt-6 ${SHARED_FEATURE_CLASS.primaryActionButtonMd14}`}
      >
        첫 덱 만들기
      </button>
    </div>
  );
}
