import type { ReactNode } from "react";

import { YeonView } from "../../primitives/YeonView/index.native";
import {
  createYeonStyleSheet,
  isYeonWebPlatform,
  useYeonWindowDimensions,
} from "../../runtime/YeonBrowserRuntime/index.native";
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
  const isWeb = isYeonWebPlatform();

  if (!isWeb) {
    return children;
  }

  const { width, height } = useYeonWindowDimensions();
  const scale = Math.min(
    width / preview.width,
    height / preview.height,
    preview.transform.scaleMax
  );
  const previewWidth = preview.width * scale;
  const previewHeight = preview.height * scale;

  return (
    <YeonView style={[styles.webRoot, { width, height }]}>
      <YeonView
        style={[
          styles.webFrame,
          {
            width: previewWidth,
            height: previewHeight,
          },
        ]}
      >
        <YeonView
          style={[
            styles.webSafeArea,
            { width: previewWidth, height: previewHeight },
          ]}
        >
          {children}
        </YeonView>
      </YeonView>
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  webRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: yeonMobileWebPreview.style.containerBackground,
    padding: yeonMobileWebPreview.style.padding,
  },
  webFrame: {
    overflow: "hidden",
    borderRadius: yeonMobileWebPreview.style.frameRadius,
    borderWidth: yeonMobileWebPreview.style.frameBorderWidth,
    borderColor: yeonMobileWebPreview.style.frameBorderColor,
    backgroundColor: yeonMobileWebPreview.style.frameBackground,
  },
  webSafeArea: {
    backgroundColor: yeonMobileWebPreview.style.frameBackground,
    overflow: "hidden",
  },
});
