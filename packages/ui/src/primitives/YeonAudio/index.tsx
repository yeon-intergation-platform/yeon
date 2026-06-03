import { forwardRef } from "react";
import type { AudioHTMLAttributes } from "react";

export type YeonAudioHandle = HTMLAudioElement;
export type YeonAudioProps = AudioHTMLAttributes<HTMLAudioElement>;

export const YeonAudio = forwardRef<YeonAudioHandle, YeonAudioProps>(
  function YeonAudio(props, ref) {
    return <audio ref={ref} {...props} />;
  }
);
