"use client";
import { useCallback, useId, useMemo, useState } from "react";
import {
  showYeonAlert,
  showYeonConfirm,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  ADD_CARD_FORM_INITIAL_ACTION_STATE,
  type AddCardFormActionState,
} from "./add-card-form";
import {
  BULK_ADD_CARDS_FORM_INITIAL_ACTION_STATE,
  type BulkAddCardsFormActionState,
} from "./bulk-add-cards-form";

export const ADD_CARD_MODES = {
  manual: "manual",
  bulk: "bulk",
} as const;

export type AddCardMode = (typeof ADD_CARD_MODES)[keyof typeof ADD_CARD_MODES];

interface UseAddCardsPanelStateParams {
  onClose: () => void;
}

function isSameManualActionState(
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

function isSameBulkActionState(
  left: BulkAddCardsFormActionState,
  right: BulkAddCardsFormActionState
) {
  return (
    left.canSubmit === right.canSubmit &&
    left.isPending === right.isPending &&
    left.addButtonLabel === right.addButtonLabel &&
    left.replaceButtonLabel === right.replaceButtonLabel &&
    left.errorMessage === right.errorMessage
  );
}

export function useAddCardsPanelState({
  onClose,
}: UseAddCardsPanelStateParams) {
  const manualFormId = useId();
  const bulkFormId = useId();
  const [mode, setMode] = useState<AddCardMode>(ADD_CARD_MODES.manual);
  const [manualDirty, setManualDirty] = useState(false);
  const [bulkDirty, setBulkDirty] = useState(false);
  const [manualActionState, setManualActionState] = useState(
    ADD_CARD_FORM_INITIAL_ACTION_STATE
  );
  const [bulkActionState, setBulkActionState] = useState(
    BULK_ADD_CARDS_FORM_INITIAL_ACTION_STATE
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
    mode === ADD_CARD_MODES.manual
      ? "max-w-[1180px] md:h-[760px]"
      : "max-w-[880px]";

  const handleManualActionStateChange = useCallback(
    (nextState: AddCardFormActionState) => {
      setManualActionState((prevState) =>
        isSameManualActionState(prevState, nextState) ? prevState : nextState
      );
    },
    []
  );

  const handleBulkActionStateChange = useCallback(
    (nextState: BulkAddCardsFormActionState) => {
      setBulkActionState((prevState) =>
        isSameBulkActionState(prevState, nextState) ? prevState : nextState
      );
    },
    []
  );

  const handleRequestClose = useCallback(() => {
    if (manualActionState.isPending || bulkActionState.isPending) {
      showYeonAlert(
        "이미지 업로드 또는 저장이 진행 중입니다. 완료 후 닫아주세요."
      );
      return;
    }

    if (
      isDirty &&
      !showYeonConfirm(
        "작성 중인 카드 내용이 있습니다. 지금 닫으면 임시 저장본만 남고 저장은 되지 않습니다. 닫을까요?"
      )
    ) {
      return;
    }
    onClose();
  }, [
    bulkActionState.isPending,
    isDirty,
    manualActionState.isPending,
    onClose,
  ]);

  return {
    manualFormId,
    bulkFormId,
    mode,
    setMode,
    modeDescription,
    modalWidthClassName,
    manualActionState,
    bulkActionState,
    setManualDirty,
    setBulkDirty,
    handleManualActionStateChange,
    handleBulkActionStateChange,
    handleRequestClose,
  };
}

export type AddCardsPanelState = ReturnType<typeof useAddCardsPanelState>;
