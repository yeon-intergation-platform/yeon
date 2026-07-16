import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadPublicContentArchivedRedirect = vi.fn();

vi.mock("@/server/public-content-public-read", () => ({
  loadPublicContentArchivedRedirect: (...args: unknown[]) =>
    mockLoadPublicContentArchivedRedirect(...args),
}));

import { GET } from "../route";
import { PublicContentSpringBackendHttpError } from "@/server/public-content-spring-client";

describe("api/v1/content/[channel]/redirect route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("보관 글의 영구 redirect 대상을 반환한다", async () => {
    mockLoadPublicContentArchivedRedirect.mockResolvedValue(
      "https://blog.yeon.world/product/new-article"
    );

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/content/blog/redirect?slug=engineering%2Fold-article"
      ),
      { params: Promise.resolve({ channel: "blog" }) }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      redirectTo: "https://blog.yeon.world/product/new-article",
    });
    expect(mockLoadPublicContentArchivedRedirect).toHaveBeenCalledWith({
      channel: "blog",
      slug: "engineering/old-article",
    });
  });

  it("redirect가 없으면 404를 반환한다", async () => {
    mockLoadPublicContentArchivedRedirect.mockResolvedValue(null);

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/content/blog/redirect?slug=engineering%2Fmissing"
      ),
      { params: Promise.resolve({ channel: "blog" }) }
    );

    expect(response.status).toBe(404);
  });

  it("Spring 장애는 404로 숨기지 않는다", async () => {
    mockLoadPublicContentArchivedRedirect.mockRejectedValue(
      new PublicContentSpringBackendHttpError(503, "Spring 연결 실패")
    );

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/content/blog/redirect?slug=engineering%2Fold-article"
      ),
      { params: Promise.resolve({ channel: "blog" }) }
    );

    expect(response.status).toBe(503);
  });
});
