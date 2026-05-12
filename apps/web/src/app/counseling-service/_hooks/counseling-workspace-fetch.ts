async function readErrorMessage(
  response: Response,
  fallbackErrorMessage: string
): Promise<string> {
  const text = await response.text().catch(() => "");
  if (!text) return fallbackErrorMessage;

  try {
    const parsed = JSON.parse(text) as { message?: string };
    return parsed.message || fallbackErrorMessage;
  } catch {
    return text || fallbackErrorMessage;
  }
}

export async function counselingWorkspaceFetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackErrorMessage: string
): Promise<T> {
  const response = await fetch(input, { credentials: "include", ...init });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, fallbackErrorMessage));
  }

  return (await response.json()) as T;
}

export async function counselingWorkspaceFetchJsonOr<T>(
  input: RequestInfo | URL,
  fallbackValue: T,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(input, { credentials: "include", ...init });

  if (!response.ok) return fallbackValue;

  return (await response.json()) as T;
}

export async function counselingWorkspaceFetchResponse(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackErrorMessage: string
): Promise<Response> {
  const response = await fetch(input, { credentials: "include", ...init });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, fallbackErrorMessage));
  }

  return response;
}

export async function counselingWorkspaceFetchVoid(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackErrorMessage: string
): Promise<void> {
  const response = await fetch(input, { credentials: "include", ...init });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, fallbackErrorMessage));
  }
}
