import type { CSSProperties, ReactNode } from "react";

import { YeonView } from "../../primitives/YeonView";
import { useYeonWindowDimensions } from "../../runtime/YeonBrowserRuntime";
import { yeonMobileWebPreview } from "../../theme";

export type YeonMobileWebPreviewConfig = typeof yeonMobileWebPreview;

export type YeonMobileWebFrameProps = {
  children: ReactNode;
  preview?: YeonMobileWebPreviewConfig;
};

export function YeonMobileWebFrame({
  children,
  preview = yeonMobileWebPreview,
}: YeonMobileWebFrameProps) {
  const { width, height } = useYeonWindowDimensions();
  const scale = Math.min(
    width / preview.width,
    height / preview.height,
    preview.transform.scaleMax
  );
  const previewWidth = preview.width * scale;
  const previewHeight = preview.height * scale;

  return (
    <YeonView style={{ ...webRootStyle, width, height }}>
      <YeonView
        style={{
          ...webFrameStyle,
          width: previewWidth,
          height: previewHeight,
        }}
      >
        <YeonView
          style={{
            ...webSafeAreaStyle,
            width: previewWidth,
            height: previewHeight,
          }}
        >
          {children}
        </YeonView>
      </YeonView>
    </YeonView>
  );
}

const webRootStyle: CSSProperties = {
  alignItems: "center",
  backgroundColor: yeonMobileWebPreview.style.containerBackground,
  display: "flex",
  flex: 1,
  justifyContent: "center",
  padding: yeonMobileWebPreview.style.padding,
};

const webFrameStyle: CSSProperties = {
  backgroundColor: yeonMobileWebPreview.style.frameBackground,
  borderColor: yeonMobileWebPreview.style.frameBorderColor,
  borderRadius: yeonMobileWebPreview.style.frameRadius,
  borderStyle: "solid",
  borderWidth: yeonMobileWebPreview.style.frameBorderWidth,
  overflow: "hidden",
};

const webSafeAreaStyle: CSSProperties = {
  backgroundColor: yeonMobileWebPreview.style.frameBackground,
  overflow: "hidden",
};
