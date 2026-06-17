import { describe, expect, it } from "vitest";
import {
  getPublicContentCodeBlockLabel,
  getPublicContentCalloutStyle,
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

  it("callout tone이 없으면 기본 note 스타일을 사용한다", () => {
    expect(getPublicContentCalloutStyle()).toMatchObject({
      containerClassName: "border-[#e5e5e5] bg-[#fafafa]",
      titleClassName: "text-[#111]",
      textClassName: "text-[#666]",
    });
  });

  it("warning callout은 빨간색이 아닌 조용한 주의 스타일을 사용한다", () => {
    const style = getPublicContentCalloutStyle("warning");

    expect(style.containerClassName).toBe("border-[#e7d9b8] bg-[#fffaf0]");
    expect(Object.values(style).join(" ")).not.toContain("red");
  });

  it("success callout은 조용한 녹색 스타일을 사용한다", () => {
    const style = getPublicContentCalloutStyle("success");

    expect(style.containerClassName).toBe("border-[#cfe3d6] bg-[#f3faf5]");
    expect(style.titleClassName).toBe("text-[#245c39]");
  });
});
