import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { joinClassNames } from "./class-names";

const YEON_FIELD_BASE_CLASS =
  "w-full rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 text-[14px] text-[#111] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#111] disabled:bg-[#fafafa] disabled:text-[#aaa]";

export type YeonFieldProps =
  | ({ as?: "input" } & InputHTMLAttributes<HTMLInputElement>)
  | ({ as: "textarea" } & TextareaHTMLAttributes<HTMLTextAreaElement>)
  | ({ as: "select" } & SelectHTMLAttributes<HTMLSelectElement>);

export function getYeonFieldClassName(className?: string) {
  return joinClassNames(YEON_FIELD_BASE_CLASS, className);
}

export function YeonField(props: YeonFieldProps) {
  if (props.as === "textarea") {
    const { as: _as, className, ...textareaProps } = props;
    return (
      <textarea
        className={getYeonFieldClassName(className)}
        {...textareaProps}
      />
    );
  }

  if (props.as === "select") {
    const { as: _as, className, ...selectProps } = props;
    return (
      <select className={getYeonFieldClassName(className)} {...selectProps} />
    );
  }

  const { as: _as, className, ...inputProps } = props;
  return <input className={getYeonFieldClassName(className)} {...inputProps} />;
}
