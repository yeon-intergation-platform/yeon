import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentAuthUser } = vi.hoisted(() => ({
  getCurrentAuthUser: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  getCurrentAuthUser,
}));
import { POST } from "../route";

describe("api/v1/card-decks/merge-guest route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
  });

  it("비로그인 상태면 401이다", async () => {
    getCurrentAuthUser.mockResolvedValue(null);

    const response = await POST(
      new NextRequest("http://localhost/api/v1/card-decks/merge-guest", {
        method: "POST",
        body: JSON.stringify({ decks: [] }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("Spring merge 결과를 반환한다", async () => {
    getCurrentAuthUser.mockResolvedValue({ id: "user-1" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ createdDeckCount: 1, createdItemCount: 2 }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          }
        )
      )
    );

    const response = await POST(
      new NextRequest("http://localhost/api/v1/card-decks/merge-guest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          decks: [
            {
              title: "덱",
              items: [
                { frontText: "앞", backText: "뒤" },
                { frontText: "앞2", backText: "뒤2" },
              ],
            },
          ],
        }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      createdDeckCount: 1,
      createdItemCount: 2,
    });
  });

  it("Spring 400 메시지를 그대로 노출한다", async () => {
    getCurrentAuthUser.mockResolvedValue({ id: "user-1" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ message: "덱 제목은 비워 둘 수 없습니다." }),
          {
            status: 400,
            headers: { "content-type": "application/json" },
          }
        )
      )
    );

    const response = await POST(
      new NextRequest("http://localhost/api/v1/card-decks/merge-guest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          decks: [{ title: "덱", items: [] }],
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "덱 제목은 비워 둘 수 없습니다.",
    });
  });
});
