"use client";
import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";
import {
  YeonBadge,
  YeonButton,
  YeonImage,
  YeonIcon,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { CardRichMarkdownEditor } from "./card-rich-markdown-editor";
import { MarkdownContent } from "./markdown-content";
import { SHARED_FEATURE_CLASS } from "../../shared-style-constants";

type CardRowEditContentProps = {
  item: CardDeckItemDto;
  frontText: string;
  backText: string;
};

type CardRowEditStatusProps = {
  isSaving: boolean;
  isUploading: boolean;
  canSave: boolean;
  updateErrorMessage?: string;
};

type CardRowEditTextActions = {
  onFrontTextChange: (value: string) => void;
  onBackTextChange: (value: string) => void;
  onUploadingFrontChange: (value: boolean) => void;
  onUploadingBackChange: (value: boolean) => void;
};

type CardRowEditSubmitActions = {
  onCancelEdit: () => void;
  onSaveEdit: () => void;
};

type CardRowEditViewProps = CardRowEditContentProps &
  CardRowEditStatusProps &
  CardRowEditTextActions &
  CardRowEditSubmitActions;

export function CardRowEditView({
  item,
  frontText,
  backText,
  isSaving,
  isUploading,
  canSave,
  updateErrorMessage,
  onFrontTextChange,
  onBackTextChange,
  onUploadingFrontChange,
  onUploadingBackChange,
  onCancelEdit,
  onSaveEdit,
}: CardRowEditViewProps) {
  const saveLabel = isUploading
    ? "업로드 중..."
    : isSaving
      ? "저장 중..."
      : "저장";

  return (
    <YeonView className="space-y-5">
      <YeonSurface variant="outlined" className="p-4">
        <CardRichMarkdownEditor
          label="질문 수정"
          value={frontText}
          onChange={onFrontTextChange}
          placeholder="질문을 작성하세요. 이미지는 본문 안에 넣을 수 있습니다."
          onUploadingChange={onUploadingFrontChange}
        />
      </YeonSurface>
      <YeonSurface variant="outlined" className="p-4">
        <CardRichMarkdownEditor
          label="답변 수정"
          value={backText}
          onChange={onBackTextChange}
          placeholder="답변을 작성하세요."
          onUploadingChange={onUploadingBackChange}
        />
      </YeonSurface>

      {item.imageUrl ? (
        <YeonSurface variant="panel" className="p-3">
          <YeonText variant="caption" tone="secondary">
            기존 단일 첨부 이미지는 보기 화면에 계속 유지됩니다. 새 이미지는
            질문/답변 에디터 안에 삽입하세요.
          </YeonText>
        </YeonSurface>
      ) : null}

      {updateErrorMessage ? (
        <YeonText
          as="p"
          variant="caption"
          tone="primary"
          className="font-semibold"
        >
          {updateErrorMessage}
        </YeonText>
      ) : null}

      <YeonView className="flex flex-col-reverse gap-2 border-t border-[#e5e5e5] pt-4 sm:flex-row sm:items-center sm:justify-end">
        <YeonButton
          type="button"
          onClick={onCancelEdit}
          disabled={isSaving}
          variant="secondary"
          size="lg"
          className={SHARED_FEATURE_CLASS.text13Emphasis}
        >
          취소
        </YeonButton>
        <YeonButton
          type="button"
          onClick={onSaveEdit}
          disabled={!canSave}
          variant="primary"
          size="lg"
        >
          {saveLabel}
        </YeonButton>
      </YeonView>
    </YeonView>
  );
}

type CardRowReadViewProps = {
  item: CardDeckItemDto;
  isDeleteConfirming: boolean;
  isDeleting: boolean;
  deleteErrorMessage?: string;
  onDismissDeleteConfirm: () => void;
  onConfirmDelete: () => void;
};

export function CardRowReadView({
  item,
  isDeleteConfirming,
  isDeleting,
  deleteErrorMessage,
  onDismissDeleteConfirm,
  onConfirmDelete,
}: CardRowReadViewProps) {
  return (
    <>
      <YeonView>
        <YeonBadge
          variant="neutral"
          className={`${SHARED_FEATURE_CLASS.text11EmphasisSubtle} md:text-[12px]`}
        >
          질문
        </YeonBadge>
        <YeonView className="mt-3 text-[18px] font-semibold leading-8 text-[#111] md:text-[20px]">
          <MarkdownContent>{item.frontText}</MarkdownContent>
        </YeonView>
      </YeonView>

      {item.imageUrl ? (
        <YeonSurface variant="panel" className="mt-4 p-3">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`mb-2 ${SHARED_FEATURE_CLASS.text12EmphasisSubtle}`}
          >
            첨부 이미지
          </YeonText>
          <YeonImage
            src={item.imageUrl}
            alt="카드 첨부 이미지"
            width={640}
            height={280}
            className="max-h-[280px] w-full rounded-xl object-contain"
            draggable={false}
          />
        </YeonSurface>
      ) : null}

      <YeonView className="mt-5 border-t border-[#e5e5e5] pt-4">
        <YeonBadge
          variant="neutral"
          className={`${SHARED_FEATURE_CLASS.text11EmphasisSubtle} md:text-[12px]`}
        >
          답변
        </YeonBadge>
        <YeonView className="mt-3 text-[15px] leading-7 text-[#666] md:text-[16px]">
          <MarkdownContent>{item.backText}</MarkdownContent>
        </YeonView>
      </YeonView>

      <YeonView
        className={`mt-4 ${SHARED_FEATURE_CLASS.alignBetweenGap3} text-[12px] text-[#aaa] md:text-[13px]`}
      >
        <YeonText as="span" variant="unstyled" tone="inherit">
          카드를 눌러 바로 수정
        </YeonText>
        {deleteErrorMessage ? (
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="font-semibold text-[#111]"
          >
            {deleteErrorMessage}
          </YeonText>
        ) : null}
      </YeonView>

      {isDeleteConfirming ? (
        <YeonView
          className="mt-3 flex justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <YeonButton
            type="button"
            onClick={onDismissDeleteConfirm}
            variant="secondary"
            size="sm"
            className={SHARED_FEATURE_CLASS.text12Emphasis}
          >
            취소
          </YeonButton>
          <YeonButton
            type="button"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            variant="danger"
            size="sm"
          >
            {isDeleting ? "삭제 중..." : "삭제 확인"}
          </YeonButton>
        </YeonView>
      ) : null}
    </>
  );
}

export function CardRowDeleteIconButton({
  isDeleteConfirming,
  isDeleting,
  onClick,
}: {
  isDeleteConfirming: boolean;
  isDeleting: boolean;
  onClick: () => void;
}) {
  return (
    <YeonButton
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      disabled={isDeleting}
      aria-label="카드 삭제"
      variant="icon"
      size="icon"
      className={`h-9 w-9 rounded-xl ${
        isDeleteConfirming ? "bg-[#fafafa] text-[#111]" : "text-[#aaa]"
      }`}
    >
      <YeonIcon name="trash" size={16} strokeWidth={1.5} aria-hidden />
    </YeonButton>
  );
}

export function CardRowSwipeDeleteAction({
  isDeleteRevealed,
  isDeleteConfirming,
  isDeleting,
  onDelete,
}: {
  isDeleteRevealed: boolean;
  isDeleteConfirming: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <YeonView
      className={`absolute inset-y-0 right-0 flex w-24 items-center justify-center border-l border-[#e5e5e5] bg-[#fafafa] transition-transform duration-200 ${
        isDeleteRevealed ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <YeonButton
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        disabled={isDeleting}
        variant="danger"
        size="md"
        className="h-full w-full rounded-none border-0 bg-transparent"
      >
        {isDeleting ? "삭제 중" : isDeleteConfirming ? "확인" : "삭제"}
      </YeonButton>
    </YeonView>
  );
}
