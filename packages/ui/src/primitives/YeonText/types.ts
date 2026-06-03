import type { HTMLAttributes, ReactNode } from "react";

export type YeonTextVariant =
  | "title"
  | "subtitle"
  | "body"
  | "caption"
  | "label"
  | "unstyled";
export type YeonTextTone =
  | "primary"
  | "secondary"
  | "muted"
  | "inverse"
  | "danger"
  | "inherit";

export type YeonTextWebProps = HTMLAttributes<HTMLElement> & {
  as?:
    | "p"
    | "span"
    | "strong"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "time"
    | "code"
    | "pre"
    | "blockquote"
    | "legend";
  children?: ReactNode;
  dateTime?: string;
  tone?: YeonTextTone;
  variant?: YeonTextVariant;
};
