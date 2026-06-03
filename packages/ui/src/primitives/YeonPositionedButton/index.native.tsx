import type { YeonButtonProps } from "../YeonButton/index.native";
import { YeonButton } from "../YeonButton/index.native";

export type YeonPositionedButtonProps = YeonButtonProps & {
  left: number;
  top: number;
};

export function YeonPositionedButton({
  left,
  top,
  style,
  ...props
}: YeonPositionedButtonProps) {
  return (
    <YeonButton
      style={[{ left, position: "absolute", top }, style]}
      {...props}
    />
  );
}
