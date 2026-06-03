import type { ReactNode } from "react";
import type { StyleProp, ViewProps, ViewStyle } from "react-native";
import { Text, View } from "react-native";

export type YeonTableProps = ViewProps & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};
export type YeonTableSectionProps = YeonTableProps;
export type YeonTableRowProps = YeonTableProps;
export type YeonTableHeaderCellProps = YeonTableProps;
export type YeonTableCellProps = YeonTableProps;

export function YeonTable({ style, ...props }: YeonTableProps) {
  return <View style={[{ width: "100%" }, style]} {...props} />;
}

export function YeonTableHead({ style, ...props }: YeonTableSectionProps) {
  return <View style={style} {...props} />;
}

export function YeonTableBody({ style, ...props }: YeonTableSectionProps) {
  return <View style={style} {...props} />;
}

export function YeonTableRow({ style, ...props }: YeonTableRowProps) {
  return <View style={[{ flexDirection: "row" }, style]} {...props} />;
}

export function YeonTableHeaderCell({
  children,
  style,
  ...props
}: YeonTableHeaderCellProps) {
  return (
    <View
      style={[
        {
          flex: 1,
          borderBottomWidth: 1,
          borderBottomColor: "#e5e5e5",
          padding: 10,
        },
        style,
      ]}
      {...props}
    >
      <Text style={{ color: "#111", fontSize: 13, fontWeight: "600" }}>
        {children}
      </Text>
    </View>
  );
}

export function YeonTableCell({
  children,
  style,
  ...props
}: YeonTableCellProps) {
  return (
    <View
      style={[
        {
          flex: 1,
          borderBottomWidth: 1,
          borderBottomColor: "#e5e5e5",
          padding: 10,
        },
        style,
      ]}
      {...props}
    >
      <Text style={{ color: "#666", fontSize: 14 }}>{children}</Text>
    </View>
  );
}
