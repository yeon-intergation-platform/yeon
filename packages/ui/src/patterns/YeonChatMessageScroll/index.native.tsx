import { forwardRef, type ReactNode } from "react";

import {
  YeonScrollView,
  type YeonScrollViewHandle,
  type YeonScrollViewProps,
} from "../../primitives/YeonScrollView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";

export type YeonChatMessageScrollProps = Pick<
  YeonScrollViewProps,
  "onContentSizeChange"
> & {
  children: ReactNode;
};

export const YeonChatMessageScroll = forwardRef<
  YeonScrollViewHandle,
  YeonChatMessageScrollProps
>(function YeonChatMessageScroll({ children, onContentSizeChange }, ref) {
  return (
    <YeonScrollView
      contentContainerStyle={styles.messages}
      onContentSizeChange={onContentSizeChange}
      ref={ref}
      style={styles.scroll}
    >
      {children}
    </YeonScrollView>
  );
});

const styles = createYeonStyleSheet({
  messages: {
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  scroll: {
    flex: 1,
  },
});
