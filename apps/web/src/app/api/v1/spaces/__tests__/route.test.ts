import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAuthenticatedUser } = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
}));

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

import { GET, POST } from "../route";

describe("api/v1/spaces route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
  });

  it("GET은 Spring spaces 결과를 반환한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            spaces: [
              {
                id: "spc_alpha",
                name: "알파",
                description: null,
                startDate: null,
                endDate: null,
                createdByUserId: "user-1",
                createdAt: "2026-05-08T07:00:00Z",
                updatedAt: "2026-05-08T07:00:00Z",
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const response = await GET(new NextRequest("http://localhost/api/v1/spaces"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      spaces: [
        {
          id: "spc_alpha",
          name: "알파",
          description: null,
          startDate: null,
          endDate: null,
          createdByUserId: "user-1",
          createdAt: "2026-05-08T07:00:00Z",
          updatedAt: "2026-05-08T07:00:00Z",
        },
      ],
    });
  });

  it("POST는 잘못된 JSON이면 400이다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/spaces", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{bad json",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "요청 본문이 올바른 JSON 형식이 아닙니다.",
    });
  });

  it("POST는 Spring 생성 결과를 반환한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            space: {
              id: "spc_alpha",
              name: "알파",
              description: null,
              startDate: "2026-05-01",
              endDate: "2026-05-31",
              createdByUserId: "user-1",
              createdAt: "2026-05-08T07:00:00Z",
              updatedAt: "2026-05-08T07:00:00Z",
            },
          }),
          { status: 201, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const response = await POST(
      new NextRequest("http://localhost/api/v1/spaces", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "알파",
          startDate: "2026-05-01",
          endDate: "2026-05-31",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      space: {
        id: "spc_alpha",
        name: "알파",
        description: null,
        startDate: "2026-05-01",
        endDate: "2026-05-31",
        createdByUserId: "user-1",
        createdAt: "2026-05-08T07:00:00Z",
        updatedAt: "2026-05-08T07:00:00Z",
      },
    });
  });
});
