import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";

type AuthSessionPayload = {
  authenticated?: unknown;
};

export async function fetchCurrentCardServiceAuthState(
  fetcher: typeof fetchYeon = fetchYeon
) {
  const response = await fetcher("/api/v1/auth/session", {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as AuthSessionPayload;
  return payload.authenticated === true;
}
