import { forwardRef } from "react";
import type { ElementRef } from "react";
import type { ModalProps } from "react-native";
import { Modal } from "react-native";

export type YeonModalHandle = ElementRef<typeof Modal>;
export type YeonModalProps = ModalProps;

export const YeonModal = forwardRef<YeonModalHandle, YeonModalProps>(
  function YeonModal(props, ref) {
    return <Modal ref={ref} {...props} />;
  }
);
