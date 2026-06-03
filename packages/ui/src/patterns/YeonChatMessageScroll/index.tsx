import { forwardRef, type ReactNode } from "react";

import {
  YeonScrollView,
  type YeonScrollViewHandle,
} from "../../primitives/YeonScrollView";
import { YeonView } from "../../primitives/YeonView";

export type YeonChatMessageScrollProps = {
  children: ReactNode;
  onContentSizeChange?: () => void;
};

export const YeonChatMessageScroll = forwardRef<
  YeonScrollViewHandle,
  YeonChatMessageScrollProps
>(function YeonChatMessageScroll(
  { children, onContentSizeChange: _onContentSizeChange },
  ref
) {
  return (
    <YeonScrollView className="flex-1 overflow-y-auto" ref={ref}>
      <YeonView className="grid gap-3 px-[18px] pb-6 pt-[18px]">
        {children}
      </YeonView>
    </YeonScrollView>
  );
});
