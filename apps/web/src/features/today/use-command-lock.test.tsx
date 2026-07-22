// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCommandLock, useSubmitLock } from "./use-command-lock";

describe("useCommandLock", () => {
  it("같은 키의 command는 첫 요청이 끝날 때까지 한 번만 실행한다", async () => {
    let release: ((value: string) => void) | undefined;
    const command = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          release = resolve;
        })
    );
    const { result } = renderHook(() => useCommandLock<string>());

    let first: Promise<string | undefined> | undefined;
    let second: Promise<string | undefined> | undefined;
    act(() => {
      first = result.current.run("task-1", command);
      second = result.current.run("task-1", command);
    });

    await expect(second).resolves.toBeUndefined();
    expect(command).toHaveBeenCalledTimes(1);
    expect(result.current.isLocked("task-1")).toBe(true);

    await act(async () => {
      release?.("완료");
      await expect(first).resolves.toBe("완료");
    });
    expect(result.current.isLocked("task-1")).toBe(false);
  });

  it("서로 다른 키의 command는 독립적으로 실행한다", async () => {
    const command = vi.fn(async (value: string) => value);
    const { result } = renderHook(() => useCommandLock<string>());

    await act(async () => {
      await Promise.all([
        result.current.run("task-1", () => command("첫 번째")),
        result.current.run("task-2", () => command("두 번째")),
      ]);
    });

    expect(command).toHaveBeenCalledTimes(2);
  });

  it("command가 실패해도 잠금을 해제해 다음 요청을 허용한다", async () => {
    const command = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("요청 실패"))
      .mockResolvedValueOnce("재시도 성공");
    const { result } = renderHook(() => useCommandLock<string>());

    await act(async () => {
      await expect(result.current.run("task-1", command)).rejects.toThrow(
        "요청 실패"
      );
    });
    expect(result.current.isLocked("task-1")).toBe(false);

    await act(async () => {
      await expect(result.current.run("task-1", command)).resolves.toBe(
        "재시도 성공"
      );
    });
    expect(command).toHaveBeenCalledTimes(2);
  });
});

describe("useSubmitLock", () => {
  it("키가 없는 폼 제출도 첫 요청이 끝날 때까지 한 번만 실행한다", async () => {
    let release: (() => void) | undefined;
    const command = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        })
    );
    const { result } = renderHook(() => useSubmitLock());

    let first: Promise<void | undefined> | undefined;
    let second: Promise<void | undefined> | undefined;
    act(() => {
      first = result.current(command);
      second = result.current(command);
    });

    await expect(second).resolves.toBeUndefined();
    expect(command).toHaveBeenCalledTimes(1);

    await act(async () => {
      release?.();
      await expect(first).resolves.toBeUndefined();
    });
  });
});
