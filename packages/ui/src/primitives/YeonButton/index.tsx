import { getYeonButtonClassName } from "./variants";
import type { YeonButtonWebProps } from "./types";

export type {
  YeonButtonSize,
  YeonButtonVariant,
  YeonButtonWebProps as YeonButtonProps,
} from "./types";
export {
  getYeonButtonClassName,
  yeonButtonWebSizes,
  yeonButtonWebVariants,
} from "./variants";

export function YeonButton(props: YeonButtonWebProps) {
  if (props.as === "a") {
    const { variant, size, className, as: _as, ...anchorProps } = props;
    return (
      <a
        className={getYeonButtonClassName({ variant, size, className })}
        {...anchorProps}
      />
    );
  }

  const { variant, size, className, as: _as, ...buttonProps } = props;
  return (
    <button
      className={getYeonButtonClassName({ variant, size, className })}
      {...buttonProps}
    />
  );
}
