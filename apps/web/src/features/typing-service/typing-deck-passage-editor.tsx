"use client";
import { useState } from "react";
import {
  YeonButton,
  YeonField,
  getYeonSurfaceClassName,
  YeonForm,
  YeonText,
  YeonView,
  YeonOption,
  type YeonFormEvent,
  type YeonFormElement,
} from "@yeon/ui";
import { SHARED_FEATURE_CLASS } from "../shared-style-constants";
import {
  type CreateTypingDeckPassageBody,
  type TypingDeckPassageDto,
  type TypingPassageDifficulty,
  type TypingPassageTextType,
  useCreateTypingDeckPassage,
  useUpdateTypingDeckPassage,
} from "./use-typing-decks";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import { getTypingUiText } from "./typing-service-i18n";
import { useTypingSettings } from "./use-typing-settings";

export type TypingDeckPassageEditorProps = {
  deckId: string;
  editingPassage: TypingDeckPassageDto | null;
  onCancelEdit: () => void;
  adminMode?: boolean;
};

export function TypingDeckPassageEditor({
  deckId,
  editingPassage,
  onCancelEdit,
  adminMode = false,
}: TypingDeckPassageEditorProps) {
  const { settings } = useTypingSettings();
  const deckText = getTypingUiText(settings.locale).deck;
  const addPassage = useCreateTypingDeckPassage(deckId, adminMode);
  const updatePassage = useUpdateTypingDeckPassage(deckId, adminMode);
  const [title, setTitle] = useState(editingPassage?.title ?? "");
  const [prompt, setPrompt] = useState(editingPassage?.prompt ?? "");
  const [textType, setTextType] = useState<TypingPassageTextType>(
    editingPassage?.textType ?? "short"
  );
  const [difficulty, setDifficulty] = useState<TypingPassageDifficulty>(
    editingPassage?.difficulty ?? "normal"
  );
  const mutation = editingPassage ? updatePassage : addPassage;
  const canSubmit = prompt.trim().length > 0 && !mutation.isPending;
  const submitLabel = mutation.isPending
    ? deckText.saving
    : editingPassage
      ? deckText.saveEdit
      : deckText.addPassage;

  function resetForm() {
    setTitle("");
    setPrompt("");
    setTextType("short");
    setDifficulty("normal");
  }

  function handleSubmit(event: YeonFormEvent<YeonFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    const body: CreateTypingDeckPassageBody = {
      title: title.trim() || null,
      prompt: prompt.trim(),
      textType,
      difficulty,
    };
    if (editingPassage) {
      updatePassage.mutate(
        { passageId: editingPassage.id, body },
        { onSuccess: onCancelEdit }
      );
      return;
    }
    addPassage.mutate(body, { onSuccess: resetForm });
  }

  return (
    <YeonForm
      onSubmit={handleSubmit}
      className={getYeonSurfaceClassName({ className: "p-5" })}
    >
      <YeonView className={SHARED_FEATURE_CLASS.alignBetweenGap3}>
        <YeonText
          as="h3"
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text16Emphasis}
        >
          {editingPassage ? deckText.editPassage : deckText.addPassage}
        </YeonText>
        {editingPassage ? (
          <YeonButton
            type="button"
            onClick={onCancelEdit}
            variant="ghost"
            className="px-0 py-0"
          >
            {deckText.cancel}
          </YeonButton>
        ) : null}
      </YeonView>
      <YeonView className="mt-4 grid gap-3">
        <YeonField
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={deckText.passageTitlePlaceholder}
        />
        <YeonField
          as="textarea"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={6}
          placeholder={deckText.promptPlaceholder}
          className="resize-y leading-6"
        />
        <YeonView className="grid gap-3 sm:grid-cols-2">
          <YeonField
            as="select"
            value={textType}
            onChange={(event) =>
              setTextType(event.target.value as TypingPassageTextType)
            }
          >
            <YeonOption value="short">{deckText.shortText}</YeonOption>
            <YeonOption value="long">{deckText.longText}</YeonOption>
            <YeonOption value="code">{deckText.codeText}</YeonOption>
          </YeonField>
          <YeonField
            as="select"
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as TypingPassageDifficulty)
            }
          >
            <YeonOption value="easy">{deckText.easy}</YeonOption>
            <YeonOption value="normal">{deckText.normal}</YeonOption>
            <YeonOption value="hard">{deckText.hard}</YeonOption>
          </YeonField>
        </YeonView>
      </YeonView>
      {mutation.error ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_COMMON_CLASS.textErrorWithSpacing}
        >
          {mutation.error.message}
        </YeonText>
      ) : null}
      <YeonView className="mt-4 flex justify-end">
        <YeonButton type="submit" disabled={!canSubmit} variant="primary">
          {submitLabel}
        </YeonButton>
      </YeonView>
    </YeonForm>
  );
}
