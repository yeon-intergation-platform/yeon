"use client";
import {
  forwardRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useImperativeHandle,
  useRef,
} from "react";

// 웹 구현: 모바일 가상화가 본 목표이므로 웹은 실제 windowing 없이 map 렌더로 충분하다.
// native FlatList API와 호환되는 props subset만 받아 <div>로 렌더한다.
type RenderItemInfo<ItemT> = { item: ItemT; index: number };

type ListComponent = ReactElement | (() => ReactElement | null) | null;

export type YeonFlatListProps<ItemT = unknown> = {
  data?: readonly ItemT[] | null;
  renderItem?: (info: RenderItemInfo<ItemT>) => ReactNode;
  keyExtractor?: (item: ItemT, index: number) => string;
  ListHeaderComponent?: ListComponent;
  ListFooterComponent?: ListComponent;
  ListEmptyComponent?: ListComponent;
  inverted?: boolean;
  contentContainerStyle?: CSSProperties;
  style?: CSSProperties;
  // native 전용 props는 받기만 하고 웹에서는 무시한다(시그니처 호환용).
  initialNumToRender?: number;
  windowSize?: number;
  keyboardShouldPersistTaps?: unknown;
};

export type YeonFlatListHandle<_ItemT = unknown> = {
  scrollToEnd: (params?: { animated?: boolean }) => void;
};

function renderListComponent(component: ListComponent | undefined): ReactNode {
  if (component === null || component === undefined) {
    return null;
  }
  if (typeof component === "function") {
    return component();
  }
  return component;
}

function YeonFlatListInner<ItemT>(
  {
    data,
    renderItem,
    keyExtractor,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
    inverted = false,
    contentContainerStyle,
    style,
    initialNumToRender: _initialNumToRender,
    windowSize: _windowSize,
    keyboardShouldPersistTaps: _keyboardShouldPersistTaps,
  }: YeonFlatListProps<ItemT>,
  ref: React.ForwardedRef<YeonFlatListHandle<ItemT>>
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      scrollToEnd: () => {
        const node = containerRef.current;
        if (!node) {
          return;
        }
        // inverted면 시각적 끝(최신 항목)은 스크롤 top, 아니면 bottom.
        node.scrollTop = inverted ? 0 : node.scrollHeight;
      },
    }),
    [inverted]
  );

  const items = data ?? [];
  const isEmpty = items.length === 0;

  const containerStyle: CSSProperties = {
    overflowY: "auto",
    ...style,
  };

  const contentStyle: CSSProperties = {
    display: "flex",
    flexDirection: inverted ? "column-reverse" : "column",
    ...contentContainerStyle,
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      {renderListComponent(ListHeaderComponent)}
      {isEmpty ? (
        renderListComponent(ListEmptyComponent)
      ) : (
        <div style={contentStyle}>
          {items.map((item, index) => (
            <div key={keyExtractor ? keyExtractor(item, index) : String(index)}>
              {renderItem ? renderItem({ item, index }) : null}
            </div>
          ))}
        </div>
      )}
      {renderListComponent(ListFooterComponent)}
    </div>
  );
}

export const YeonFlatList = forwardRef(YeonFlatListInner) as <ItemT>(
  props: YeonFlatListProps<ItemT> & {
    ref?: React.ForwardedRef<YeonFlatListHandle<ItemT>>;
  }
) => ReturnType<typeof YeonFlatListInner>;
