export function createSpringInternalHeaders(
  extraHeaders: Record<string, string | undefined> = {}
) {
  const headers: Record<string, string> = { accept: "application/json" };
  const token = process.env.SPRING_INTERNAL_TOKEN?.trim();
  if (token) headers["X-Yeon-Internal-Token"] = token;

  Object.entries(extraHeaders).forEach(([key, value]) => {
    if (value) headers[key] = value;
  });

  return headers;
}

export function mergeSpringInternalHeaders(
  baseHeaders: Record<string, string | undefined> = {},
  overrideHeaders?: RequestInit["headers"]
) {
  const merged = new Headers(createSpringInternalHeaders(baseHeaders));
  if (overrideHeaders) {
    new Headers(overrideHeaders).forEach((value, key) => {
      merged.set(key, value);
    });
  }
  return merged;
}
