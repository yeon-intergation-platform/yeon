import { forwardRef } from "react";
import type { DialogHTMLAttributes, ReactNode } from "react";

export type YeonModalHandle = HTMLDialogElement;
export type YeonModalProps = Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  "open"
> & {
  children?: ReactNode;
  onRequestClose?: () => void;
  transparent?: boolean;
  visible?: boolean;
};

export const YeonModal = forwardRef<YeonModalHandle, YeonModalProps>(
  function YeonModal(
    {
      children,
      onRequestClose,
      transparent: _transparent,
      visible = false,
      ...props
    },
    ref
  ) {
    if (!visible) return null;

    return (
      <dialog ref={ref} open onCancel={onRequestClose} {...props}>
        {children}
      </dialog>
    );
  }
);
