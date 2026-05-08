import { describe, expect, it } from "vitest";

import { buildValueColumns } from "../member-field-values-service";

describe("member-field-values-service", () => {
  it("text 계열은 valueText로 정규화한다", () => {
    expect(buildValueColumns("text", "hello")).toEqual({ valueText: "hello" });
    expect(buildValueColumns("long_text", "긴 텍스트")).toEqual({ valueText: "긴 텍스트" });
  });

  it("number는 valueNumber 문자열로 저장한다", () => {
    expect(buildValueColumns("number", 12.5)).toEqual({ valueNumber: "12.5" });
  });

  it("number가 유효하지 않으면 ServiceError를 던진다", () => {
    expect(() => buildValueColumns("number", "abc")).toThrow(/숫자 필드에 유효하지 않은 값입니다/);
  });

  it("select 계열은 valueJson으로 보존한다", () => {
    expect(buildValueColumns("select", ["in_progress"])).toEqual({
      valueJson: ["in_progress"],
    });
    expect(buildValueColumns("multi_select", ["a", "b"])).toEqual({
      valueJson: ["a", "b"],
    });
  });

  it("null/undefined는 clear semantics를 유지한다", () => {
    expect(buildValueColumns("text", null)).toEqual({
      valueText: null,
      valueNumber: null,
      valueBoolean: null,
      valueJson: null,
    });
    expect(buildValueColumns("checkbox", undefined)).toEqual({
      valueText: null,
      valueNumber: null,
      valueBoolean: null,
      valueJson: null,
    });
  });
});
