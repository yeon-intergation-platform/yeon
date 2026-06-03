import { forwardRef } from "react";
import type { CanvasHTMLAttributes } from "react";

export type YeonCanvasHandle = HTMLCanvasElement;
export type YeonCanvasProps = CanvasHTMLAttributes<HTMLCanvasElement>;

export const YeonCanvas = forwardRef<YeonCanvasHandle, YeonCanvasProps>(
  function YeonCanvas(props, ref) {
    return <canvas ref={ref} {...props} />;
  }
);
