export async function studentManagementFetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackErrorMessage: string
): Promise<T> {
  const response = await fetch(input, { credentials: "include", ...init });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
      error?: string;
    } | null;
    throw new Error(payload?.message || payload?.error || fallbackErrorMessage);
  }

  return (await response.json()) as T;
}

export async function studentManagementFetchVoid(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackErrorMessage: string
): Promise<void> {
  const response = await fetch(input, { credentials: "include", ...init });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
      error?: string;
    } | null;
    throw new Error(payload?.message || payload?.error || fallbackErrorMessage);
  }
}

export async function studentManagementFetchBlob(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackErrorMessage: string
): Promise<Blob> {
  const response = await fetch(input, { credentials: "include", ...init });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
      error?: string;
    } | null;
    throw new Error(payload?.message || payload?.error || fallbackErrorMessage);
  }

  return response.blob();
}
