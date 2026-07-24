import { describe, expect, it } from "vitest";
import { resolvePullitProxyTarget } from "../pullit-proxy";

const origins = {
  frontend: "https://pullit-frontend.example.com",
  backend: "https://pullit-backend.example.com",
  docs: "https://pullit-docs.example.com",
};

describe("pullit-proxy", () => {
  it("프런트 경로와 query를 그대로 전달한다", () => {
    expect(
      resolvePullitProxyTarget({
        hostname: "portfolio.yeon.world",
        pathname: "/pull-it/question-sets",
        search: "?page=2",
        origins,
      })?.toString()
    ).toBe("https://pullit-frontend.example.com/pull-it/question-sets?page=2");
  });

  it("API와 OAuth 경로는 /pull-it prefix를 제거해 백엔드로 전달한다", () => {
    expect(
      resolvePullitProxyTarget({
        hostname: "portfolio.yeon.world",
        pathname: "/pull-it/api/question-sets",
        origins,
      })?.toString()
    ).toBe("https://pullit-backend.example.com/api/question-sets");

    expect(
      resolvePullitProxyTarget({
        hostname: "portfolio.yeon.world",
        pathname: "/pull-it/login/oauth2/code/kakao",
        search: "?code=abc",
        origins,
      })?.toString()
    ).toBe(
      "https://pullit-backend.example.com/login/oauth2/code/kakao?code=abc"
    );
  });

  it("문서 경로는 docs prefix를 제거해 문서 서버로 전달한다", () => {
    expect(
      resolvePullitProxyTarget({
        hostname: "portfolio.yeon.world",
        pathname: "/pull-it/docs/redoc.html",
        origins,
      })?.toString()
    ).toBe("https://pullit-docs.example.com/redoc.html");
  });

  it("허용되지 않은 호스트나 설정되지 않은 원본은 프록시하지 않는다", () => {
    expect(
      resolvePullitProxyTarget({
        hostname: "yeon.world",
        pathname: "/pull-it",
        origins,
      })
    ).toBeNull();

    expect(
      resolvePullitProxyTarget({
        hostname: "portfolio.yeon.world",
        pathname: "/pull-it",
        origins: { frontend: undefined, backend: undefined, docs: undefined },
      })
    ).toBeNull();
  });
});
