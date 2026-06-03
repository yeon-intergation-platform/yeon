import { authProviderSchema } from "@yeon/api-contract/auth";
import { z } from "zod";
import { getYeonNow } from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  AUTH_OAUTH_STATE_TTL_SECONDS,
  normalizeAuthRedirectPath,
  normalizeMobileReturnUrl,
  type SocialProvider,
} from "./constants";
import {
  createAuthRandomToken,
  createPkceCodeVerifier,
  signAuthValue,
  timingSafeEqualString,
  verifySignedAuthValue,
} from "./crypto";

const oauthStateEntrySchema = z.object({
  state: z.string().min(16),
  provider: authProviderSchema,
  nextPath: z.string().min(1),
  // 모바일 소셜 로그인일 때만 채워지는 복귀 딥링크. 없으면 기존 웹 쿠키 플로우.
  mobileReturnUrl: z.string().min(1).nullish(),
  expiresAt: z.string().datetime(),
  codeVerifier: z.string().min(43).max(128),
});

const oauthStateCookiePayloadSchema = z.object({
  entries: z.array(oauthStateEntrySchema).max(8),
});

type OAuthStateEntry = z.infer<typeof oauthStateEntrySchema>;

function encodePayload(entries: OAuthStateEntry[]) {
  const encodedPayload = Buffer.from(
    JSON.stringify({ entries } satisfies z.infer<
      typeof oauthStateCookiePayloadSchema
    >)
  ).toString("base64url");

  return `${encodedPayload}.${signAuthValue(encodedPayload)}`;
}

function decodePayload(cookieValue?: string | null) {
  if (!cookieValue) {
    return [];
  }

  const [encodedPayload, signature, ...rest] = cookieValue.split(".");

  if (!encodedPayload || !signature || rest.length > 0) {
    return [];
  }

  if (!verifySignedAuthValue(encodedPayload, signature)) {
    return [];
  }

  try {
    const decoded = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const parsed = oauthStateCookiePayloadSchema.safeParse(JSON.parse(decoded));

    if (!parsed.success) {
      return [];
    }

    const now = getYeonNow();

    return parsed.data.entries.filter(
      (entry) => new Date(entry.expiresAt).getTime() > now
    );
  } catch {
    return [];
  }
}

function encodePayloadOrNull(entries: OAuthStateEntry[]) {
  return entries.length > 0 ? encodePayload(entries) : null;
}

export function createOAuthStateCookieValue(options: {
  provider: SocialProvider;
  nextPath?: string | null;
  mobileReturnUrl?: string | null;
  existingCookieValue?: string | null;
}) {
  const payload = {
    state: createAuthRandomToken(24),
    provider: options.provider,
    nextPath: normalizeAuthRedirectPath(options.nextPath),
    mobileReturnUrl: normalizeMobileReturnUrl(options.mobileReturnUrl),
    expiresAt: new Date(
      getYeonNow() + AUTH_OAUTH_STATE_TTL_SECONDS * 1000
    ).toISOString(),
    codeVerifier: createPkceCodeVerifier(),
  } satisfies OAuthStateEntry;
  const nextEntries = [
    ...decodePayload(options.existingCookieValue).slice(-7),
    payload,
  ];

  return {
    state: payload.state,
    nextPath: payload.nextPath,
    mobileReturnUrl: payload.mobileReturnUrl,
    codeVerifier: payload.codeVerifier,
    cookieValue: encodePayload(nextEntries),
  };
}

export function consumeOAuthStateCookieValue(options: {
  cookieValue?: string | null;
  provider: SocialProvider;
  state?: string | null;
}) {
  const entries = decodePayload(options.cookieValue);
  const remainingEntries: OAuthStateEntry[] = [];
  let matchedEntry: OAuthStateEntry | null = null;

  for (const entry of entries) {
    const isMatchingEntry =
      !!options.state &&
      !matchedEntry &&
      entry.provider === options.provider &&
      timingSafeEqualString(entry.state, options.state);

    if (isMatchingEntry) {
      matchedEntry = entry;
      continue;
    }

    remainingEntries.push(entry);
  }

  return {
    matchedEntry,
    nextCookieValue: encodePayloadOrNull(remainingEntries),
  };
}
