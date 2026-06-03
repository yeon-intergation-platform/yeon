import type { AuthUserDto } from "@yeon/api-contract/auth";
import { checkAdminInSpring } from "@/server/root-auth-spring-client";
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
      .filter(Boolean)
  );
}

export function getAdminSeedEmails(): Set<string> {
  return parseAdminSeedEmails(
    process.env.YEON_ADMIN_EMAILS ?? process.env.ADMIN_EMAILS
  );
}

export function isSeedAdminEmail(email: string): boolean {
  return getAdminSeedEmails().has(email.trim().toLowerCase());
}

export async function isAdminUser(user: AuthUserDto): Promise<boolean> {
  return checkAdminInSpring({ userId: user.id, email: user.email });
}

export async function getCurrentAdminUser(): Promise<AuthUserDto | null> {
  const currentUser = await getCurrentAuthUser();
  if (!currentUser) {
    return null;
  }

  return (await isAdminUser(currentUser)) ? currentUser : null;
}
