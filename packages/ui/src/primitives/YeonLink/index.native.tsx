import { Link } from "expo-router";
import type { ComponentProps } from "react";

export type YeonLinkProps = ComponentProps<typeof Link>;

export function YeonLink(props: YeonLinkProps) {
  return <Link {...props} />;
}
