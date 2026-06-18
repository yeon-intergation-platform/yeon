"use client";
import { useState } from "react";
import { SHARED_FEATURE_CLASS } from "../shared-style-constants";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import {
  YeonBadge,
  YeonButton,
  YeonField,
  getYeonSurfaceClassName,
  YeonLabel,
  YeonForm,
  YeonText,
  YeonView,
  YeonOption,
  type YeonFormEvent,
  type YeonFormElement,
} from "@yeon/ui";
import {
  type CreateTypingDeckBody,
  type TypingDeckDto,
  type TypingDeckLanguageTag,
  type TypingDeckVisibility,
  useCreateTypingDeck,
  useUpdateTypingDeck,
} from "./use-typing-decks";
import { getTypingUiText } from "./typing-service-i18n";
import { useTypingSettings } from "./use-typing-settings";

export type TypingDeckFormProps = {
  mode: "create" | "edit";
  deck?: TypingDeckDto;
  onSaved?: (deck: TypingDeckDto) => void;
  adminMode?: boolean;
};

export function TypingDeckForm({
  mode,
  deck,
  onSaved,
  adminMode = false,
}: TypingDeckFormProps) {
  const { settings } = useTypingSettings();
  const deckText = getTypingUiText(settings.locale).deck;
  const createDeck = useCreateTypingDeck(adminMode);
  const updateDeck = useUpdateTypingDeck(deck?.id ?? "", adminMode);
  const [title, setTitle] = useState(deck?.title ?? "");
  const [description, setDescription] = useState(deck?.description ?? "");
  const [languageTag, setLanguageTag] = useState<TypingDeckLanguageTag>(
    deck?.languageTag ?? "ko"
  );
  const [visibility, setVisibility] = useState<TypingDeckVisibility>(
    deck?.visibility ?? "private"
  );
  const isDefaultDeck = deck?.source === "default";
  const mutation = mode === "create" ? createDeck : updateDeck;
  const canSubmit =
    title.trim().length > 0 && !mutation.isPending && !isDefaultDeck;
  const submitLabel = mutation.isPending
    ? deckText.saving
    : mode === "create"
      ? deckText.saveCreate
      : deckText.saveEdit;

  function handleSubmit(event: YeonFormEvent<YeonFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    const body: CreateTypingDeckBody = {
      title: title.trim(),
      description: description.trim() || null,
      languageTag,
      visibility,
    };
    mutation.mutate(body, {
      onSuccess: (savedDeck) => {
        if (mode === "create") {
          trackEvent(analyticsEvents.typingDeckCreated, {
            deck_id: savedDeck.id,
            language_tag: savedDeck.languageTag,
            visibility: savedDeck.visibility,
            admin_mode: adminMode,
          });
          setTitle("");
          setDescription("");
          setLanguageTag("ko");
          setVisibility("private");
        }
        onSaved?.(savedDeck);
      },
    });
  }

  return (
    <YeonForm
      onSubmit={handleSubmit}
      className={getYeonSurfaceClassName({ className: "p-5" })}
    >
      <YeonView className={SHARED_FEATURE_CLASS.alignBetweenStartGap3}>
        <YeonView>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.panelBodyTitle}
          >
            {mode === "create"
              ? deckText.formCreateTitle
              : deckText.formEditTitle}
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`${SHARED_FEATURE_CLASS.text13Neutral} mt-1 leading-5`}
          >
            {deckText.formHelp}
          </YeonText>
        </YeonView>
        {isDefaultDeck ? <YeonBadge>{deckText.readOnly}</YeonBadge> : null}
      </YeonView>

      <YeonView className="mt-5 grid gap-4">
        <YeonLabel className={TYPING_SERVICE_COMMON_CLASS.formFieldGroup}>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.fieldLabel}
          >
            {deckText.titleLabel}
          </YeonText>
          <YeonField
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isDefaultDeck}
            maxLength={120}
            placeholder={deckText.titlePlaceholder}
          />
        </YeonLabel>
        <YeonLabel className={TYPING_SERVICE_COMMON_CLASS.formFieldGroup}>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.fieldLabel}
          >
            {deckText.descriptionLabel}
          </YeonText>
          <YeonField
            as="textarea"
            value={description ?? ""}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isDefaultDeck}
            rows={3}
            maxLength={2000}
            className="resize-y leading-6"
            placeholder={deckText.descriptionPlaceholder}
          />
        </YeonLabel>
        <YeonView className={TYPING_SERVICE_COMMON_CLASS.twoColumnFormGrid}>
          <YeonLabel className={TYPING_SERVICE_COMMON_CLASS.formFieldGroup}>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_COMMON_CLASS.fieldLabel}
            >
              {deckText.languageTag}
            </YeonText>
            <YeonField
              as="select"
              value={languageTag}
              onChange={(event) =>
                setLanguageTag(event.target.value as TypingDeckLanguageTag)
              }
              disabled={isDefaultDeck}
            >
              {(["ko", "en", "mixed"] as const).map((value) => (
                <YeonOption key={value} value={value}>
                  {deckText.language[value]}
                </YeonOption>
              ))}
            </YeonField>
          </YeonLabel>
          <YeonLabel className={TYPING_SERVICE_COMMON_CLASS.formFieldGroup}>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_COMMON_CLASS.fieldLabel}
            >
              {deckText.visibilityLabel}
            </YeonText>
            <YeonField
              as="select"
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as TypingDeckVisibility)
              }
              disabled={isDefaultDeck}
            >
              {(["private", "public"] as const).map((value) => (
                <YeonOption key={value} value={value}>
                  {deckText.visibility[value]}
                </YeonOption>
              ))}
            </YeonField>
          </YeonLabel>
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

      <YeonView className="mt-5 flex justify-end">
        <YeonButton type="submit" disabled={!canSubmit} variant="primary">
          {submitLabel}
        </YeonButton>
      </YeonView>
    </YeonForm>
  );
}
