import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("/api/v1/spaces/[spaceId]/member-tabs/[tabId]", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("PATCH: 수정 요청을 Spring으로 전달한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            tab: {
              id: "mtb_custom",
              name: "새 이름",
              tabType: "custom",
              systemKey: null,
              isVisible: false,
              displayOrder: 7,
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          }
        )
      )
    );

    const { PATCH } = await import("../route");
    const response = await PATCH(
      new Request(
        "http://localhost/api/v1/spaces/space_alpha/member-tabs/mtb_custom",
        {
          method: "PATCH",
          body: JSON.stringify({
            name: "새 이름",
            isVisible: false,
            displayOrder: 7,
          }),
          headers: { "content-type": "application/json" },
        }
      ) as never,
      {
        params: Promise.resolve({
          spaceId: "space_alpha",
          tabId: "mtb_custom",
        }),
      }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.tab.name).toBe("새 이름");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/member-tabs/mtb_custom",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          name: "새 이름",
          isVisible: false,
          displayOrder: 7,
        }),
      })
    );
  });

  test("DELETE: 삭제 요청을 Spring으로 전달하고 204를 유지한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    );

    const { DELETE } = await import("../route");
    const response = await DELETE(
      new Request(
        "http://localhost/api/v1/spaces/space_alpha/member-tabs/mtb_custom",
        {
          method: "DELETE",
        }
      ) as never,
      {
        params: Promise.resolve({
          spaceId: "space_alpha",
          tabId: "mtb_custom",
        }),
      }
    );

    expect(response.status).toBe(204);
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/member-tabs/mtb_custom",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.any(Headers),
      })
    );
    const requestHeaders = (fetch as unknown as Mock).mock.calls[0][1]
      .headers as Headers;
    expect(requestHeaders.get("X-Yeon-User-Id")).toBe("user-1");
    expect(requestHeaders.get("X-Yeon-Internal-Token")).toBe("internal-token");
  });

  test("PATCH: Spring 403은 jsonError로 번역한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "PROTECTED_SYSTEM_TAB",
            message: "기본 탭은 수정할 수 없습니다.",
          }),
          {
            status: 403,
            headers: { "content-type": "application/json" },
          }
        )
      )
    );

    const { PATCH } = await import("../route");
    const response = await PATCH(
      new Request(
        "http://localhost/api/v1/spaces/space_alpha/member-tabs/mtb_overview",
        {
          method: "PATCH",
          body: JSON.stringify({ name: "변경" }),
          headers: { "content-type": "application/json" },
        }
      ) as never,
      {
        params: Promise.resolve({
          spaceId: "space_alpha",
          tabId: "mtb_overview",
        }),
      }
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({ message: "기본 탭은 수정할 수 없습니다." });
  });
});
