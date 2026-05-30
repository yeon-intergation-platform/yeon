import { describe, expect, it } from "vitest";

import {
  CARD_EDITOR_IMAGE_DEFAULT_WIDTH,
  CARD_EDITOR_IMAGE_MAX_HEIGHT,
  CARD_EDITOR_IMAGE_MAX_WIDTH,
  CARD_EDITOR_IMAGE_MIN_HEIGHT,
  CARD_EDITOR_IMAGE_MIN_WIDTH,
  buildCardEditorMaxImageCountError,
  clampCardEditorImageHeight,
  clampCardEditorImageWidth,
  countCardEditorImages,
  getCardEditorFileExtension,
  parseCardEditorImageWidth,
  parseOptionalCardEditorImageHeight,
  validateCardEditorImageFile,
} from "./card-editor-image-utils";

describe("card-editor-image-utils", () => {
  it("이미지 width를 카드 에디터 범위로 보정한다", () => {
    expect(clampCardEditorImageWidth(50)).toBe(CARD_EDITOR_IMAGE_MIN_WIDTH);
    expect(clampCardEditorImageWidth(481.6)).toBe(482);
    expect(clampCardEditorImageWidth(999)).toBe(CARD_EDITOR_IMAGE_MAX_WIDTH);
  });

  it("유효하지 않은 width는 기본값으로 파싱한다", () => {
    expect(parseCardEditorImageWidth("abc")).toBe(
      CARD_EDITOR_IMAGE_DEFAULT_WIDTH
    );
    expect(parseCardEditorImageWidth(undefined)).toBe(
      CARD_EDITOR_IMAGE_DEFAULT_WIDTH
    );
    expect(parseCardEditorImageWidth("100")).toBe(CARD_EDITOR_IMAGE_MIN_WIDTH);
  });

  it("이미지 height를 카드 에디터 범위로 보정한다", () => {
    expect(clampCardEditorImageHeight(10)).toBe(CARD_EDITOR_IMAGE_MIN_HEIGHT);
    expect(clampCardEditorImageHeight(320.4)).toBe(320);
    expect(clampCardEditorImageHeight(99999)).toBe(
      CARD_EDITOR_IMAGE_MAX_HEIGHT
    );
  });

  it("명시 height가 없거나 비정상이면 null(=비율 유지 auto)로 파싱한다", () => {
    expect(parseOptionalCardEditorImageHeight(null)).toBeNull();
    expect(parseOptionalCardEditorImageHeight(undefined)).toBeNull();
    expect(parseOptionalCardEditorImageHeight("")).toBeNull();
    expect(parseOptionalCardEditorImageHeight("auto")).toBeNull();
    expect(parseOptionalCardEditorImageHeight(0)).toBeNull();
    expect(parseOptionalCardEditorImageHeight(-10)).toBeNull();
    expect(parseOptionalCardEditorImageHeight("320")).toBe(320);
    expect(parseOptionalCardEditorImageHeight(10)).toBe(
      CARD_EDITOR_IMAGE_MIN_HEIGHT
    );
  });

  it("본문 HTML 이미지 개수를 계산한다", () => {
    expect(countCardEditorImages("")).toBe(0);
    expect(
      countCardEditorImages('<p>a</p><img src="a" /><IMG src="b" />')
    ).toBe(2);
  });

  it("파일 확장자와 이미지 파일 검증 결과를 반환한다", () => {
    expect(getCardEditorFileExtension("sample.card.PNG")).toBe("png");
    expect(
      validateCardEditorImageFile({
        name: "sample.png",
        size: 1024,
        type: "image/png",
      } as File)
    ).toBeNull();
    expect(
      validateCardEditorImageFile({
        name: "sample.txt",
        size: 1024,
        type: "text/plain",
      } as File)
    ).toBe("이미지 파일만 업로드할 수 있습니다.");
    expect(
      validateCardEditorImageFile({
        name: "sample.svg",
        size: 1024,
        type: "image/svg+xml",
      } as File)
    ).toBe("JPG, PNG, WEBP, GIF, HEIC 이미지만 업로드할 수 있습니다.");
  });

  it("이미지 개수 제한 메시지를 단일 source of truth로 만든다", () => {
    expect(buildCardEditorMaxImageCountError()).toContain("최대 20개");
  });
});
