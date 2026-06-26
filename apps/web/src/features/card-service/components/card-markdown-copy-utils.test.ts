import { describe, expect, it } from "vitest";
import { buildCardMarkdownCopyErrorMessage } from "./card-markdown-copy-utils";

describe("buildCardMarkdownCopyErrorMessage", () => {
  it("copies the target label, length, and recovery guidance into one message policy", () => {
    expect(
      buildCardMarkdownCopyErrorMessage({
        targetLabel: "코드 블록",
        codeLength: 42,
      })
    ).toBe(
      "코드 블록 클립보드 복사에 실패했습니다. 복사 대상 길이: 42자. 브라우저 클립보드 권한 또는 보안 컨텍스트를 확인해 주세요."
    );
  });
});
