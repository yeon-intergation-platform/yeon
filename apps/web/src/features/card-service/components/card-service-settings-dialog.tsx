"use client";
import { useEffect, useState } from "react";
import {
  YeonButton,
  YeonCheckbox,
  YeonLabel,
  YeonModal,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import { SHARED_FEATURE_CLASS } from "../../shared-style-constants";
import {
  setBulkCardHelpVisible,
  shouldShowBulkCardHelp,
} from "../utils/bulk-card-help-preference";

interface CardServiceSettingsDialogProps {
  onClose: () => void;
}

export function CardServiceSettingsDialog({
  onClose,
}: CardServiceSettingsDialogProps) {
  const [isBulkHelpVisible, setBulkHelpVisibleState] = useState(true);

  useEffect(() => {
    setBulkHelpVisibleState(shouldShowBulkCardHelp());
  }, []);

  function handleToggle(value: boolean) {
    setBulkHelpVisibleState(value);
    setBulkCardHelpVisible(value);
  }

  return (
    <YeonModal
      visible
      aria-label="카드 설정"
      className={SHARED_FEATURE_CLASS.modalOverlay}
      onClick={onClose}
      onRequestClose={onClose}
    >
      <YeonView
        className={SHARED_FEATURE_CLASS.modalCard}
        onClick={(event) => event.stopPropagation()}
      >
        <YeonText
          as="h2"
          variant="unstyled"
          tone="inherit"
          className={CARD_SERVICE_COMMON_CLASS.panelBodyTitle}
        >
          카드 설정
        </YeonText>
        <YeonLabel className="mt-5 flex items-start gap-3 rounded-xl border border-[#e5e5e5] p-4">
          <YeonCheckbox
            checked={isBulkHelpVisible}
            className="mt-1"
            onChange={(event) => handleToggle(event.target.checked)}
          />
          <YeonText as="span" variant="unstyled" tone="inherit">
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={`block ${CARD_SERVICE_COMMON_CLASS.panelTextEmphasis}`}
            >
              AI 형식 붙여넣기 도움말 카드 보기
            </YeonText>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={`${SHARED_FEATURE_CLASS.text13Neutral} mt-1 block leading-5`}
            >
              X 버튼으로 숨긴 도움말을 다시 보이게 합니다.
            </YeonText>
          </YeonText>
        </YeonLabel>
        <YeonView className="mt-5 flex justify-end">
          <YeonButton
            onClick={onClose}
            type="button"
            variant="primary"
            size="md"
          >
            닫기
          </YeonButton>
        </YeonView>
      </YeonView>
    </YeonModal>
  );
}
