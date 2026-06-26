import { beforeEach, describe, expect, it, vi } from "vitest";

const COMMENT_ID = "11111111-1111-4111-8111-111111111111";

const mocks = vi.hoisted(() => ({
  revealGameComment: vi.fn(),
}));

vi.mock("@/server/game-comments-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/game-comments-spring-client")
  >("@/server/game-comments-spring-client");
  return {
    ...actual,
    revealGameComment: (...args: unknown[]) => mocks.revealGameComment(...args),
  };
});

import { GameCommentRequestError } from "@/server/game-comments-spring-client";
import { POST } from "../route";

function createContext(id = COMMENT_ID) {
  return { params: Promise.resolve({ id }) };
}

function createRequest(body: string) {
  return new Request("http://localhost", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

describe("api/v1/game-service/comments/[id]/reveal route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.revealGameComment.mockResolvedValue("비밀 내용");
  });

  it("POST는 잘못된 comment id를 400으로 거절하고 Spring을 호출하지 않는다", async () => {
    const response = await POST(createRequest("{}"), {
      params: Promise.resolve({ id: "bad-id" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "잘못된 요청입니다.",
    });
    expect(mocks.revealGameComment).not.toHaveBeenCalled();
  });

  it("POST는 잘못된 JSON을 400으로 거절한다", async () => {
    const response = await POST(createRequest("{"), createContext());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "잘못된 요청입니다.",
    });
    expect(mocks.revealGameComment).not.toHaveBeenCalled();
  });

  it("POST는 비밀번호가 없으면 400으로 거절한다", async () => {
    const response = await POST(
      createRequest(JSON.stringify({ password: "" })),
      createContext()
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "비밀번호를 입력해 주세요.",
    });
    expect(mocks.revealGameComment).not.toHaveBeenCalled();
  });

  it("POST는 비밀번호 확인 성공 시 content를 반환한다", async () => {
    const response = await POST(
      createRequest(JSON.stringify({ password: "secret-password" })),
      createContext()
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ content: "비밀 내용" });
    expect(mocks.revealGameComment).toHaveBeenCalledWith(
      COMMENT_ID,
      "secret-password"
    );
  });

  it("POST는 Spring의 업무 오류 status/message를 그대로 전달한다", async () => {
    mocks.revealGameComment.mockRejectedValue(
      new GameCommentRequestError(403, "비밀번호가 일치하지 않습니다.")
    );

    const response = await POST(
      createRequest(JSON.stringify({ password: "wrong-password" })),
      createContext()
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "비밀번호가 일치하지 않습니다.",
    });
  });
});
