"use client";
import { YeonForm, YeonView } from "@yeon/ui";
import { CardAddPreviewFace } from "./card-add-live-preview";
import { CardRichMarkdownEditor } from "./card-rich-markdown-editor";
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
      <YeonView className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2 lg:grid-rows-[auto_auto] lg:items-stretch">
        <YeonView className="min-w-0">
          <CardRichMarkdownEditor
            label="카드 질문"
            value={form.frontText}
            onChange={form.setFrontText}
            placeholder="질문 또는 앞면 내용을 작성하고 이미지는 문장 사이에 붙여넣으세요."
            helperText="이미지는 드래그·붙여넣기·버튼으로 본문에 삽입됩니다."
            density="question"
            layoutMode="compact"
            previewPlacement="mobile"
            onUploadingChange={form.setFrontUploading}
          />
        </YeonView>
        <YeonView className="hidden min-w-0 lg:block">
          <CardAddPreviewFace
            label="앞면"
            title="카드 질문"
            value={form.deferredFrontText}
            emptyText="질문을 작성하면 카드 앞면에 표시됩니다."
            onCodeLanguageChange={form.handleFrontCodeLanguageChange}
          />
        </YeonView>
        <YeonView className="min-w-0">
          <CardRichMarkdownEditor
            label="카드 답변"
            value={form.backText}
            onChange={form.setBackText}
            placeholder="답변 또는 본문을 작성하세요."
            helperText="삽입 이미지는 크기 조절 후 저장하면 본문과 함께 유지됩니다."
            density="answer"
            layoutMode="compact"
            previewPlacement="mobile"
            onUploadingChange={form.setBackUploading}
          />
        </YeonView>
        <YeonView className="hidden min-w-0 lg:block">
          <CardAddPreviewFace
            label="뒷면"
            title="카드 답변"
            value={form.deferredBackText}
            emptyText="답변을 작성하면 카드 뒷면에 표시됩니다."
            onCodeLanguageChange={form.handleBackCodeLanguageChange}
          />
        </YeonView>
      </YeonView>
    </YeonForm>
  );
}
