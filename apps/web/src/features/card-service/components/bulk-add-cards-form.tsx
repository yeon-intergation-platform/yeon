"use client";
import { YeonForm } from "@yeon/ui";
import {
  BulkCardFormatHelp,
  BulkCardImportStatus,
  BulkCardInputField,
  BulkCardPreview,
  BulkCardReplaceNotice,
} from "./bulk-add-cards-form-parts";
import {
  BULK_ADD_CARDS_FORM_INITIAL_ACTION_STATE,
  useBulkAddCardsFormState,
  type BulkAddCardsFormActionState,
} from "./use-bulk-add-cards-form-state";

export { BULK_ADD_CARDS_FORM_INITIAL_ACTION_STATE };
export type { BulkAddCardsFormActionState };

interface BulkAddCardsFormProps {
  deckId: string;
  formId?: string;
  onSuccess?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onActionStateChange?: (state: BulkAddCardsFormActionState) => void;
}

export function BulkAddCardsForm({
  deckId,
  formId,
  onSuccess,
  onDirtyChange,
  onActionStateChange,
}: BulkAddCardsFormProps) {
  const form = useBulkAddCardsFormState({
    deckId,
    onSuccess,
    onDirtyChange,
    onActionStateChange,
  });

  return (
    <YeonForm
      id={formId}
      onSubmit={form.handleSubmit}
      className="flex flex-col gap-5"
    >
      {form.isHelpVisible ? (
        <BulkCardFormatHelp onDismiss={form.handleDismissHelp} />
      ) : null}
      <BulkCardInputField
        rawText={form.rawText}
        onRawTextChange={form.setRawText}
      />
      <BulkCardImportStatus
        cardCount={form.parseResult.cards.length}
        errors={form.parseResult.errors}
        warnings={form.parseResult.warnings}
        errorMessage={form.error?.message}
      />
      <BulkCardPreview
        cards={form.previewCards}
        hiddenCount={form.hiddenPreviewCount}
      />
      <BulkCardReplaceNotice />
    </YeonForm>
  );
}
