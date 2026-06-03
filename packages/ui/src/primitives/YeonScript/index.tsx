import NextScript from "next/script";
import type { ComponentProps } from "react";

export type YeonScriptProps = ComponentProps<typeof NextScript>;

export function YeonScript(props: YeonScriptProps) {
  return <NextScript {...props} />;
}
