"use client";
import { YeonForm } from "@yeon/ui";
import { AddCardFormEditorGrid } from "./add-card-form-parts";
import {
  ADD_CARD_FORM_INITIAL_ACTION_STATE,
  useAddCardFormState,
  type AddCardFormActionState,
} from "./use-add-card-form-state";

export { ADD_CARD_FORM_INITIAL_ACTION_STATE };
export type { AddCardFormActionState };

interface AddCardFormProps {
  deckId: string;
  formId: string;
  submitLabel?: string;
  pendingLabel?: string;
  onSaved?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onActionStateChange?: (state: AddCardFormActionState) => void;
}

export function AddCardForm({
  deckId,
  formId,
  submitLabel,
  pendingLabel,
  onSaved,
  onDirtyChange,
  onActionStateChange,
}: AddCardFormProps) {
  const form = useAddCardFormState({
    deckId,
    submitLabel,
    pendingLabel,
    onSaved,
    onDirtyChange,
    onActionStateChange,
  });

  return (
    <YeonForm
      id={formId}
      onSubmit={form.handleSubmit}
      className="flex h-full min-h-0 flex-col gap-3"
    >
      <AddCardFormEditorGrid form={form} />
    </YeonForm>
  );
}
