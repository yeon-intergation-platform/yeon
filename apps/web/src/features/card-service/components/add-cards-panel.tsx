"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import {
  ADD_CARD_FORM_INITIAL_ACTION_STATE,
  AddCardForm,
  type AddCardFormActionState,
} from "./add-card-form";
import { BulkAddCardsForm } from "./bulk-add-cards-form";
import { ResponsiveModal } from "./responsive-modal";

const MODE_TAB_MOTION = {
  whileHover: { scale: 1.01, y: -1 },
  whileTap: { scale: 0.985, y: 0 },
  transition: { type: "spring", stiffness: 420, damping: 32 },
} as const;

const ADD_CARD_MODES = {
  manual: "manual",
  bulk: "bulk",
} as const;

type AddCardMode = (typeof ADD_CARD_MODES)[keyof typeof ADD_CARD_MODES];

interface AddCardsPanelProps {
  deckId: string;
  onClose: () => void;
}

function isSameActionState(
  left: AddCardFormActionState,
  right: AddCardFormActionState
) {
  return (
    left.canSubmit === right.canSubmit &&
    left.isPending === right.isPending &&
    left.actionLabel === right.actionLabel &&
    left.pendingActionLabel === right.pendingActionLabel &&
    left.errorMessage === right.errorMessage
  );
}

function ManualAddCardFooter({
  formId,
  state,
  onCancel,
}: {
  formId: string;
  state: AddCardFormActionState;
  onCancel: () => void;
}) {
  const isActionPending = state.isPending;
  const buttonLabel = isActionPending
    ? state.pendingActionLabel
    : state.actionLabel;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-h-5 min-w-0">
        {state.errorMessage ? (
          <p className="text-[13px] font-medium leading-5 text-red-600">
            {state.errorMessage}
          </p>
        ) : (
          <p className="text-[12px] leading-5 text-[#888]">
            질문과 답변을 모두 작성하면 저장할 수 있습니다.
          </p>
        )}
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isActionPending}
          className={`${CARD_SERVICE_COMMON_CLASS.panelTextEmphasis} rounded-xl border border-[#e5e5e5] px-4 py-2.5 transition-colors hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50`}
        >
          취소
        </button>
        <button
          type="submit"
          form={formId}
          disabled={!state.canSubmit}
          className="rounded-xl bg-[#111] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

export function AddCardsPanel({ deckId, onClose }: AddCardsPanelProps) {
  const manualFormId = useId();
  const [mode, setMode] = useState<AddCardMode>(ADD_CARD_MODES.manual);
  const [manualDirty, setManualDirty] = useState(false);
  const [bulkDirty, setBulkDirty] = useState(false);
  const [manualActionState, setManualActionState] = useState(
    ADD_CARD_FORM_INITIAL_ACTION_STATE
  );
  const isDirty = manualDirty || bulkDirty;

  const modeDescription = useMemo(
    () =>
      mode === ADD_CARD_MODES.manual
        ? "질문과 답변을 한 화면에서 빠르게 작성합니다."
        : "AI가 만든 카드 묶음을 붙여넣어 여러 장을 한 번에 추가할 수 있습니다.",
    [mode]
  );
  const modalWidthClassName =
    mode === ADD_CARD_MODES.manual ? "max-w-[1180px]" : "max-w-[880px]";

  const handleManualActionStateChange = useCallback(
    (nextState: AddCardFormActionState) => {
      setManualActionState((prevState) =>
        isSameActionState(prevState, nextState) ? prevState : nextState
      );
    },
    []
  );

  const handleRequestClose = useCallback(() => {
    if (manualActionState.isPending) {
      window.alert(
        "이미지 업로드 또는 저장이 진행 중입니다. 완료 후 닫아주세요."
      );
      return;
    }

    if (
      isDirty &&
      !window.confirm(
        "작성 중인 카드 내용이 있습니다. 지금 닫으면 임시 저장본만 남고 저장은 되지 않습니다. 닫을까요?"
      )
    ) {
      return;
    }
    onClose();
  }, [isDirty, manualActionState.isPending, onClose]);

  const footer =
    mode === ADD_CARD_MODES.manual ? (
      <ManualAddCardFooter
        formId={manualFormId}
        state={manualActionState}
        onCancel={handleRequestClose}
      />
    ) : null;

  return (
    <ResponsiveModal
      title="카드 추가"
      description={modeDescription}
      onClose={handleRequestClose}
      widthClassName={modalWidthClassName}
      footer={footer}
      density="compact"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 rounded-xl bg-[#f3f3f3] p-1 text-[13px] font-semibold">
          <motion.button
            type="button"
            onClick={() => setMode(ADD_CARD_MODES.manual)}
            className={`flex-1 rounded-lg px-3 py-2 transition-colors ${
              mode === ADD_CARD_MODES.manual
                ? "bg-white text-[#111] shadow-sm"
                : "text-[#666] hover:text-[#111]"
            }`}
            {...MODE_TAB_MOTION}
          >
            직접 작성
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setMode(ADD_CARD_MODES.bulk)}
            className={`flex-1 rounded-lg px-3 py-2 transition-colors ${
              mode === ADD_CARD_MODES.bulk
                ? "bg-white text-[#111] shadow-sm"
                : "text-[#666] hover:text-[#111]"
            }`}
            {...MODE_TAB_MOTION}
          >
            일괄 추가
          </motion.button>
        </div>

        <div className="mt-3 min-h-0 flex-1">
          <div
            hidden={mode !== ADD_CARD_MODES.manual}
            aria-hidden={mode !== ADD_CARD_MODES.manual}
            className="h-full min-h-0"
          >
            <AddCardForm
              deckId={deckId}
              formId={manualFormId}
              onSaved={onClose}
              onDirtyChange={setManualDirty}
              onActionStateChange={handleManualActionStateChange}
            />
          </div>
          <div
            hidden={mode !== ADD_CARD_MODES.bulk}
            aria-hidden={mode !== ADD_CARD_MODES.bulk}
            className="h-full min-h-0"
          >
            <BulkAddCardsForm
              deckId={deckId}
              onSuccess={onClose}
              onDirtyChange={setBulkDirty}
            />
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}
