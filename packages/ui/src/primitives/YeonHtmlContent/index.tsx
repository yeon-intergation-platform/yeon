import { forwardRef } from "react";
import type { YeonViewProps } from "../YeonView";
import { YeonView } from "../YeonView";

export type YeonHtmlContentProps = Omit<
  YeonViewProps,
  "children" | "dangerouslySetInnerHTML"
> & {
  html: string;
};

export const YeonHtmlContent = forwardRef<HTMLElement, YeonHtmlContentProps>(
  function YeonHtmlContent({ html, ...props }, ref) {
    return (
      <YeonView
        ref={ref}
        {...props}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
);
