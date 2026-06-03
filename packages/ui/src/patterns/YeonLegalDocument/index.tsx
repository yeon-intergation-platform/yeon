import type { ReactNode } from "react";

import { YeonLink, type YeonLinkProps } from "../../primitives/YeonLink";
import { YeonList, type YeonListProps } from "../../primitives/YeonList";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonLegalDocumentPageProps = {
  children: ReactNode;
  lastUpdated: string;
  title: string;
};

export type YeonLegalSectionProps = {
  children: ReactNode;
  title: string;
};

export type YeonLegalListProps = YeonListProps;

export type YeonLegalLinkProps = YeonLinkProps;

export function YeonLegalDocumentPage({
  children,
  lastUpdated,
  title,
}: YeonLegalDocumentPageProps) {
  return (
    <YeonView className="mx-auto max-w-[760px] px-6 py-20 font-sans leading-[1.8] text-[#111]">
      <YeonText
        as="h1"
        variant="unstyled"
        tone="inherit"
        className="mb-2 text-[28px] font-bold tracking-[-0.02em]"
      >
        {title}
      </YeonText>
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="mb-12 text-[14px] text-[#aaa]"
      >
        최종 수정일: {lastUpdated}
      </YeonText>
      {children}
    </YeonView>
  );
}

export function YeonLegalSection({ children, title }: YeonLegalSectionProps) {
  return (
    <YeonView as="section" className="mb-10">
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="mb-3 border-b border-[#e5e5e5] pb-2 text-[17px] font-bold tracking-[-0.01em]"
      >
        {title}
      </YeonText>
      <YeonView className="text-[15px] text-[#666]">{children}</YeonView>
    </YeonView>
  );
}

export function YeonLegalList({ className, ...props }: YeonLegalListProps) {
  return (
    <YeonList
      className={joinClassNames("my-2 list-disc pl-5", className)}
      {...props}
    />
  );
}

export function YeonLegalLink({ className, ...props }: YeonLegalLinkProps) {
  return (
    <YeonLink
      className={joinClassNames(
        "font-semibold text-[#111] underline underline-offset-4",
        className
      )}
      {...props}
    />
  );
}
