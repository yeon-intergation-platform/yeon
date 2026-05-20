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

import { CARD_EDITOR_COMPACT_CLASS } from "./card-rich-markdown-editor-view";

type CardEditorToolbarDensity = "default" | "compact";

interface CardEditorToolbarButtonProps {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  density: CardEditorToolbarDensity;
  onClick: () => void;
}

function CardEditorToolbarButton({
  label,
  icon: Icon,
  active,
  disabled,
  isLoading,
  density,
  onClick,
}: CardEditorToolbarButtonProps) {
  const DisplayIcon = isLoading ? Loader2 : Icon;
  const buttonSizeClassName =
    density === "compact"
      ? CARD_EDITOR_COMPACT_CLASS.toolbarButton
      : "h-10 w-10 rounded-xl";
  const iconSizeClassName =
    density === "compact" ? CARD_EDITOR_COMPACT_CLASS.toolbarIcon : "h-4 w-4";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      aria-pressed={typeof active === "boolean" ? active : undefined}
      title={label}
      className={`flex ${buttonSizeClassName} items-center justify-center border text-[#111] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-[#111] bg-[#111] text-white"
          : "border-[#e5e5e5] bg-white hover:border-[#111] hover:bg-[#fafafa]"
      }`}
    >
      <DisplayIcon
        className={`${iconSizeClassName} ${isLoading ? "animate-spin" : ""}`}
      />
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
  density?: CardEditorToolbarDensity;
  leadingLabel?: string;
  trailingStatus?: string;
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
  density = "default",
  leadingLabel,
  trailingStatus,
}: CardEditorToolbarProps) {
  const toolbarClassName =
    density === "compact"
      ? CARD_EDITOR_COMPACT_CLASS.toolbar
      : "flex min-h-[64px] flex-wrap content-start items-center gap-x-2 gap-y-2.5 rounded-t-2xl border border-[#e5e5e5] bg-[#fafafa] p-3 md:min-h-[72px] md:gap-x-2.5 md:gap-y-3";
  const dividerClassName =
    density === "compact"
      ? CARD_EDITOR_COMPACT_CLASS.toolbarDivider
      : "mx-1 hidden h-10 w-px bg-[#e5e5e5] sm:block";

  const toolbarControls = (
    <>
      <CardEditorToolbarButton
        label="실행 취소"
        icon={Undo2}
        disabled={!canUseToolbar || !canUndo}
        density={density}
        onClick={onUndo}
      />
      <CardEditorToolbarButton
        label="다시 실행"
        icon={Redo2}
        disabled={!canUseToolbar || !canRedo}
        density={density}
        onClick={onRedo}
      />
      <span className={dividerClassName} />
      <CardEditorToolbarButton
        label="굵게"
        icon={Bold}
        active={active.bold}
        disabled={!canUseToolbar}
        density={density}
        onClick={onBold}
      />
      <CardEditorToolbarButton
        label="기울임"
        icon={Italic}
        active={active.italic}
        disabled={!canUseToolbar}
        density={density}
        onClick={onItalic}
      />
      <CardEditorToolbarButton
        label="밑줄"
        icon={UnderlineIcon}
        active={active.underline}
        disabled={!canUseToolbar}
        density={density}
        onClick={onUnderline}
      />
      <CardEditorToolbarButton
        label="목록"
        icon={List}
        active={active.bulletList}
        disabled={!canUseToolbar}
        density={density}
        onClick={onBulletList}
      />
      <CardEditorToolbarButton
        label="번호 목록"
        icon={ListOrdered}
        active={active.orderedList}
        disabled={!canUseToolbar}
        density={density}
        onClick={onOrderedList}
      />
      <CardEditorToolbarButton
        label="인용"
        icon={Quote}
        active={active.blockquote}
        disabled={!canUseToolbar}
        density={density}
        onClick={onBlockquote}
      />
      <CardEditorToolbarButton
        label="코드블록"
        icon={Code2}
        active={active.codeBlock}
        disabled={!canUseToolbar}
        density={density}
        onClick={onCodeBlock}
      />
      <CardEditorToolbarButton
        label="표 삽입"
        icon={Table2}
        disabled={!canUseToolbar}
        density={density}
        onClick={onTable}
      />
      <CardEditorToolbarButton
        label={isUploading ? "이미지 업로드 중" : "이미지 삽입"}
        icon={ImagePlus}
        disabled={!canUseToolbar || isUploading}
        isLoading={isUploading}
        density={density}
        onClick={onImage}
      />
    </>
  );

  if (density === "compact") {
    return (
      <div className={toolbarClassName}>
        {leadingLabel ? (
          <span className={CARD_EDITOR_COMPACT_CLASS.fieldLabel}>
            {leadingLabel}
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {toolbarControls}
        </div>
        {trailingStatus ? (
          <span
            className={`${CARD_EDITOR_COMPACT_CLASS.statusPill} justify-self-end whitespace-nowrap`}
          >
            {trailingStatus}
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
    );
  }

  return <div className={toolbarClassName}>{toolbarControls}</div>;
}
