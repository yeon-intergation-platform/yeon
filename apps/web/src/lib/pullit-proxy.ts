const PULLIT_HOSTNAME = "portfolio.yeon.world";
const PULLIT_BASE_PATH = "/pull-it";
const PULLIT_DOCS_BASE_PATH = `${PULLIT_BASE_PATH}/docs`;
const PULLIT_BACKEND_PATH_PREFIXES = [
  "/api",
  "/auth",
  "/oauth2",
  "/login/oauth2",
  "/api-docs",
  "/swagger-ui",
] as const;

export type PullitProxyOrigins = {
  frontend: string | undefined;
  backend: string | undefined;
  docs: string | undefined;
};

function parseHttpOrigin(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

function isPathWithin(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function buildTargetUrl(origin: string, pathname: string, search: string) {
  const targetUrl = new URL(pathname || "/", origin);
  targetUrl.search = search;
  return targetUrl;
}

export function resolvePullitProxyTarget({
  hostname,
  pathname,
  search = "",
  origins,
}: {
  hostname: string;
  pathname: string;
  search?: string;
  origins: PullitProxyOrigins;
}) {
  if (
    hostname !== PULLIT_HOSTNAME ||
    !isPathWithin(pathname, PULLIT_BASE_PATH)
  ) {
    return null;
  }

  if (isPathWithin(pathname, PULLIT_DOCS_BASE_PATH)) {
    const docsOrigin = parseHttpOrigin(origins.docs);
    if (!docsOrigin) return null;

    const docsPath = pathname.slice(PULLIT_DOCS_BASE_PATH.length) || "/";
    return buildTargetUrl(docsOrigin, docsPath, search);
  }

  const pullitPath = pathname.slice(PULLIT_BASE_PATH.length) || "/";
  const isBackendPath = PULLIT_BACKEND_PATH_PREFIXES.some((prefix) =>
    isPathWithin(pullitPath, prefix)
  );

  if (isBackendPath) {
    const backendOrigin = parseHttpOrigin(origins.backend);
    return backendOrigin
      ? buildTargetUrl(backendOrigin, pullitPath, search)
      : null;
  }

  const frontendOrigin = parseHttpOrigin(origins.frontend);
  return frontendOrigin
    ? buildTargetUrl(frontendOrigin, pathname, search)
    : null;
}
