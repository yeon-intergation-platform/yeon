import type { NextRequest } from "next/server";

import { getAuthSessionTokenFromRequest } from "@/server/auth/request-session-token";
import { getAuthUserBySessionToken } from "@/server/auth/session";

import { jsonError } from "../counseling-records/_shared";

export { jsonError };

export async function getOptionalAuthenticatedUser(request: NextRequest) {
  const sessionToken = getAuthSessionTokenFromRequest(request);
  const currentUser = sessionToken
    ? await getAuthUserBySessionToken(sessionToken.token)
    : null;

  return { currentUser };
}

export async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new Error("INVALID_JSON");
  }
}
