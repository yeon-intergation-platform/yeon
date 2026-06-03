import { YeonView } from "../YeonView";

export type YeonSpriteFrameProps = {
  className?: string;
  displayHeight: number;
  frameCols: number;
  frameCount: number;
  frameHeight: number;
  frameIndex: number;
  frameWidth: number;
  source: string;
};

export function getYeonSpriteFrameMetrics({
  displayHeight,
  frameCols,
  frameCount,
  frameHeight,
  frameIndex,
  frameWidth,
}: Omit<YeonSpriteFrameProps, "className" | "source">) {
  const scale = displayHeight / frameHeight;
  const displayWidth = Math.round(frameWidth * scale);
  const sheetRows = Math.max(1, Math.ceil(frameCount / frameCols));
  const col = frameIndex % frameCols;
  const row = Math.floor(frameIndex / frameCols);

  return {
    col,
    displayHeight,
    displayWidth,
    row,
    sheetRows,
  };
}

export function YeonSpriteFrame(props: YeonSpriteFrameProps) {
  const { className, frameCols, source } = props;
  const { col, displayHeight, displayWidth, row, sheetRows } =
    getYeonSpriteFrameMetrics(props);

  return (
    <YeonView
      aria-hidden
      className={className}
      style={{
        width: displayWidth,
        height: displayHeight,
        backgroundImage: `url('${source}')`,
        backgroundSize: `${displayWidth * frameCols}px ${displayHeight * sheetRows}px`,
        backgroundPosition: `-${col * displayWidth}px -${row * displayHeight}px`,
        imageRendering: "pixelated",
        flexShrink: 0,
      }}
    />
  );
}
