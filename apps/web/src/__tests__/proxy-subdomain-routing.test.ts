import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "../proxy";

function buildRequest(pathname: string, headers: Record<string, string>) {
  return new NextRequest(`http://localhost:3000${pathname}`, { headers });
}

describe("proxy subdomain routing", () => {
  it("marks content subdomain rewrites so the internal pass does not redirect again", () => {
    const firstResponse = proxy(
      buildRequest("/", {
        Host: "support.yeon.world",
        "x-forwarded-host": "support.yeon.world",
      })
    );

    expect(firstResponse.headers.get("x-middleware-rewrite")).toContain(
      "/support"
    );
    expect(firstResponse.headers.get("location")).toBeNull();

    const internalResponse = proxy(
      buildRequest("/support", {
        Host: "support.yeon.world",
        "x-forwarded-host": "support.yeon.world",
        "x-yeon-subdomain-rewrite": "1",
      })
    );

    expect(internalResponse.headers.get("location")).toBeNull();
  });

  it("keeps direct legacy path redirects for external content subdomain requests", () => {
    const response = proxy(
      buildRequest("/support", {
        Host: "support.yeon.world",
        "x-forwarded-host": "support.yeon.world",
      })
    );

    expect(response.headers.get("location")).toBe(
      "https://support.yeon.world/"
    );
  });

  it("rewrites todo subdomain root to the todo service route", () => {
    const response = proxy(
      buildRequest("/", {
        Host: "todo.yeon.world",
        "x-forwarded-host": "todo.yeon.world",
      })
    );

    expect(response.headers.get("x-middleware-rewrite")).toContain("/today");
    expect(response.headers.get("location")).toBeNull();
  });

  it("rewrites portfolio subdomain root to the public portfolio route", () => {
    const response = proxy(
      buildRequest("/", {
        Host: "portforlio.yeon.world",
        "x-forwarded-host": "portforlio.yeon.world",
      })
    );

    expect(response.headers.get("x-middleware-rewrite")).toContain(
      "/portfolio"
    );
    expect(response.headers.get("location")).toBeNull();
  });
});
