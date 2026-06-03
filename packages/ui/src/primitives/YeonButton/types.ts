import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export type YeonButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "pill"
  | "icon";

export type YeonButtonSize = "sm" | "md" | "lg" | "xl" | "icon";

export type YeonButtonCommonProps = {
  variant?: YeonButtonVariant;
  size?: YeonButtonSize;
  children?: ReactNode;
};

export type YeonButtonWebProps =
  | (YeonButtonCommonProps & {
      as?: "button";
      className?: string;
    } & ButtonHTMLAttributes<HTMLButtonElement>)
  | (YeonButtonCommonProps & {
      as: "a";
      className?: string;
    } & AnchorHTMLAttributes<HTMLAnchorElement>);
