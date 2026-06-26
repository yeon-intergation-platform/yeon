import { describe, expect, it } from "vitest";
import {
  COMMUNITY_CHAT_MESSAGE_MAX_LENGTH,
  COMMUNITY_POST_CONTENT_MAX_LENGTH,
  COMMUNITY_POST_TITLE_MAX_LENGTH,
  COMMUNITY_REPLY_CONTENT_MAX_LENGTH,
  canSendCommunityChatMessage,
  canSubmitCommunityPostDraft,
  canSubmitCommunityReplyDraft,
  normalizeCommunityChatMessageDraft,
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

  it("게시글 작성 가능 상태를 제목, 본문, 제출 중, 길이 경계로 판정한다", () => {
    expect(
      canSubmitCommunityPostDraft({
        title: "모집",
        content: "본문",
        isSubmitting: false,
      })
    ).toBe(true);
    expect(
      canSubmitCommunityPostDraft({
        title: " ",
        content: "본문",
        isSubmitting: false,
      })
    ).toBe(false);
    expect(
      canSubmitCommunityPostDraft({
        title: "모집",
        content: "본문",
        isSubmitting: true,
      })
    ).toBe(false);
    expect(
      canSubmitCommunityPostDraft({
        title: "가".repeat(COMMUNITY_POST_TITLE_MAX_LENGTH + 1),
        content: "본문",
        isSubmitting: false,
      })
    ).toBe(false);
    expect(
      canSubmitCommunityPostDraft({
        title: "모집",
        content: "가".repeat(COMMUNITY_POST_CONTENT_MAX_LENGTH + 1),
        isSubmitting: false,
      })
    ).toBe(false);
  });

  it("댓글 작성 가능 상태를 본문, 제출 중, 길이 경계로 판정한다", () => {
    expect(
      canSubmitCommunityReplyDraft({
        replyDraft: "참여할게요",
        isSubmitting: false,
      })
    ).toBe(true);
    expect(
      canSubmitCommunityReplyDraft({
        replyDraft: " ",
        isSubmitting: false,
      })
    ).toBe(false);
    expect(
      canSubmitCommunityReplyDraft({
        replyDraft: "참여할게요",
        isSubmitting: true,
      })
    ).toBe(false);
    expect(
      canSubmitCommunityReplyDraft({
        replyDraft: "가".repeat(COMMUNITY_REPLY_CONTENT_MAX_LENGTH + 1),
        isSubmitting: false,
      })
    ).toBe(false);
  });

  it("채팅 전송 가능 상태를 본문, 전송 중, 길이 경계로 판정한다", () => {
    expect(
      canSendCommunityChatMessage({
        messageBody: "안녕하세요",
        isSendingMessage: false,
      })
    ).toBe(true);
    expect(
      canSendCommunityChatMessage({
        messageBody: " ",
        isSendingMessage: false,
      })
    ).toBe(false);
    expect(
      canSendCommunityChatMessage({
        messageBody: "안녕하세요",
        isSendingMessage: true,
      })
    ).toBe(false);
    expect(
      canSendCommunityChatMessage({
        messageBody: "가".repeat(COMMUNITY_CHAT_MESSAGE_MAX_LENGTH + 1),
        isSendingMessage: false,
      })
    ).toBe(false);
    expect(
      canSendCommunityChatMessage({
        messageBody: ` ${"가".repeat(COMMUNITY_CHAT_MESSAGE_MAX_LENGTH)} `,
        isSendingMessage: false,
      })
    ).toBe(true);
    expect(normalizeCommunityChatMessageDraft("  안녕하세요  ")).toBe(
      "안녕하세요"
    );
  });
});
