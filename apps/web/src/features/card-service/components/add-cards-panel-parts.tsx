"use client";
import { YeonButton, YeonText, YeonView } from "@yeon/ui";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import { AddCardForm, type AddCardFormActionState } from "./add-card-form";
import {
  BulkAddCardsForm,
  type BulkAddCardsFormActionState,
} from "./bulk-add-cards-form";
import {
  ADD_CARD_MODES,
  type AddCardsPanelState,
  type AddCardMode,
} from "./use-add-cards-panel-state";

type AddCardsPanelPartsProps = {
  deckId: string;
  panel: AddCardsPanelState;
  onClose: () => void;
};

export function AddCardsPanelFooter({ panel }: { panel: AddCardsPanelState }) {
  return panel.mode === ADD_CARD_MODES.manual ? (
    <ManualAddCardFooter
      formId={panel.manualFormId}
      state={panel.manualActionState}
      onCancel={panel.handleRequestClose}
    />
  ) : (
    <BulkAddCardsFooter
      formId={panel.bulkFormId}
      state={panel.bulkActionState}
      onCancel={panel.handleRequestClose}
    />
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

export function AddCardsPanelBody({
  deckId,
  panel,
  onClose,
}: AddCardsPanelPartsProps) {
  return (
    <YeonView className="flex h-full min-h-0 flex-col">
      <AddCardsPanelModeTabs mode={panel.mode} setMode={panel.setMode} />
      <YeonView className="mt-3 min-h-0 flex-1">
        <YeonView
          hidden={panel.mode !== ADD_CARD_MODES.manual}
          aria-hidden={panel.mode !== ADD_CARD_MODES.manual}
          className="h-full min-h-0"
        >
          <AddCardForm
            deckId={deckId}
            formId={panel.manualFormId}
            onSaved={onClose}
            onDirtyChange={panel.setManualDirty}
            onActionStateChange={panel.handleManualActionStateChange}
          />
        </YeonView>
        <YeonView
          hidden={panel.mode !== ADD_CARD_MODES.bulk}
          aria-hidden={panel.mode !== ADD_CARD_MODES.bulk}
          className="h-full min-h-0"
        >
          <BulkAddCardsForm
            deckId={deckId}
            formId={panel.bulkFormId}
            onSuccess={onClose}
            onDirtyChange={panel.setBulkDirty}
            onActionStateChange={panel.handleBulkActionStateChange}
          />
        </YeonView>
      </YeonView>
    </YeonView>
  );
}

function AddCardsPanelModeTabs({
  mode,
  setMode,
}: {
  mode: AddCardMode;
  setMode: (mode: AddCardMode) => void;
}) {
  return (
    <YeonView className="flex shrink-0 rounded-xl bg-[#fafafa] p-1 text-[13px] font-semibold">
      <AddCardsPanelModeTab
        isActive={mode === ADD_CARD_MODES.manual}
        label="직접 작성"
        onClick={() => setMode(ADD_CARD_MODES.manual)}
      />
      <AddCardsPanelModeTab
        isActive={mode === ADD_CARD_MODES.bulk}
        label="일괄 추가"
        onClick={() => setMode(ADD_CARD_MODES.bulk)}
      />
    </YeonView>
  );
}

function AddCardsPanelModeTab({
  isActive,
  label,
  onClick,
}: {
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <YeonButton
      type="button"
      size="sm"
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 transition-colors ${
        isActive
          ? "bg-white text-[#111] shadow-sm"
          : "text-[#666] hover:text-[#111]"
      }`}
    >
      {label}
    </YeonButton>
  );
}
