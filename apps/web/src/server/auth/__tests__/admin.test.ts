import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserDto } from "@yeon/api-contract/auth";

const { dbResponses, dbChain, dbCalls } = vi.hoisted(() => {
  const dbResponses: unknown[] = [];
  const dbCalls: string[] = [];
  const proxy: unknown = new Proxy({} as Record<string | symbol, unknown>, {
    get(_target, prop) {
      if (prop === "then") {
        return (resolve: (value: unknown) => void) =>
          Promise.resolve(dbResponses.shift() ?? []).then(resolve);
      }
      if (prop === "catch" || prop === "finally") return undefined;
      return () => {
        dbCalls.push(String(prop));
        return proxy;
      };
    },
  });
  return { dbResponses, dbChain: proxy, dbCalls };
});

vi.mock("@/server/db", () => ({ getDb: () => dbChain }));
vi.mock("@/server/db/schema", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/db/schema")>();
  return {
    ...actual,
    users: {
      id: "id",
      role: "role",
      updatedAt: "updatedAt",
    },
  };
});
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: (left: unknown, right: unknown) => ({ left, right }),
  };
});
vi.mock("@/server/auth/session", () => ({
  getCurrentAuthUser: vi.fn(),
}));

import {
  USER_ROLES,
  isAdminUser,
  isSeedAdminEmail,
  parseAdminSeedEmails,
} from "../admin";

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
    dbResponses.length = 0;
    dbCalls.length = 0;
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
      Array.from(
        parseAdminSeedEmails(" Owner@Yeon.World, admin@yeon.world ,,"),
      ),
    ).toEqual(["owner@yeon.world", "admin@yeon.world"]);
  });

  it("recognizes seeded admin emails case-insensitively", () => {
    process.env.YEON_ADMIN_EMAILS = "owner@yeon.world";

    expect(isSeedAdminEmail(" Owner@Yeon.World ")).toBe(true);
    expect(isSeedAdminEmail("other@yeon.world")).toBe(false);
  });

  it("allows users whose DB role is admin", async () => {
    dbResponses.push([{ role: USER_ROLES.admin }]);

    await expect(isAdminUser(authUser)).resolves.toBe(true);
    expect(dbCalls).not.toContain("update");
  });

  it("promotes the configured first-admin email when DB role is still user", async () => {
    process.env.YEON_ADMIN_EMAILS = "owner@yeon.world";
    dbResponses.push([{ role: USER_ROLES.user }]);
    dbResponses.push(undefined);

    await expect(isAdminUser(authUser)).resolves.toBe(true);
    expect(dbCalls).toContain("update");
  });

  it("rejects non-seeded users without admin role", async () => {
    dbResponses.push([{ role: USER_ROLES.user }]);

    await expect(isAdminUser(authUser)).resolves.toBe(false);
    expect(dbCalls).not.toContain("update");
  });
});
