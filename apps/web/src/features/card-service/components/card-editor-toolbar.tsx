"use client";
import {
  YeonButton,
  YeonIcon,
  type YeonIconName,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { CARD_EDITOR_COMPACT_CLASS } from "./card-rich-markdown-editor-view";

type CardEditorToolbarDensity = "default" | "compact";

interface CardEditorToolbarButtonProps {
  label: string;
  icon: YeonIconName;
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
  const displayIcon: YeonIconName = isLoading ? "loader" : Icon;
  const buttonSizeClassName =
    density === "compact"
      ? CARD_EDITOR_COMPACT_CLASS.toolbarButton
      : "h-10 w-10 rounded-xl";
  const iconSizeClassName =
    density === "compact" ? CARD_EDITOR_COMPACT_CLASS.toolbarIcon : "h-4 w-4";

  return (
    <YeonButton
      type="button"
      variant={active ? "primary" : "secondary"}
      size="icon"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      aria-pressed={typeof active === "boolean" ? active : undefined}
      title={label}
      className={`flex ${buttonSizeClassName} items-center justify-center border text-[#111] disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-[#111] bg-[#111] text-white"
          : "border-[#e5e5e5] bg-white hover:border-[#111] hover:bg-[#fafafa]"
      }`}
    >
      <YeonIcon
        name={displayIcon}
        className={`${iconSizeClassName} ${isLoading ? "animate-spin" : ""}`}
      />
    </YeonButton>
  );
}

type CardEditorToolbarMarksState = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  bulletList?: boolean;
  orderedList?: boolean;
  blockquote?: boolean;
  codeBlock?: boolean;
};

type CardEditorToolbarAvailabilityProps = {
  canUseToolbar: boolean;
  isUploading: boolean;
  active: CardEditorToolbarMarksState;
  canUndo?: boolean;
  canRedo?: boolean;
};

type CardEditorToolbarFormatActions = {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onBulletList: () => void;
  onOrderedList: () => void;
  onBlockquote: () => void;
  onCodeBlock: () => void;
};

type CardEditorToolbarInsertActions = {
  onTable: () => void;
  onImage: () => void;
};

type CardEditorToolbarHistoryActions = {
  onUndo: () => void;
  onRedo: () => void;
};

type CardEditorToolbarDisplayProps = {
  density?: CardEditorToolbarDensity;
  leadingLabel?: string;
};

type CardEditorToolbarProps = CardEditorToolbarAvailabilityProps &
  CardEditorToolbarFormatActions &
  CardEditorToolbarInsertActions &
  CardEditorToolbarHistoryActions &
  CardEditorToolbarDisplayProps;

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
        icon="undo"
        disabled={!canUseToolbar || !canUndo}
        density={density}
        onClick={onUndo}
      />
      <CardEditorToolbarButton
        label="다시 실행"
        icon="redo"
        disabled={!canUseToolbar || !canRedo}
        density={density}
        onClick={onRedo}
      />
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className={dividerClassName}
      />
      <CardEditorToolbarButton
        label="굵게"
        icon="bold"
        active={active.bold}
        disabled={!canUseToolbar}
        density={density}
        onClick={onBold}
      />
      <CardEditorToolbarButton
        label="기울임"
        icon="italic"
        active={active.italic}
        disabled={!canUseToolbar}
        density={density}
        onClick={onItalic}
      />
      <CardEditorToolbarButton
        label="밑줄"
        icon="underline"
        active={active.underline}
        disabled={!canUseToolbar}
        density={density}
        onClick={onUnderline}
      />
      <CardEditorToolbarButton
        label="목록"
        icon="list"
        active={active.bulletList}
        disabled={!canUseToolbar}
        density={density}
        onClick={onBulletList}
      />
      <CardEditorToolbarButton
        label="번호 목록"
        icon="list-ordered"
        active={active.orderedList}
        disabled={!canUseToolbar}
        density={density}
        onClick={onOrderedList}
      />
      <CardEditorToolbarButton
        label="인용"
        icon="quote"
        active={active.blockquote}
        disabled={!canUseToolbar}
        density={density}
        onClick={onBlockquote}
      />
      <CardEditorToolbarButton
        label="코드블록"
        icon="code"
        active={active.codeBlock}
        disabled={!canUseToolbar}
        density={density}
        onClick={onCodeBlock}
      />
      <CardEditorToolbarButton
        label="표 삽입"
        icon="table"
        disabled={!canUseToolbar}
        density={density}
        onClick={onTable}
      />
      <CardEditorToolbarButton
        label={isUploading ? "이미지 업로드 중" : "이미지 삽입"}
        icon="image-plus"
        disabled={!canUseToolbar || isUploading}
        isLoading={isUploading}
        density={density}
        onClick={onImage}
      />
    </>
  );

  if (density === "compact") {
    return (
      <YeonView className={toolbarClassName}>
        {leadingLabel ? (
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={CARD_EDITOR_COMPACT_CLASS.fieldLabel}
          >
            {leadingLabel}
          </YeonText>
        ) : (
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            aria-hidden="true"
          />
        )}
        <YeonView className="flex min-w-0 flex-wrap items-center gap-1.5">
          {toolbarControls}
        </YeonView>
      </YeonView>
    );
  }

  return <YeonView className={toolbarClassName}>{toolbarControls}</YeonView>;
}
