import { createYeonUrlSearchParams } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { describe, expect, it } from "vitest";

import {
  createPatchedHref,
  createPatchedSearchParams,
  isOneOf,
  parseCsvParam,
  serializeCsvParam,
} from "./search-params";

describe("route-state search params", () => {
  it("deletes null, undefined, and blank patch values", () => {
    const params = createYeonUrlSearchParams("page=2&mode=list&q=hello");
    const next = createPatchedSearchParams(params, {
      mode: "",
      page: null,
      q: undefined,
    });

    expect(next.toString()).toBe("");
  });

  it("keeps false and zero as explicit route state values", () => {
    const href = createPatchedHref("/cards", createYeonUrlSearchParams(""), {
      archived: false,
      page: 0,
    });

    expect(href).toBe("/cards?archived=false&page=0");
  });

  it("parses and serializes csv params without blank duplicates", () => {
    expect(parseCsvParam(" a, ,b,a ")).toEqual(["a", "b", "a"]);
    expect(serializeCsvParam(["a", "", "b", "a"])).toBe("a,b");
    expect(serializeCsvParam([])).toBeNull();
  });

  it("narrows only exact candidate values", () => {
    expect(isOneOf("list", ["list", "grid"] as const)).toBe(true);
    expect(isOneOf("", ["list", "grid"] as const)).toBe(false);
    expect(isOneOf(null, ["list", "grid"] as const)).toBe(false);
  });
});
