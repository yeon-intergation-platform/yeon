import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Settings } from "lucide-react";

type ProductHeaderProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  as?: "header" | "nav";
  ariaLabel?: string;
};

const PRODUCT_HEADER_FRAME_CLASS =
  "h-[61px] border-b border-[#e5e5e5] bg-white px-6 py-3 md:px-12";
const PRODUCT_HEADER_INNER_BASE_CLASS = "mx-auto h-full max-w-[1400px]";
const PRODUCT_HEADER_INNER_DEFAULT_LAYOUT_CLASS =
  "flex items-center justify-between gap-3";

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function ProductHeader({
  children,
  className,
  innerClassName,
  as = "header",
  ariaLabel,
}: ProductHeaderProps) {
  const frameClassName = joinClassNames(PRODUCT_HEADER_FRAME_CLASS, className);
  const content = (
    <div
      className={joinClassNames(
        PRODUCT_HEADER_INNER_BASE_CLASS,
        innerClassName ?? PRODUCT_HEADER_INNER_DEFAULT_LAYOUT_CLASS
      )}
    >
      {children}
    </div>
  );

  if (as === "nav") {
    return (
      <nav aria-label={ariaLabel} className={frameClassName}>
        {content}
      </nav>
    );
  }

  return <header className={frameClassName}>{content}</header>;
}

export function ProductHeaderSettingsButton({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      className={joinClassNames(
        "flex items-center justify-center rounded-lg border border-[#e5e5e5] bg-white p-2 text-[#888] transition-colors hover:border-[#aaa] hover:text-[#111]",
        className
      )}
      {...props}
    >
      {children ?? <Settings size={15} />}
    </button>
  );
}
