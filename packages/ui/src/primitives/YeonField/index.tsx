import { forwardRef } from "react";

import type { YeonFieldWebProps } from "./types";
import { getYeonFieldClassName } from "./variants";

export type { YeonFieldWebProps as YeonFieldProps } from "./types";
export { getYeonFieldClassName, YEON_FIELD_BASE_CLASS } from "./variants";

export const YeonField = forwardRef<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  YeonFieldWebProps
>(function YeonField(props, ref) {
  if (props.as === "textarea") {
    const { as: _as, className, ...textareaProps } = props;
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        className={getYeonFieldClassName(className)}
        {...textareaProps}
      />
    );
  }

  if (props.as === "select") {
    const { as: _as, className, ...selectProps } = props;
    return (
      <select
        ref={ref as React.Ref<HTMLSelectElement>}
        className={getYeonFieldClassName(className)}
        {...selectProps}
      />
    );
  }

  const { as: _as, className, ...inputProps } = props;
  return (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      className={getYeonFieldClassName(className)}
      {...inputProps}
    />
  );
});
