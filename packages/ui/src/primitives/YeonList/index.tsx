import type { HTMLAttributes } from "react";

import { joinClassNames } from "../../utils";

export type YeonListProps = HTMLAttributes<
  HTMLUListElement | HTMLOListElement
> & {
  as?: "ul" | "ol";
};

export type YeonListItemProps = HTMLAttributes<HTMLLIElement>;

export function YeonList({
  as: Component = "ul",
  className,
  ...props
}: YeonListProps) {
  return <Component className={joinClassNames(className)} {...props} />;
}

export function YeonListItem({ className, ...props }: YeonListItemProps) {
  return <li className={joinClassNames(className)} {...props} />;
}
