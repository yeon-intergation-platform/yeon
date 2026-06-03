import type { CSSProperties } from "react";

import { YeonView } from "../../primitives/YeonView";

export type YeonSpriteSheetBoxValue = CSSProperties["left"];

export type YeonSpriteSheetBox = {
  bottom?: YeonSpriteSheetBoxValue;
  filter?: CSSProperties["filter"];
  height?: YeonSpriteSheetBoxValue;
  left?: YeonSpriteSheetBoxValue;
  opacity?: CSSProperties["opacity"];
  right?: YeonSpriteSheetBoxValue;
  top?: YeonSpriteSheetBoxValue;
  transform?: CSSProperties["transform"];
  transformOrigin?: CSSProperties["transformOrigin"];
  width?: YeonSpriteSheetBoxValue;
};

export type YeonSpriteSheetProps = {
  box?: YeonSpriteSheetBox;
  className?: string;
  cols: number;
  frame: number;
  rows: number;
  src: string;
};

export function YeonSpriteSheet({
  box,
  className = "",
  cols,
  frame,
  rows,
  src,
}: YeonSpriteSheetProps) {
  const col = frame % cols;
  const row = Math.floor(frame / cols);
  const x = cols === 1 ? 0 : (col / (cols - 1)) * 100;
  const y = rows === 1 ? 0 : (row / (rows - 1)) * 100;

  return (
    <YeonView
      as="span"
      aria-hidden="true"
      className={`block bg-no-repeat [image-rendering:pixelated] ${className}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundPosition: `${x}% ${y}%`,
        backgroundSize: `${cols * 100}% ${rows * 100}%`,
        ...box,
      }}
    />
  );
}
