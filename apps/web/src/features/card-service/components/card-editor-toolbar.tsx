"use client";

import {
  Bold,
  Code2,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
  type LucideIcon,
} from "lucide-react";

interface CardEditorToolbarButtonProps {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
}

function CardEditorToolbarButton({
  label,
  icon: Icon,
  active,
  disabled,
  isLoading,
  onClick,
}: CardEditorToolbarButtonProps) {
  const DisplayIcon = isLoading ? Loader2 : Icon;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      aria-pressed={typeof active === "boolean" ? active : undefined}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-[#111] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-[#111] bg-[#111] text-white"
          : "border-[#e5e5e5] bg-white hover:border-[#cfcfcf] hover:bg-[#f7f7f7]"
      }`}
    >
      <DisplayIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
    </button>
  );
}

interface CardEditorToolbarProps {
  canUseToolbar: boolean;
  isUploading: boolean;
  active: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    bulletList?: boolean;
    orderedList?: boolean;
    blockquote?: boolean;
    codeBlock?: boolean;
  };
  canUndo?: boolean;
  canRedo?: boolean;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onBulletList: () => void;
  onOrderedList: () => void;
  onBlockquote: () => void;
  onCodeBlock: () => void;
  onTable: () => void;
  onImage: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function CardEditorToolbar({
  canUseToolbar,
  isUploading,
  active,
  canUndo,
  canRedo,
  onBold,
  onItalic,
  onUnderline,
  onBulletList,
  onOrderedList,
  onBlockquote,
  onCodeBlock,
  onTable,
  onImage,
  onUndo,
  onRedo,
}: CardEditorToolbarProps) {
  return (
    <div className="flex min-h-[64px] flex-wrap content-start items-center gap-x-2 gap-y-2.5 rounded-t-2xl border border-[#e5e5e5] bg-[#fafafa] p-3 md:min-h-[72px] md:gap-x-2.5 md:gap-y-3">
      <CardEditorToolbarButton
        label="실행 취소"
        icon={Undo2}
        disabled={!canUseToolbar || !canUndo}
        onClick={onUndo}
      />
      <CardEditorToolbarButton
        label="다시 실행"
        icon={Redo2}
        disabled={!canUseToolbar || !canRedo}
        onClick={onRedo}
      />
      <span className="mx-1 hidden h-10 w-px bg-[#e5e5e5] sm:block" />
      <CardEditorToolbarButton
        label="굵게"
        icon={Bold}
        active={active.bold}
        disabled={!canUseToolbar}
        onClick={onBold}
      />
      <CardEditorToolbarButton
        label="기울임"
        icon={Italic}
        active={active.italic}
        disabled={!canUseToolbar}
        onClick={onItalic}
      />
      <CardEditorToolbarButton
        label="밑줄"
        icon={UnderlineIcon}
        active={active.underline}
        disabled={!canUseToolbar}
        onClick={onUnderline}
      />
      <CardEditorToolbarButton
        label="목록"
        icon={List}
        active={active.bulletList}
        disabled={!canUseToolbar}
        onClick={onBulletList}
      />
      <CardEditorToolbarButton
        label="번호 목록"
        icon={ListOrdered}
        active={active.orderedList}
        disabled={!canUseToolbar}
        onClick={onOrderedList}
      />
      <CardEditorToolbarButton
        label="인용"
        icon={Quote}
        active={active.blockquote}
        disabled={!canUseToolbar}
        onClick={onBlockquote}
      />
      <CardEditorToolbarButton
        label="코드블록"
        icon={Code2}
        active={active.codeBlock}
        disabled={!canUseToolbar}
        onClick={onCodeBlock}
      />
      <CardEditorToolbarButton
        label="표 삽입"
        icon={Table2}
        disabled={!canUseToolbar}
        onClick={onTable}
      />
      <CardEditorToolbarButton
        label={isUploading ? "이미지 업로드 중" : "이미지 삽입"}
        icon={ImagePlus}
        disabled={!canUseToolbar || isUploading}
        isLoading={isUploading}
        onClick={onImage}
      />
    </div>
  );
}
