import { forwardRef } from "react";
import type { ImgHTMLAttributes } from "react";

export type YeonImageHandle = HTMLImageElement;
export type YeonImageProps = ImgHTMLAttributes<HTMLImageElement>;

export const YeonImage = forwardRef<YeonImageHandle, YeonImageProps>(
  function YeonImage(props, ref) {
    return <img ref={ref} {...props} />;
  }
);
