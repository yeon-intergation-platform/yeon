import { forwardRef } from "react";
import type { ImgHTMLAttributes } from "react";

export type YeonImageHandle = HTMLImageElement;
export type YeonImageProps = ImgHTMLAttributes<HTMLImageElement>;

export const YeonImage = forwardRef<YeonImageHandle, YeonImageProps>(
  function YeonImage({ loading = "lazy", decoding = "async", ...props }, ref) {
    return <img ref={ref} loading={loading} decoding={decoding} {...props} />;
  }
);
