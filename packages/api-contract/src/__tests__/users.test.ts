import { describe, expect, it } from "vitest";

import { listUsersResponseSchema } from "../users";

describe("users contract", () => {
  it("관리자 회원 목록 필수 필드를 검증한다", () => {
    const result = listUsersResponseSchema.safeParse({
      users: [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          email: "admin@yeon.world",
          displayName: "관리자",
          role: "admin",
          lastLoginAt: "2026-05-17T09:00:00.000Z",
          createdAt: "2026-05-01T09:00:00.000Z",
          updatedAt: "2026-05-17T09:00:00.000Z",
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("최근 로그인이 없는 과거 계정도 nullable로 허용한다", () => {
    const result = listUsersResponseSchema.safeParse({
      users: [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          email: "user@yeon.world",
          displayName: null,
          role: "user",
          lastLoginAt: null,
          createdAt: "2026-05-01T09:00:00.000Z",
          updatedAt: "2026-05-01T09:00:00.000Z",
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
