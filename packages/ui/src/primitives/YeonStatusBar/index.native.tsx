import { StatusBar } from "expo-status-bar";
import type { StatusBarProps } from "expo-status-bar";

export type YeonStatusBarProps = StatusBarProps & {
  tone?: StatusBarProps["style"];
};

export function YeonStatusBar({ tone, style, ...props }: YeonStatusBarProps) {
  return <StatusBar style={tone ?? style} {...props} />;
}
