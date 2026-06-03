import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export type YeonFieldWebProps =
  | ({ as?: "input" } & InputHTMLAttributes<HTMLInputElement>)
  | ({ as: "textarea" } & TextareaHTMLAttributes<HTMLTextAreaElement>)
  | ({ as: "select" } & SelectHTMLAttributes<HTMLSelectElement>);
