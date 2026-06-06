import { createElement } from "react";
import { YeonText } from "../../primitives/YeonText/index.native";

export const YeonTiptapImageExtension = undefined;
export const YeonTiptapCodeBlockExtension = undefined;
export const YeonTiptapLinkExtension = undefined;
export const YeonTiptapPlaceholderExtension = undefined;
export const YeonTiptapTableExtension = undefined;
export const YeonTiptapTableCellExtension = undefined;
export const YeonTiptapTableHeaderExtension = undefined;
export const YeonTiptapTableRowExtension = undefined;
export const YeonTiptapUnderlineExtension = undefined;
export const YeonTiptapNode = undefined;
export const YeonTiptapNodeSelection = undefined;
export const YeonTiptapCellSelection = undefined;
export const YeonTiptapSlice = undefined;
export const YeonTiptapStarterKit = undefined;

export function getYeonTiptapSchema() {
  return undefined;
}

export function mergeAttributes(..._attributes: unknown[]) {
  return {};
}

export type YeonTiptapEditorContentProps = {
  fallbackText?: string;
};

export function YeonTiptapEditorContent({
  fallbackText,
}: YeonTiptapEditorContentProps = {}) {
  if (!fallbackText) return null;

  return createElement(
    YeonText,
    { variant: "body", tone: "secondary" },
    fallbackText
  );
}

export function useYeonTiptapEditor() {
  return null;
}

export type YeonTiptapEditor = never;
export type YeonTiptapNodeViewRendererProps = never;

export type YeonTiptapFragment = never;

export type YeonTiptapProseMirrorNode = never;

export type YeonTiptapProseMirrorSlice = never;
