import {
  runSheetExportInSpring,
  runSheetImportInSpring,
  fetchSheetExportRowsFromSpring,
  type SpringSheetExportRow,
} from "@/server/sheet-export-spring-client";
import { getValidSheetsAccessToken } from "@/server/services/googledrive-service";
import { ServiceError } from "@/server/services/service-error";

export function extractSheetId(sheetUrl: string): string {
  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);

  if (!match || !match[1]) {
    throw new ServiceError(
      400,
      "구글 시트 URL에서 시트 ID를 추출하지 못했습니다. URL 형식을 확인해 주세요."
    );
  }

  return match[1];
}

const MEMBER_ID_COLUMN = "__yeon_member_id";
const EXPORTED_AT_COLUMN = "__yeon_exported_at";

type MemberSyncPayload = {
  core: {
    name: string;
    email: string | null;
    phone: string | null;
    status: string | null;
    initialRiskLevel: string | null;
  };
  customFields: Record<string, string | null>;
};

type ExportRowData = {
  memberId: string;
  values: string[];
  payload: MemberSyncPayload;
};

type SheetImportConflictType =
  | "metadata_missing"
  | "duplicate_member_row"
  | "unknown_managed_row"
  | "deleted_on_server"
  | "deleted_in_sheet"
  | "both_sides_changed"
  | "new_row_matches_existing_member";

export type SheetImportConflict = {
  type: SheetImportConflictType;
  rowNumber: number | null;
  memberId: string | null;
  memberName: string | null;
  changedFields: string[];
  message: string;
  base: MemberSyncPayload | null;
  sheet: MemberSyncPayload | null;
  server: MemberSyncPayload | null;
};

export type SheetImportSummary = {
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  conflicts: number;
};

export type SheetImportResult =
  | {
      status: "applied";
      summary: SheetImportSummary;
      conflicts: SheetImportConflict[];
      lastSyncedAt: Date;
    }
  | {
      status: "blocked";
      summary: SheetImportSummary;
      conflicts: SheetImportConflict[];
      lastSyncedAt: Date | null;
    };

export async function importSpaceFromLinkedSheet(
  spaceId: string,
  sheetId: string,
  userId: string
): Promise<SheetImportResult> {
  const accessToken = await getValidSheetsAccessToken(userId);
  if (!accessToken) {
    throw new ServiceError(
      401,
      "Google 계정이 연결되어 있지 않습니다. 먼저 Google 계정을 연결해주세요."
    );
  }

  const result = await runSheetImportInSpring(spaceId, userId, {
    sheetId,
    accessToken,
  });

  if (result.status === "blocked") {
    return {
      status: "blocked",
      summary: result.summary,
      conflicts: result.conflicts,
      lastSyncedAt: result.lastSyncedAt ? new Date(result.lastSyncedAt) : null,
    };
  }

  return {
    status: "applied",
    summary: result.summary,
    conflicts: result.conflicts,
    lastSyncedAt: result.lastSyncedAt
      ? new Date(result.lastSyncedAt)
      : new Date(),
  };
}

export async function buildSpaceExportData(
  spaceId: string,
  userId: string
): Promise<{ values: string[][]; memberCount: number; rows: ExportRowData[] }> {
  const result = await fetchSheetExportRowsFromSpring(spaceId, userId);
  const rows = result.rows.map((row: SpringSheetExportRow) => ({
    memberId: row.memberId,
    values: row.values,
    payload: row.payload,
  }));
  const fieldDefinitions = result.fieldDefinitions;
  const exportedAt = new Date().toISOString();
  const header = [
    "이름",
    "이메일",
    "전화번호",
    "수강 상태",
    "위험도",
    "등록일",
    ...fieldDefinitions.map((field) => field.name),
    MEMBER_ID_COLUMN,
    EXPORTED_AT_COLUMN,
  ];

  return {
    values: [
      header,
      ...rows.map((row) => [...row.values, row.memberId, exportedAt]),
    ],
    memberCount: rows.length,
    rows,
  };
}

export async function exportSpaceToSheet(
  spaceId: string,
  sheetId: string,
  userId: string
): Promise<{ exported: number; lastSyncedAt: Date }> {
  const accessToken = await getValidSheetsAccessToken(userId);
  if (!accessToken) {
    throw new ServiceError(
      401,
      "Google 계정이 연결되어 있지 않습니다. 먼저 Google 계정을 연결해주세요."
    );
  }

  const result = await runSheetExportInSpring(spaceId, userId, {
    sheetId,
    accessToken,
  });

  return {
    exported: result.exportedCount,
    lastSyncedAt: new Date(result.lastSyncedAt),
  };
}
