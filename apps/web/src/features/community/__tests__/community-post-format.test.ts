import { describe, expect, it } from "vitest";
import {
  parseCommunityPost,
  serializeCommunityPost,
} from "../community-post-format";

describe("community post format", () => {
  it("카테고리, 제목, 본문을 저장 포맷으로 직렬화하고 다시 분리한다", () => {
    const body = serializeCommunityPost({
      category: "카드친구 모집",
      title: "복습 친구 구합니다",
      content: "평일 저녁에 카드 복습해요.",
    });

    expect(body).toBe(
      "[카드친구 모집] 복습 친구 구합니다\n평일 저녁에 카드 복습해요."
    );
    expect(parseCommunityPost({ body })).toEqual({
      category: "카드친구 모집",
      title: "복습 친구 구합니다",
      content: "평일 저녁에 카드 복습해요.",
    });
  });

  it("본문만 수정해도 기존 카테고리와 제목을 보존해 저장한다", () => {
    const currentDraft = parseCommunityPost({
      body: "[타자친구 모집] 밤 레이스 구합니다\n원래 본문",
    });

    const nextBody = serializeCommunityPost({
      ...currentDraft,
      content: "수정한 본문",
    });

    expect(nextBody).toBe("[타자친구 모집] 밤 레이스 구합니다\n수정한 본문");
  });
});
