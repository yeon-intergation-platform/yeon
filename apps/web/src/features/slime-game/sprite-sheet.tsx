import { SLIME_GAME_ASSETS } from "./asset-manifest";

export function SpriteSheet({
  src,
  cols,
  rows,
  frame,
  className = "",
  style,
}: {
  src: string;
  cols: number;
  rows: number;
  frame: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const col = frame % cols;
  const row = Math.floor(frame / cols);
  const x = cols === 1 ? 0 : (col / (cols - 1)) * 100;
  const y = rows === 1 ? 0 : (row / (rows - 1)) * 100;

  return (
    <span
      aria-hidden="true"
      className={`block bg-no-repeat [image-rendering:pixelated] ${className}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: `${cols * 100}% ${rows * 100}%`,
        backgroundPosition: `${x}% ${y}%`,
        ...style,
      }}
    />
  );
}

export function tileSprite(frame: number, className = "") {
  return (
    <SpriteSheet
      src={SLIME_GAME_ASSETS.forestTiles}
      cols={5}
      rows={3}
      frame={frame}
      className={`h-8 w-8 ${className}`}
    />
  );
}

export function propSprite(frame: number, className = "") {
  return (
    <SpriteSheet
      src={SLIME_GAME_ASSETS.props}
      cols={4}
      rows={4}
      frame={frame}
      className={`h-8 w-8 ${className}`}
    />
  );
}
