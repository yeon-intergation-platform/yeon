import {
  createDevLoginSessionInSpring,
  listDevLoginOptionsInSpring,
} from "@/server/root-auth-spring-client";

import { timingSafeEqualString } from "./crypto";

const DEV_LOGIN_SECRET_HEADER = "x-dev-login-secret";

function normalizeHostname(candidate: string | null | undefined) {
  if (!candidate) {
    return null;
  }

  const firstHost = candidate.split(",")[0]?.trim();

  if (!firstHost) {
    return null;
  }

  if (firstHost.startsWith("[")) {
    const closingIndex = firstHost.indexOf("]");

    if (closingIndex === -1) {
      return firstHost.toLowerCase();
    }

    return firstHost.slice(1, closingIndex).toLowerCase();
  }

  if (
    firstHost.includes(":") &&
    firstHost.indexOf(":") !== firstHost.lastIndexOf(":")
  ) {
    return firstHost.toLowerCase();
  }

  const colonIndex = firstHost.indexOf(":");

  if (colonIndex === -1) {
    return firstHost.toLowerCase();
  }

  return firstHost.slice(0, colonIndex).toLowerCase();
}

export function isLoopbackHostname(hostname: string | null | undefined) {
  const normalized = normalizeHostname(hostname);

  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized?.endsWith(".localhost") === true
  );
}

/**
 * dev-login은 비-production 환경에서만 진입을 허용한다.
 * 과거에는 production이라도 Host 헤더가 loopback이면 통과시켰지만,
 * reverse proxy 뒤에선 Host 헤더가 신뢰할 수 없으므로 production에서는 무조건 차단한다.
 * hostname 인자는 backward-compat 용도이며 동작에 영향을 주지 않는다.
 */
export function isDevLoginAllowed(_hostname?: string | null) {
  return (
    process.env.ALLOW_DEV_LOGIN === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

/**
 * DEV_LOGIN_SECRET이 env에 설정돼 있으면 요청 헤더(x-dev-login-secret) timing-safe 비교를 강제한다.
 * env가 비어 있으면 검증 없이 true (로컬 dev UX 유지).
 * 스테이징/공유 dev 환경은 secret만 설정해 두면 추가 보호가 활성화된다.
 */
export function verifyDevLoginRequestSecret(request: { headers: Headers }) {
  const requiredSecret = process.env.DEV_LOGIN_SECRET?.trim();

  if (!requiredSecret) {
    return true;
  }

  const provided = request.headers.get(DEV_LOGIN_SECRET_HEADER);

  if (!provided) {
    return false;
  }

  return timingSafeEqualString(provided, requiredSecret);
}

export function getRequestHostnameFromHostHeader(
  hostHeader: string | null | undefined
) {
  return normalizeHostname(hostHeader);
}

export async function listDevLoginOptions(hostname?: string | null) {
  if (!isDevLoginAllowed(hostname)) {
    return [];
  }

  return listDevLoginOptionsInSpring();
}

export async function createDevLoginSession(params: {
  accountKey: string | null;
  create: boolean;
}) {
  return createDevLoginSessionInSpring(params);
}
