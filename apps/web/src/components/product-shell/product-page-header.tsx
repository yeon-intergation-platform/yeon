import type { ReactNode } from "react";
import { YeonText, YeonView } from "@yeon/ui";

export const PRODUCT_PAGE_HEADER_CLASS = {
  copy: "max-w-[680px]",
  title: "text-[27px] font-black tracking-[-0.04em] text-[#111] md:text-[34px]",
  description: "mt-3 text-[14px] leading-[1.75] text-[#666] md:text-[15px]",
} as const;

type ProductPageHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  trailingClassName?: string;
};

export function ProductPageHeader({
  eyebrow,
  title,
  description,
  trailing,
  trailingClassName,
}: ProductPageHeaderProps) {
  return (
    <YeonView
      as="section"
      className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
    >
      <YeonView className={`min-w-0 ${PRODUCT_PAGE_HEADER_CLASS.copy}`}>
        {eyebrow ? (
          <YeonView className="mb-2 flex items-center gap-2 text-[13px] font-bold text-[#111]">
            {eyebrow}
          </YeonView>
        ) : null}
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className={`${PRODUCT_PAGE_HEADER_CLASS.title} break-keep`}
        >
          {title}
        </YeonText>
        {description ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`${PRODUCT_PAGE_HEADER_CLASS.description} break-keep`}
          >
            {description}
          </YeonText>
        ) : null}
      </YeonView>

      {trailing ? (
        <YeonView
          className={
            trailingClassName ? `min-w-0 ${trailingClassName}` : "min-w-0"
          }
        >
          {trailing}
        </YeonView>
      ) : null}
    </YeonView>
  );
}
