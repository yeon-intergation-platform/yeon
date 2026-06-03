import { forwardRef } from "react";
import type { ImageProps } from "react-native";
import { Image } from "react-native";

export type YeonImageHandle = Image;
export type YeonImageProps = ImageProps;

export const YeonImage = forwardRef<YeonImageHandle, YeonImageProps>(
  function YeonImage(props, ref) {
    return <Image ref={ref} {...props} />;
  }
);
