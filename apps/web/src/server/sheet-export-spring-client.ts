export type SpringSheetExportFieldDefinition = {
  id: string;
  name: string;
  fieldType: string;
};

export type SpringSheetExportIntegration = {
  publicId: string;
  sheetUrl: string;
  sheetId: string;
  dataType: string;
  columnMapping: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetSheetExportIntegrationResponse = {
  integration: SpringSheetExportIntegration | null;
};

export type UpsertSheetExportIntegrationInput = {
  sheetUrl: string;
};

export type UpsertSheetExportIntegrationResponse = {
  integration: SpringSheetExportIntegration;
};

export type DeleteSheetExportIntegrationResponse = {
  ok: boolean;
};

export type SpringSheetExportPayloadCore = {
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  initialRiskLevel: string | null;
};

export type SpringSheetExportPayload = {
  core: SpringSheetExportPayloadCore;
  customFields: Record<string, string | null>;
};

export type SpringSheetExportRow = {
  memberId: string;
  values: string[];
  payload: SpringSheetExportPayload;
};

export type SpringSheetExportRowsResponse = {
  fieldDefinitions: SpringSheetExportFieldDefinition[];
  rows: SpringSheetExportRow[];
};

export type SpringSheetExportSnapshot = {
  memberId: string;
  basePayload: SpringSheetExportPayload;
  basePayloadHash: string;
  exportedAt: string;
};

export type SpringSheetExportSnapshotsResponse = {
  lastSyncedAt: string | null;
  snapshots: SpringSheetExportSnapshot[];
};

export type ReplaceSheetExportSnapshotRowInput = {
  memberId: string;
  payload: SpringSheetExportPayload;
};

export type ReplaceSheetExportSnapshotsInput = {
  sheetId: string;
  exportedAt: string;
  rows: ReplaceSheetExportSnapshotRowInput[];
};

export type ReplaceSheetExportSnapshotsResponse = {
  replacedCount: number;
};

export type FinalizeSheetExportSyncInput = {
  sheetId: string;
  exportedAt: string;
  rows: ReplaceSheetExportSnapshotRowInput[];
};

export type FinalizeSheetExportSyncResponse = {
  exportedCount: number;
  lastSyncedAt: string;
};

export type RunSheetExportInput = {
  sheetId: string;
  accessToken: string;
};

export type RunSheetExportResponse = {
  exportedCount: number;
  lastSyncedAt: string;
};

export type RunSheetImportInput = {
  sheetId: string;
  accessToken: string;
};

export type RunSheetImportResponse = {
  status: "applied" | "blocked";
  summary: SpringSheetExportImportSummary;
  conflicts: SpringSheetExportImportConflict[];
  lastSyncedAt: string | null;
};

export type SpringSheetExportImportContextFieldDefinition = {
  id: string;
  name: string;
  fieldType: string;
};

export type SpringSheetExportImportContextMember = {
  memberId: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  initialRiskLevel: string | null;
  payload: SpringSheetExportPayload;
};

export type SpringSheetExportImportContextResponse = {
  lastSyncedAt: string | null;
  fieldDefinitions: SpringSheetExportImportContextFieldDefinition[];
  members: SpringSheetExportImportContextMember[];
  snapshots: SpringSheetExportSnapshot[];
};

export type SpringSheetExportImportConflict = {
  type:
    | "metadata_missing"
    | "duplicate_member_row"
    | "unknown_managed_row"
    | "deleted_on_server"
    | "deleted_in_sheet"
    | "both_sides_changed"
    | "new_row_matches_existing_member";
  rowNumber: number | null;
  memberId: string | null;
  memberName: string | null;
  changedFields: string[];
  message: string;
  base: SpringSheetExportPayload | null;
  sheet: SpringSheetExportPayload | null;
  server: SpringSheetExportPayload | null;
};

export type SpringSheetExportImportSummary = {
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  conflicts: number;
};

export type SpringSheetExportImportPlannedValue = {
  fieldDefinitionId: string;
  value: string | null;
};

export type SpringSheetExportImportPlannedMutation = {
  memberPublicId: string | null;
  payload: SpringSheetExportPayload;
  customValues: SpringSheetExportImportPlannedValue[];
};

export type SpringSheetExportImportEvaluationResponse = {
  status: "blocked" | "applied";
  summary: SpringSheetExportImportSummary;
  conflicts: SpringSheetExportImportConflict[];
  lastSyncedAt: string | null;
  plannedCreates: SpringSheetExportImportPlannedMutation[];
  plannedUpdates: SpringSheetExportImportPlannedMutation[];
};

export type SpringSheetExportImportEvaluationInput = {
  sheetId: string;
  rows: string[][];
};

export type SpringSheetExportImportMutationValue = {
  fieldDefinitionId: string;
  value: string | null;
};

export type SpringSheetExportImportMutationItem = {
  memberPublicId: string | null;
  payload: SpringSheetExportPayload;
  customValues: SpringSheetExportImportMutationValue[];
};

export type SpringSheetExportImportMutationInput = {
  sheetId: string;
  plannedCreates: SpringSheetExportImportMutationItem[];
  plannedUpdates: SpringSheetExportImportMutationItem[];
};

export type SpringSheetExportImportMutationResponse = {
  createdCount: number;
  updatedCount: number;
};

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BACKEND_BASE_URL;
}

export class SheetExportSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SheetExportSpringBackendHttpError";
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

export async function fetchSheetExportRowsFromSpring(
  spaceId: string,
  userId: string,
): Promise<SpringSheetExportRowsResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/sheet-export/rows`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new SheetExportSpringBackendHttpError(response.status, message);
  }

  return parsed as SpringSheetExportRowsResponse;
}

export async function replaceSheetExportSnapshotsInSpring(
  spaceId: string,
  userId: string,
  input: ReplaceSheetExportSnapshotsInput,
): Promise<ReplaceSheetExportSnapshotsResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/sheet-export/snapshots`,
    {
      method: "PUT",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
      body: JSON.stringify(input),
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new SheetExportSpringBackendHttpError(response.status, message);
  }

  return parsed as ReplaceSheetExportSnapshotsResponse;
}

export async function evaluateSheetExportImportInSpring(
  spaceId: string,
  userId: string,
  input: SpringSheetExportImportEvaluationInput,
): Promise<SpringSheetExportImportEvaluationResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/sheet-export/import-evaluation`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
      body: JSON.stringify(input),
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new SheetExportSpringBackendHttpError(response.status, message);
  }

  return parsed as SpringSheetExportImportEvaluationResponse;
}

export async function applySheetExportImportMutationInSpring(
  spaceId: string,
  userId: string,
  input: SpringSheetExportImportMutationInput,
): Promise<SpringSheetExportImportMutationResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/sheet-export/import-mutation`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
      body: JSON.stringify(input),
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new SheetExportSpringBackendHttpError(response.status, message);
  }

  return parsed as SpringSheetExportImportMutationResponse;
}

export async function finalizeSheetExportSyncInSpring(
  spaceId: string,
  userId: string,
  input: FinalizeSheetExportSyncInput,
): Promise<FinalizeSheetExportSyncResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/sheet-export/sync`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
      body: JSON.stringify(input),
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new SheetExportSpringBackendHttpError(response.status, message);
  }

  return parsed as FinalizeSheetExportSyncResponse;
}

export async function runSheetExportInSpring(
  spaceId: string,
  userId: string,
  input: RunSheetExportInput,
): Promise<RunSheetExportResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/sheet-export/export-run`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
      body: JSON.stringify(input),
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new SheetExportSpringBackendHttpError(response.status, message);
  }

  return parsed as RunSheetExportResponse;
}

export async function runSheetImportInSpring(
  spaceId: string,
  userId: string,
  input: RunSheetImportInput,
): Promise<RunSheetImportResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/sheet-export/import-run`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
      body: JSON.stringify(input),
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new SheetExportSpringBackendHttpError(response.status, message);
  }

  return parsed as RunSheetImportResponse;
}

export async function fetchSheetExportIntegrationFromSpring(
  spaceId: string,
  userId: string,
): Promise<GetSheetExportIntegrationResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/sheet-export/integration`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new SheetExportSpringBackendHttpError(response.status, message);
  }

  return parsed as GetSheetExportIntegrationResponse;
}

export async function upsertSheetExportIntegrationInSpring(
  spaceId: string,
  userId: string,
  input: UpsertSheetExportIntegrationInput,
): Promise<UpsertSheetExportIntegrationResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/sheet-export/integration`,
    {
      method: "PUT",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
      body: JSON.stringify(input),
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new SheetExportSpringBackendHttpError(response.status, message);
  }

  return parsed as UpsertSheetExportIntegrationResponse;
}

export async function deleteSheetExportIntegrationInSpring(
  spaceId: string,
  userId: string,
): Promise<DeleteSheetExportIntegrationResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/spaces/${spaceId}/sheet-export/integration`,
    {
      method: "DELETE",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "X-Yeon-User-Id": userId,
        ...(process.env.SPRING_INTERNAL_TOKEN?.trim()
          ? { [INTERNAL_TOKEN_HEADER]: process.env.SPRING_INTERNAL_TOKEN.trim() }
          : {}),
      },
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? "Spring backend 요청에 실패했습니다.";
    throw new SheetExportSpringBackendHttpError(response.status, message);
  }

  return parsed as DeleteSheetExportIntegrationResponse;
}
