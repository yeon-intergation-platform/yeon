export type SpringSheetIntegrationColumnMapping = {
  nameColumn?: number | null;
  dateColumn?: number | null;
  statusColumn?: number | null;
  typeColumn?: number | null;
};

export type SpringSheetIntegration = {
  publicId: string;
  sheetUrl: string;
  sheetId: string;
  dataType: string;
  columnMapping: SpringSheetIntegrationColumnMapping | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetSheetIntegrationsResponse = {
  integrations: SpringSheetIntegration[];
};

export type CreateSheetIntegrationInput = {
  sheetUrl: string;
  dataType: string;
  columnMapping?: SpringSheetIntegrationColumnMapping | null;
};

export type CreateSheetIntegrationResponse = {
  integration: SpringSheetIntegration;
};

export type SyncSheetIntegrationResponse = {
  synced: number;
  errors: number;
};

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class SheetIntegrationsSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SheetIntegrationsSpringBackendHttpError";
    this.status = status;
  }
}

function tryParseJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractErrorMessage(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") return null;
  if ("message" in parsed && typeof parsed.message === "string") return parsed.message;
  if (
    "error" in parsed &&
    parsed.error &&
    typeof parsed.error === "object" &&
    "message" in parsed.error &&
    typeof parsed.error.message === "string"
  ) {
    return parsed.error.message;
  }
  return null;
}

async function readResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new SheetIntegrationsSpringBackendHttpError(response.status, message);
  }

  return parsed as T;
}

function buildHeaders(userId: string, includeJson = false) {
  return {
    accept: "application/json",
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    "X-Yeon-User-Id": userId,
    ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
      ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
      : {}),
  };
}

export async function fetchSheetIntegrationsFromSpring(
  spaceId: string,
  userId: string,
): Promise<GetSheetIntegrationsResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/sheet-integrations`,
    {
      method: "GET",
      cache: "no-store",
      headers: buildHeaders(userId),
    },
  );

  return readResponse<GetSheetIntegrationsResponse>(response);
}

export async function createSheetIntegrationInSpring(
  spaceId: string,
  userId: string,
  input: CreateSheetIntegrationInput,
): Promise<CreateSheetIntegrationResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/sheet-integrations`,
    {
      method: "POST",
      cache: "no-store",
      headers: buildHeaders(userId, true),
      body: JSON.stringify(input),
    },
  );

  return readResponse<CreateSheetIntegrationResponse>(response);
}

export async function syncSheetIntegrationInSpring(
  spaceId: string,
  integrationId: string,
  userId: string,
): Promise<SyncSheetIntegrationResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/sheet-integrations/${integrationId}/sync`,
    {
      method: "POST",
      cache: "no-store",
      headers: buildHeaders(userId),
    },
  );

  return readResponse<SyncSheetIntegrationResponse>(response);
}
