import { eq } from "drizzle-orm";

import type { AuthUserDto } from "@yeon/api-contract/auth";

import { getDb } from "@/server/db";
import { users } from "@/server/db/schema";

import { getCurrentAuthUser } from "./session";

export const USER_ROLES = {
  admin: "admin",
  user: "user",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export function parseAdminSeedEmails(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function getAdminSeedEmails(): Set<string> {
  return parseAdminSeedEmails(
    process.env.YEON_ADMIN_EMAILS ?? process.env.ADMIN_EMAILS,
  );
}

export function isSeedAdminEmail(email: string): boolean {
  return getAdminSeedEmails().has(email.trim().toLowerCase());
}

async function getUserRole(userId: string): Promise<string> {
  const [row] = await getDb()
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row?.role ?? USER_ROLES.user;
}

async function promoteSeedAdminIfNeeded(user: AuthUserDto): Promise<boolean> {
  if (!isSeedAdminEmail(user.email)) {
    return false;
  }

  await getDb()
    .update(users)
    .set({ role: USER_ROLES.admin, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return true;
}

export async function isAdminUser(user: AuthUserDto): Promise<boolean> {
  const role = await getUserRole(user.id);
  if (role === USER_ROLES.admin) {
    return true;
  }

  return promoteSeedAdminIfNeeded(user);
}

export async function getCurrentAdminUser(): Promise<AuthUserDto | null> {
  const currentUser = await getCurrentAuthUser();
  if (!currentUser) {
    return null;
  }

  return (await isAdminUser(currentUser)) ? currentUser : null;
}
