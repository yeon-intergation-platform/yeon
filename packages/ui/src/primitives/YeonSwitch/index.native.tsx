import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Pressable, View } from "react-native";

import { getYeonSwitchNativeStyle } from "./variants";

export { getYeonSwitchNativeStyle } from "./variants";

export type YeonSwitchProps = Omit<
  PressableProps,
  "children" | "onPress" | "style"
> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  thumbStyle?: StyleProp<ViewStyle>;
};

export function YeonSwitch({
  accessibilityState,
  checked = false,
  disabled,
  onCheckedChange,
  onPress,
  style,
  thumbStyle,
  ...props
}: YeonSwitchProps) {
  const isDisabled = Boolean(disabled);
  const styles = getYeonSwitchNativeStyle({ checked, disabled: isDisabled });

  function handlePress(event: GestureResponderEvent) {
    onPress?.(event);

    if (isDisabled) {
      return;
    }

    onCheckedChange?.(!checked);
  }

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{
        ...accessibilityState,
        checked,
        disabled: isDisabled,
      }}
      disabled={isDisabled}
      onPress={handlePress}
      style={[styles.track, style]}
      {...props}
    >
      <View style={[styles.thumb, thumbStyle]} />
    </Pressable>
  );
}
