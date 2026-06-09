"use client";
import { useCallback, useId, useMemo, useState } from "react";
import { YeonButton, YeonText, YeonView } from "@yeon/ui";
import {
  showYeonAlert,
  showYeonConfirm,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import {
  ADD_CARD_FORM_INITIAL_ACTION_STATE,
  AddCardForm,
  type AddCardFormActionState,
} from "./add-card-form";
import {
  BULK_ADD_CARDS_FORM_INITIAL_ACTION_STATE,
  BulkAddCardsForm,
  type BulkAddCardsFormActionState,
} from "./bulk-add-cards-form";
import { ResponsiveModal } from "./responsive-modal";

const ADD_CARD_MODES = {
  manual: "manual",
  bulk: "bulk",
} as const;

type AddCardMode = (typeof ADD_CARD_MODES)[keyof typeof ADD_CARD_MODES];

interface AddCardsPanelProps {
  deckId: string;
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

function BulkAddCardsFooter({
  formId,
  state,
  onCancel,
}: {
  formId: string;
  state: BulkAddCardsFormActionState;
  onCancel: () => void;
}) {
  const isActionPending = state.isPending;

  return (
    <YeonView className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <YeonView className="min-h-5 min-w-0">
        {state.errorMessage ? (
          <YeonText
            variant="caption"
            tone="danger"
            className="font-medium leading-5"
          >
            {state.errorMessage}
          </YeonText>
        ) : (
          <YeonText variant="caption" tone="secondary" className="leading-5">
            덮어쓰기는 기존 카드를 모두 삭제하고 인식된 카드로 교체합니다.
          </YeonText>
        )}
      </YeonView>
      <YeonView className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <YeonButton
          type="button"
          onClick={onCancel}
          disabled={isActionPending}
          className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis}
        >
          취소
        </YeonButton>
        <YeonButton
          type="submit"
          form={formId}
          name="bulkAction"
          value="replace"
          variant="danger"
          disabled={!state.canSubmit}
          className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis}
        >
          {state.replaceButtonLabel}
        </YeonButton>
        <YeonButton
          type="submit"
          form={formId}
          name="bulkAction"
          value="add"
          variant="primary"
          disabled={!state.canSubmit}
        >
          {state.addButtonLabel}
        </YeonButton>
      </YeonView>
    </YeonView>
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
    <YeonView className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <YeonView className="min-h-5 min-w-0">
        {state.errorMessage ? (
          <YeonText
            variant="caption"
            tone="danger"
            className="font-medium leading-5"
          >
            {state.errorMessage}
          </YeonText>
        ) : (
          <YeonText variant="caption" tone="secondary" className="leading-5">
            질문과 답변을 모두 작성하면 저장할 수 있습니다.
          </YeonText>
        )}
      </YeonView>
      <YeonView className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <YeonButton
          type="button"
          onClick={onCancel}
          disabled={isActionPending}
          className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis}
        >
          취소
        </YeonButton>
        <YeonButton
          type="submit"
          form={formId}
          variant="primary"
          disabled={!state.canSubmit}
        >
          {buttonLabel}
        </YeonButton>
      </YeonView>
    </YeonView>
  );
}

export function AddCardsPanel({ deckId, onClose }: AddCardsPanelProps) {
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

  const handleBulkActionStateChange = useCallback(
    (nextState: BulkAddCardsFormActionState) => {
      setBulkActionState((prevState) =>
        isSameBulkActionState(prevState, nextState) ? prevState : nextState
      );
    },
    []
  );

  const footer =
    mode === ADD_CARD_MODES.manual ? (
      <ManualAddCardFooter
        formId={manualFormId}
        state={manualActionState}
        onCancel={handleRequestClose}
      />
    ) : (
      <BulkAddCardsFooter
        formId={bulkFormId}
        state={bulkActionState}
        onCancel={handleRequestClose}
      />
    );

  return (
    <ResponsiveModal
      title="카드 추가"
      description={modeDescription}
      onClose={handleRequestClose}
      widthClassName={modalWidthClassName}
      footer={footer}
      density="compact"
    >
      <YeonView className="flex h-full min-h-0 flex-col">
        <YeonView className="flex shrink-0 rounded-xl bg-[#fafafa] p-1 text-[13px] font-semibold">
          <YeonButton
            type="button"
            size="sm"
            onClick={() => setMode(ADD_CARD_MODES.manual)}
            className={`flex-1 rounded-lg px-3 py-2 transition-colors ${
              mode === ADD_CARD_MODES.manual
                ? "bg-white text-[#111] shadow-sm"
                : "text-[#666] hover:text-[#111]"
            }`}
          >
            직접 작성
          </YeonButton>
          <YeonButton
            type="button"
            size="sm"
            onClick={() => setMode(ADD_CARD_MODES.bulk)}
            className={`flex-1 rounded-lg px-3 py-2 transition-colors ${
              mode === ADD_CARD_MODES.bulk
                ? "bg-white text-[#111] shadow-sm"
                : "text-[#666] hover:text-[#111]"
            }`}
          >
            일괄 추가
          </YeonButton>
        </YeonView>

        <YeonView className="mt-3 min-h-0 flex-1">
          <YeonView
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
          </YeonView>
          <YeonView
            hidden={mode !== ADD_CARD_MODES.bulk}
            aria-hidden={mode !== ADD_CARD_MODES.bulk}
            className="h-full min-h-0"
          >
            <BulkAddCardsForm
              deckId={deckId}
              formId={bulkFormId}
              onSuccess={onClose}
              onDirtyChange={setBulkDirty}
              onActionStateChange={handleBulkActionStateChange}
            />
          </YeonView>
        </YeonView>
      </YeonView>
    </ResponsiveModal>
  );
}
