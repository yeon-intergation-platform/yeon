"use client";
import { YeonView } from "@yeon/ui";
export function RevealSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <YeonView as="section" className={className}>
      {children}
    </YeonView>
  );
}
