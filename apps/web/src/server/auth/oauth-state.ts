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

  // 1단계: 매칭 entry 탐색.
  let matchedEntry: OAuthStateEntry | null = null;

  if (options.state) {
    for (const entry of entries) {
      if (
        entry.provider === options.provider &&
        timingSafeEqualString(entry.state, options.state)
      ) {
        matchedEntry = entry;
        break;
      }
    }
  }

  // 2단계: remaining 결정.
  // idx-150: state가 제공됐으나 해당 provider의 어떤 entry와도 매칭되지 않으면
  // 해당 provider의 pending entry 전체를 폐기해 replay 공격 창을 좁힌다.
  // 매칭 성공 시에는 매칭된 entry만 소모하고 나머지는 보존(기존 동작).
  const dropProviderEntries = !!options.state && !matchedEntry;

  const remainingEntries = entries.filter((entry) => {
    if (entry === matchedEntry) {
      return false; // 소모됨.
    }
    if (dropProviderEntries && entry.provider === options.provider) {
      return false; // 실패한 콜백 시도 → 동일 provider entry 전체 폐기.
    }
    return true;
  });

  return {
    matchedEntry,
    nextCookieValue: encodePayloadOrNull(remainingEntries),
  };
}
