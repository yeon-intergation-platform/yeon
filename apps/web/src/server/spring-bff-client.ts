import {
  createYeonHeaders,
  type YeonHeadersInit,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";
const USER_ID_HEADER = "X-Yeon-User-Id";

type SpringBffHeaderParams = {
  userId?: string | null;
};

export function buildSpringBffHeaders(
  initHeaders?: YeonHeadersInit,
  params: SpringBffHeaderParams = {}
) {
  const headers = createYeonHeaders(initHeaders);

  if (!headers.has("accept")) {
    headers.set("accept", "application/json");
  }

  if (params.userId) {
    headers.set(USER_ID_HEADER, params.userId);
  }

  const internalToken = process.env.SPRING_INTERNAL_TOKEN?.trim();
  if (internalToken) {
    headers.set(INTERNAL_TOKEN_HEADER, internalToken);
  }

  return headers;
}
