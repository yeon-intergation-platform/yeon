"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";
import { useDeleteCard, useUpdateCard } from "../hooks";
import { isEmptyRichContent, normalizeRichContent } from "./card-content-utils";
import {
  isCardEditorImageUploadInProgress,
  updateCardEditorImageUploadSideState,
  type CardEditorImageUploadSideState,
} from "./card-editor-image-utils";
import {
  CardRowDeleteIconButton,
  CardRowEditView,
  CardRowReadView,
  CardRowSwipeDeleteAction,
} from "./card-row-views";
import {
  YeonView,
  YEON_WEB_SHADOW_CLASS,
  type YeonTouchEvent,
  type YeonElement,
} from "@yeon/ui";
import { showYeonConfirm } from "@yeon/ui/runtime/YeonBrowserRuntime";

type CardRowIdentityProps = {
  deckId: string;
  item: CardDeckItemDto;
  index?: number;
};

type CardRowEditStateProps = {
  isEditing?: boolean;
};

type CardRowEditActions = {
  onRequestEdit?: (itemId: string) => boolean;
  onCloseEdit?: () => void;
  onDirtyChange?: (itemId: string, dirty: boolean) => void;
};

type CardRowDeleteActions = {
  onDeleted?: () => void;
};

type CardRowProps = CardRowIdentityProps &
  CardRowEditStateProps &
  CardRowEditActions &
  CardRowDeleteActions;

function snapshot(frontText: string, backText: string) {
  return JSON.stringify({
    frontText: normalizeRichContent(frontText),
    backText: normalizeRichContent(backText),
  });
}

export function CardRow({
  deckId,
  item,
  index,
  isEditing = false,
  onRequestEdit,
  onCloseEdit,
  onDirtyChange,
  onDeleted,
}: CardRowProps) {
  const [isDeleteRevealed, setDeleteRevealed] = useState(false);
  const [isDeleteConfirming, setDeleteConfirming] = useState(false);
  const [frontText, setFrontText] = useState(item.frontText);
  const [backText, setBackText] = useState(item.backText);
  const [uploadingSides, setUploadingSides] =
    useState<CardEditorImageUploadSideState>({
      front: false,
      back: false,
    });
  const touchStateRef = useRef<{
    startX: number | null;
    ignoreNextClick: boolean;
  }>({ startX: null, ignoreNextClick: false });
  const deleteMutation = useDeleteCard(deckId);
  const updateMutation = useUpdateCard(deckId);
  const isDeleting = deleteMutation.isPending;
  const isUploading = isCardEditorImageUploadInProgress(uploadingSides);
  const isSaving = updateMutation.isPending || isUploading;

  const savedSnapshot = useMemo(
    () => snapshot(item.frontText, item.backText),
    [item.backText, item.frontText]
  );
  const currentSnapshot = useMemo(
    () => snapshot(frontText, backText),
    [backText, frontText]
  );
  const isDirty = currentSnapshot !== savedSnapshot;
  const canSave =
    isEditing &&
    !isEmptyRichContent(frontText) &&
    !isEmptyRichContent(backText) &&
    !isSaving;

  useEffect(() => {
    if (isEditing) return;
    setFrontText(item.frontText);
    setBackText(item.backText);
  }, [isEditing, item.backText, item.frontText]);

  useEffect(() => {
    onDirtyChange?.(item.id, isDirty && isEditing);
  }, [isDirty, isEditing, item.id, onDirtyChange]);

  const handleTouchStart = (event: YeonTouchEvent<YeonElement>) => {
    if (isEditing) return;
    touchStateRef.current.startX = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: YeonTouchEvent<YeonElement>) => {
    if (isEditing) return;
    const startX = touchStateRef.current.startX;
    touchStateRef.current.startX = null;
    if (startX === null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;

    if (deltaX < -48) {
      touchStateRef.current.ignoreNextClick = true;
      setDeleteRevealed(true);
      setDeleteConfirming(false);
      return;
    }
    if (deltaX > 32) {
      touchStateRef.current.ignoreNextClick = true;
      setDeleteRevealed(false);
      setDeleteConfirming(false);
    }
  };

  const handleDelete = () => {
    if (isEditing) return;
    if (!isDeleteConfirming) {
      setDeleteConfirming(true);
      return;
    }
    deleteMutation.mutate(item.id, {
      onSuccess: () => {
        setDeleteConfirming(false);
        setDeleteRevealed(false);
        onDeleted?.();
      },
    });
  };

  const openInlineEditor = () => {
    if (isEditing) return;
    if (isDeleteRevealed) {
      setDeleteRevealed(false);
      setDeleteConfirming(false);
      return;
    }
    const accepted = onRequestEdit?.(item.id) ?? true;
    if (!accepted) return;
    setFrontText(item.frontText);
    setBackText(item.backText);
    setDeleteRevealed(false);
    setDeleteConfirming(false);
  };

  const cancelEdit = () => {
    if (
      isDirty &&
      !showYeonConfirm(
        "수정 중인 카드 내용이 있습니다. 저장하지 않고 닫을까요?"
      )
    ) {
      return;
    }
    setFrontText(item.frontText);
    setBackText(item.backText);
    onDirtyChange?.(item.id, false);
    onCloseEdit?.();
  };

  const saveEdit = () => {
    if (!canSave) return;
    updateMutation.mutate(
      {
        itemId: item.id,
        body: {
          frontText: normalizeRichContent(frontText),
          backText: normalizeRichContent(backText),
        },
      },
      {
        onSuccess: () => {
          onDirtyChange?.(item.id, false);
          onCloseEdit?.();
        },
      }
    );
  };

  return (
    <YeonView
      className={`relative overflow-hidden rounded-[24px] border border-[#e5e5e5] bg-white ${YEON_WEB_SHADOW_CLASS.cardTiny}`}
    >
      <YeonView
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (touchStateRef.current.ignoreNextClick) {
            touchStateRef.current.ignoreNextClick = false;
            return;
          }
          openInlineEditor();
        }}
        className={`grid grid-cols-[52px_minmax(0,1fr)_48px] items-stretch transition-transform duration-200 md:grid-cols-[64px_minmax(0,1fr)_56px] ${
          isDeleteRevealed && !isEditing ? "-translate-x-24" : "translate-x-0"
        }`}
      >
        <YeonView className="flex items-start justify-center border-r border-[#e5e5e5] pt-5 text-[15px] font-semibold text-[#aaa] md:text-[16px]">
          {index ?? "-"}
        </YeonView>

        <YeonView
          className="min-w-0 px-4 py-4 md:px-5 md:py-5"
          onClick={(event) => {
            if (isEditing) event.stopPropagation();
          }}
        >
          {isEditing ? (
            <CardRowEditView
              item={item}
              frontText={frontText}
              backText={backText}
              isSaving={isSaving}
              isUploading={isUploading}
              canSave={canSave}
              updateErrorMessage={updateMutation.error?.message}
              onFrontTextChange={setFrontText}
              onBackTextChange={setBackText}
              onUploadingFrontChange={(isUploadingFront) =>
                setUploadingSides((prev) =>
                  updateCardEditorImageUploadSideState(
                    prev,
                    "front",
                    isUploadingFront
                  )
                )
              }
              onUploadingBackChange={(isUploadingBack) =>
                setUploadingSides((prev) =>
                  updateCardEditorImageUploadSideState(
                    prev,
                    "back",
                    isUploadingBack
                  )
                )
              }
              onCancelEdit={cancelEdit}
              onSaveEdit={saveEdit}
            />
          ) : (
            <CardRowReadView
              item={item}
              isDeleteConfirming={isDeleteConfirming}
              isDeleting={isDeleting}
              deleteErrorMessage={deleteMutation.error?.message}
              onDismissDeleteConfirm={() => setDeleteConfirming(false)}
              onConfirmDelete={handleDelete}
            />
          )}
        </YeonView>

        <YeonView className="flex items-start justify-center pt-4 pr-1 md:pr-2">
          {!isEditing ? (
            <CardRowDeleteIconButton
              isDeleteConfirming={isDeleteConfirming}
              isDeleting={isDeleting}
              onClick={() => {
                if (!isDeleteRevealed) handleDelete();
              }}
            />
          ) : null}
        </YeonView>
      </YeonView>

      {!isEditing ? (
        <CardRowSwipeDeleteAction
          isDeleteRevealed={isDeleteRevealed}
          isDeleteConfirming={isDeleteConfirming}
          isDeleting={isDeleting}
          onDelete={handleDelete}
        />
      ) : null}
    </YeonView>
  );
}
