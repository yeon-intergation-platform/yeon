import type { ReactNode } from "react";

import { YeonView } from "../../primitives/YeonView";

export type YeonChatComposerProps = {
  children: ReactNode;
};

export function YeonChatComposer({ children }: YeonChatComposerProps) {
  return (
    <YeonView className="grid gap-3 border-t border-[#e5e5e5] p-[18px]">
      {children}
    </YeonView>
  );
}
