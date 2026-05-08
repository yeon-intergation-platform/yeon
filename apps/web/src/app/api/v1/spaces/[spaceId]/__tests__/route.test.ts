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

import { DELETE, GET, PATCH } from "../route";

describe("api/v1/spaces/[spaceId] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
  });

  it("GET은 Spring 단건 결과를 반환한다", async () => {
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
              startDate: null,
              endDate: null,
              createdByUserId: "user-1",
              createdAt: "2026-05-08T07:00:00Z",
              updatedAt: "2026-05-08T07:00:00Z",
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const response = await GET(new NextRequest("http://localhost/api/v1/spaces/spc_alpha"), {
      params: Promise.resolve({ spaceId: "spc_alpha" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      space: {
        id: "spc_alpha",
        name: "알파",
        description: null,
        startDate: null,
        endDate: null,
        createdByUserId: "user-1",
        createdAt: "2026-05-08T07:00:00Z",
        updatedAt: "2026-05-08T07:00:00Z",
      },
    });
  });

  it("PATCH는 Spring 수정 결과를 반환한다", async () => {
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
              name: "알파 변경",
              description: null,
              startDate: null,
              endDate: null,
              createdByUserId: "user-1",
              createdAt: "2026-05-08T07:00:00Z",
              updatedAt: "2026-05-08T08:00:00Z",
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const response = await PATCH(
      new NextRequest("http://localhost/api/v1/spaces/spc_alpha", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "알파 변경" }),
      }),
      { params: Promise.resolve({ spaceId: "spc_alpha" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      space: {
        id: "spc_alpha",
        name: "알파 변경",
        description: null,
        startDate: null,
        endDate: null,
        createdByUserId: "user-1",
        createdAt: "2026-05-08T07:00:00Z",
        updatedAt: "2026-05-08T08:00:00Z",
      },
    });
  });

  it("DELETE는 성공 시 204다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const response = await DELETE(
      new NextRequest("http://localhost/api/v1/spaces/spc_alpha", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ spaceId: "spc_alpha" }) },
    );

    expect(response.status).toBe(204);
  });
});
