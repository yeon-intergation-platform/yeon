import { forwardRef } from "react";
import type { FlatListProps } from "react-native";
import { FlatList } from "react-native";

// 모바일 가상화 리스트 프리미티브. react-native FlatList를 그대로 감싸
// 긴 목록을 windowing으로 렌더한다(scrollToEnd/inverted 등 메서드·prop 그대로 노출).
export type YeonFlatListHandle<ItemT = unknown> = FlatList<ItemT>;
export type YeonFlatListProps<ItemT = unknown> = FlatListProps<ItemT>;

function YeonFlatListInner<ItemT>(
  props: YeonFlatListProps<ItemT>,
  ref: React.ForwardedRef<FlatList<ItemT>>
) {
  return <FlatList ref={ref} {...props} />;
}

export const YeonFlatList = forwardRef(YeonFlatListInner) as <ItemT>(
  props: YeonFlatListProps<ItemT> & {
    ref?: React.ForwardedRef<YeonFlatListHandle<ItemT>>;
  }
) => ReturnType<typeof YeonFlatListInner>;
