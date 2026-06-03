import type { YeonButtonProps } from "../YeonButton";
import { YeonButton } from "../YeonButton";

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
  return <YeonButton style={{ left, top, ...style }} {...props} />;
}
