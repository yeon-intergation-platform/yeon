import type {
  ChangeEvent as ReactChangeEvent,
  ClipboardEvent as ReactClipboardEvent,
  FormEvent as ReactFormEvent,
  FormEventHandler as ReactFormEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from "react";

export type YeonPrimitiveSize = "sm" | "md" | "lg" | "xl";
export type YeonPrimitiveTone =
  | "neutral"
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "accent";

export type YeonFormEvent<T = unknown> = ReactFormEvent<T>;
export type YeonChangeEvent<T = unknown> = ReactChangeEvent<T>;
export type YeonMouseEvent<T = unknown> = ReactMouseEvent<T>;
export type YeonKeyboardEvent<T = unknown> = ReactKeyboardEvent<T>;
export type YeonClipboardEvent<T = unknown> = ReactClipboardEvent<T>;
export type YeonTouchEvent<T = unknown> = ReactTouchEvent<T>;
export type YeonFormEventHandler<T = YeonFormElement> =
  ReactFormEventHandler<T>;

export type YeonDocument = Document;
export type YeonDocumentKeyboardEvent = KeyboardEvent;
export type YeonDocumentPointerEvent = PointerEvent;
export type YeonBaseElement = Element;
export type YeonElement = HTMLElement;
export type YeonEventTarget = EventTarget;
export type YeonNode = Node;
export type YeonAnchorElement = HTMLAnchorElement;
export type YeonButtonElement = HTMLButtonElement;
export type YeonFormElement = HTMLFormElement;
export type YeonIFrameElement = HTMLIFrameElement;
export type YeonImageElement = HTMLImageElement;
export type YeonInputElement = HTMLInputElement;
export type YeonPreElement = HTMLPreElement;
export type YeonSelectElement = HTMLSelectElement;
export type YeonTableCellElement = HTMLTableCellElement;
export type YeonTableElement = HTMLTableElement;
export type YeonTableRowElement = HTMLTableRowElement;
export type YeonTextAreaElement = HTMLTextAreaElement;
