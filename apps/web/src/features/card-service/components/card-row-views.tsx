"use client";

import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";

import { CardRichMarkdownEditor } from "./card-rich-markdown-editor";
import { MarkdownContent } from "./markdown-content";

type CardRowEditViewProps = {
  item: CardDeckItemDto;
  frontText: string;
  backText: string;
  isSaving: boolean;
  isUploading: boolean;
  canSave: boolean;
  updateErrorMessage?: string;
  onFrontTextChange: (value: string) => void;
  onBackTextChange: (value: string) => void;
  onUploadingFrontChange: (value: boolean) => void;
  onUploadingBackChange: (value: boolean) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
};

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
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#ececec] bg-white p-4">
        <CardRichMarkdownEditor
          label="질문 수정"
          value={frontText}
          onChange={onFrontTextChange}
          placeholder="질문을 작성하세요. 이미지는 본문 안에 넣을 수 있습니다."
          onUploadingChange={onUploadingFrontChange}
        />
      </div>
      <div className="rounded-2xl border border-[#ececec] bg-white p-4">
        <CardRichMarkdownEditor
          label="답변 수정"
          value={backText}
          onChange={onBackTextChange}
          placeholder="답변을 작성하세요."
          onUploadingChange={onUploadingBackChange}
        />
      </div>

      {item.imageUrl ? (
        <div className="rounded-2xl border border-[#efefef] bg-[#fafafa] p-3 text-[12px] leading-6 text-[#666]">
          기존 단일 첨부 이미지는 보기 화면에 계속 유지됩니다. 새 이미지는
          질문/답변 에디터 안에 삽입하세요.
        </div>
      ) : null}

      {updateErrorMessage ? (
        <p className="text-[13px] font-medium text-red-600">
          {updateErrorMessage}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-[#efefef] pt-4 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancelEdit}
          disabled={isSaving}
          className="rounded-2xl border border-[#e5e5e5] px-4 py-3 text-[13px] font-semibold text-[#111] transition-colors hover:bg-[#fafafa] disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onSaveEdit}
          disabled={!canSave}
          className="rounded-2xl bg-[#111] px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveLabel}
        </button>
      </div>
    </div>
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
      <div>
        <span className="inline-flex rounded-full border border-[#ececec] bg-[#fafafa] px-2.5 py-1 text-[11px] font-semibold text-[#888] md:text-[12px]">
          질문
        </span>
        <div className="mt-3 text-[18px] font-semibold leading-8 text-[#111] md:text-[20px]">
          <MarkdownContent>{item.frontText}</MarkdownContent>
        </div>
      </div>

      {item.imageUrl ? (
        <div className="mt-4 rounded-2xl border border-[#efefef] bg-[#fafafa] p-3">
          <p className="mb-2 text-[12px] font-semibold text-[#777]">
            첨부 이미지
          </p>
          <img
            src={item.imageUrl}
            alt="카드 첨부 이미지"
            className="max-h-[280px] w-full rounded-xl object-contain"
            draggable={false}
          />
        </div>
      ) : null}

      <div className="mt-5 border-t border-[#f0f0f0] pt-4">
        <span className="inline-flex rounded-full border border-[#ececec] bg-[#fafafa] px-2.5 py-1 text-[11px] font-semibold text-[#888] md:text-[12px]">
          답변
        </span>
        <div className="mt-3 text-[15px] leading-7 text-[#444] md:text-[16px]">
          <MarkdownContent>{item.backText}</MarkdownContent>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-[12px] text-[#888] md:text-[13px]">
        <span>카드를 눌러 바로 수정</span>
        {deleteErrorMessage ? (
          <span className="font-medium text-red-600">{deleteErrorMessage}</span>
        ) : null}
      </div>

      {isDeleteConfirming ? (
        <div
          className="mt-3 flex justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onDismissDeleteConfirm}
            className="rounded-xl border border-[#e5e5e5] px-3 py-2 text-[12px] font-semibold text-[#111] hover:bg-[#fafafa]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="rounded-xl border border-red-100 px-3 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {isDeleting ? "삭제 중..." : "삭제 확인"}
          </button>
        </div>
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
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      disabled={isDeleting}
      aria-label="카드 삭제"
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
        isDeleteConfirming
          ? "text-red-500 hover:bg-red-50"
          : "text-[#ccc] hover:bg-[#fafafa] hover:text-[#888]"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 4h12M5 4V2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 9.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5L13 4" />
      </svg>
    </button>
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
    <div
      className={`absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-red-50 transition-transform duration-200 ${
        isDeleteRevealed ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        disabled={isDeleting}
        className="h-full w-full text-[13px] font-semibold text-red-600 disabled:opacity-50"
      >
        {isDeleting ? "삭제 중" : isDeleteConfirming ? "확인" : "삭제"}
      </button>
    </div>
  );
}
