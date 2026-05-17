"use client";

import { useEffect, useState } from "react";

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
    <div
      aria-modal="true"
      className={SHARED_FEATURE_CLASS.modalOverlay}
      onClick={onClose}
      role="dialog"
    >
      <div
        className={SHARED_FEATURE_CLASS.modalCard}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className={CARD_SERVICE_COMMON_CLASS.panelBodyTitle}>카드 설정</h2>
        <label className="mt-5 flex items-start gap-3 rounded-xl border border-[#e5e5e5] p-4">
          <input
            checked={isBulkHelpVisible}
            className="mt-1"
            onChange={(event) => handleToggle(event.target.checked)}
            type="checkbox"
          />
          <span>
            <span
              className={`block ${CARD_SERVICE_COMMON_CLASS.panelTextEmphasis}`}
            >
              AI 형식 붙여넣기 도움말 카드 보기
            </span>
            <span
              className={`${SHARED_FEATURE_CLASS.text13Neutral} mt-1 block leading-5`}
            >
              X 버튼으로 숨긴 도움말을 다시 보이게 합니다.
            </span>
          </span>
        </label>
        <div className="mt-5 flex justify-end">
          <button
            className={SHARED_FEATURE_CLASS.primaryActionButtonMd13}
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
