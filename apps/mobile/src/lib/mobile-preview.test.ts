import { describe, expect, it } from "vitest";
import { yeonColors } from "@yeon/design-tokens";
import {
  MOBILE_WEB_PREVIEW,
  MOBILE_WEB_PREVIEW_WIDTH,
  MOBILE_WEB_PREVIEW_HEIGHT,
  type MobileWebPreviewConfig,
} from "./mobile-preview";

describe("mobile-preview", () => {
  it("iPhone 14 Pro 기준 프리뷰 사양이 한 곳에서 관리된다", () => {
    expect(MOBILE_WEB_PREVIEW_WIDTH).toBe(393);
    expect(MOBILE_WEB_PREVIEW_HEIGHT).toBe(852);
    expect(MOBILE_WEB_PREVIEW.width).toBe(MOBILE_WEB_PREVIEW_WIDTH);
    expect(MOBILE_WEB_PREVIEW.height).toBe(MOBILE_WEB_PREVIEW_HEIGHT);
  });

  it("iPhone 14 Pro 기준 스케일 정책과 프레임 설정이 중앙 정렬 미리보기를 지원한다", () => {
    expect(MOBILE_WEB_PREVIEW.transform.scaleMax).toBe(1);
    expect(MOBILE_WEB_PREVIEW.style.frameRadius).toBe(32);
    expect(MOBILE_WEB_PREVIEW.style.frameBorderWidth).toBe(1);
    expect(MOBILE_WEB_PREVIEW.style.containerBackground).toBe(
      yeonColors.neutral[50]
    );
    expect(MOBILE_WEB_PREVIEW.style.frameBackground).toBe(yeonColors.white);
  });

  it("타입은 단일 source-of-truth 객체 타입으로 고정된다", () => {
    const config: MobileWebPreviewConfig = MOBILE_WEB_PREVIEW;
    expect(config.style.frameBackground).toBe(yeonColors.white);
  });
});
