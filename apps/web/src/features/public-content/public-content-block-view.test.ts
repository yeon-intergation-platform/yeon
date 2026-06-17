import { describe, expect, it } from "vitest";
import {
  getPublicContentCodeBlockLabel,
  getPublicContentImageAspectRatioStyle,
} from "./public-content-block-style";

describe("public content block view helpers", () => {
  it("이미지 width와 height로 aspect ratio를 고정한다", () => {
    expect(
      getPublicContentImageAspectRatioStyle({ height: 900, width: 1600 })
    ).toEqual({
      aspectRatio: "1600 / 900",
    });
  });

  it("잘못된 이미지 크기는 style을 만들지 않는다", () => {
    expect(
      getPublicContentImageAspectRatioStyle({ height: 0, width: 1600 })
    ).toEqual({});
  });

  it("code block label은 파일명과 언어를 함께 보여준다", () => {
    expect(
      getPublicContentCodeBlockLabel({
        filename: "sitemap-targets.txt",
        language: "txt",
      })
    ).toBe("sitemap-targets.txt · txt");
  });
});
