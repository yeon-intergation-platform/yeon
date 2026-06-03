import NextLink from "next/link";
import type { ComponentProps } from "react";

export type YeonLinkProps = ComponentProps<typeof NextLink>;

export function YeonLink(props: YeonLinkProps) {
  return <NextLink {...props} />;
}
