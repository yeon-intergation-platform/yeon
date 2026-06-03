import type { ReactNode } from "react";

import { YeonView } from "../../primitives/YeonView";

export type YeonBottomSheetFormProps = {
  children: ReactNode;
};

export function YeonBottomSheetForm({ children }: YeonBottomSheetFormProps) {
  return (
    <YeonView className="grid gap-[22px] pb-[34px] pt-[26px]">
      {children}
    </YeonView>
  );
}
