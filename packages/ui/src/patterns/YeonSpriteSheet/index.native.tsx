import { YeonView } from "../../primitives/YeonView/index.native";
import type {
  YeonStyleProp,
  YeonViewStyle,
} from "../../runtime/YeonBrowserRuntime/index.native";

export type YeonSpriteSheetBox = YeonStyleProp<YeonViewStyle>;

export type YeonSpriteSheetProps = {
  box?: YeonSpriteSheetBox;
  className?: string;
  cols: number;
  frame: number;
  rows: number;
  src: string;
};

export function YeonSpriteSheet({ box }: YeonSpriteSheetProps) {
  return <YeonView accessibilityElementsHidden style={box} />;
}
