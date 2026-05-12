import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserDto } from "@yeon/api-contract/auth";

const mockCheckAdminInSpring = vi.fn();

vi.mock("@/server/root-auth-spring-client", () => ({
  checkAdminInSpring: (...args: unknown[]) => mockCheckAdminInSpring(...args),
}));
vi.mock("@/server/auth/session", () => ({
  getCurrentAuthUser: vi.fn(),
}));

import { isAdminUser, isSeedAdminEmail, parseAdminSeedEmails } from "../admin";

const ORIGINAL_YEON_ADMIN_EMAILS = process.env.YEON_ADMIN_EMAILS;
const ORIGINAL_ADMIN_EMAILS = process.env.ADMIN_EMAILS;

const authUser: AuthUserDto = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "owner@yeon.world",
  displayName: "운영자",
  avatarUrl: null,
  lastLoginAt: "2026-05-01T00:00:00.000Z",
  providers: ["google"],
};

describe("server/auth/admin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckAdminInSpring.mockResolvedValue(false);
    delete process.env.YEON_ADMIN_EMAILS;
    delete process.env.ADMIN_EMAILS;
  });

  afterEach(() => {
    if (ORIGINAL_YEON_ADMIN_EMAILS === undefined) {
      delete process.env.YEON_ADMIN_EMAILS;
    } else {
      process.env.YEON_ADMIN_EMAILS = ORIGINAL_YEON_ADMIN_EMAILS;
    }

    if (ORIGINAL_ADMIN_EMAILS === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = ORIGINAL_ADMIN_EMAILS;
    }
  });

  it("normalizes comma-separated first-admin seed emails", () => {
    expect(
      Array.from(parseAdminSeedEmails(" Owner@Yeon.World, admin@yeon.world ,,"))
    ).toEqual(["owner@yeon.world", "admin@yeon.world"]);
  });

  it("recognizes seeded admin emails case-insensitively", () => {
    process.env.YEON_ADMIN_EMAILS = "owner@yeon.world";

    expect(isSeedAdminEmail(" Owner@Yeon.World ")).toBe(true);
    expect(isSeedAdminEmail("other@yeon.world")).toBe(false);
  });

  it("Spring admin 판정 결과를 반환한다", async () => {
    mockCheckAdminInSpring.mockResolvedValue(true);

    await expect(isAdminUser(authUser)).resolves.toBe(true);
    expect(mockCheckAdminInSpring).toHaveBeenCalledWith({
      userId: authUser.id,
      email: authUser.email,
    });
  });
});
