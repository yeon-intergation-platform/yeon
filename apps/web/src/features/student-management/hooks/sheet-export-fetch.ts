type ResolveApiHref = (path: string) => string;

export interface SheetExportIntegration {
  id: string;
  sheetUrl: string;
  sheetId: string;
  lastSyncedAt: string | null;
}

export type SheetExportConflict = {
  type: string;
  rowNumber: number | null;
  memberId: string | null;
  memberName: string | null;
  changedFields: string[];
  message: string;
};

export type GoogleDriveSheetStatus = {
  connected: boolean;
  sheetSyncReady?: boolean;
};

export type SheetExportStatus = {
  integration: SheetExportIntegration | null;
};

export type SheetExportSyncResult = {
  exported: number;
  lastSyncedAt: string;
};

export type SheetExportImportResult =
  | {
      status: "blocked";
      summary: {
        created: number;
        updated: number;
        unchanged: number;
        skipped: number;
        conflicts: number;
      };
      conflicts: SheetExportConflict[];
      lastSyncedAt: string | null;
    }
  | {
      status: "applied";
      summary: {
        created: number;
        updated: number;
        unchanged: number;
        skipped: number;
        conflicts: number;
      };
      lastSyncedAt: string;
    };

export type StudentExportFormat = "csv" | "xlsx";

async function readErrorMessage(
  res: Response,
  fallbackMessage: string
): Promise<string> {
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
  }

  const text = await res.text().catch(() => "");
  return text || fallbackMessage;
}

async function assertOk(res: Response, fallbackMessage: string) {
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, fallbackMessage));
  }
}

export async function fetchGoogleDriveSheetStatus(
  resolveApiHref: ResolveApiHref
): Promise<GoogleDriveSheetStatus> {
  const res = await fetch(
    resolveApiHref("/api/v1/integrations/googledrive/status")
  );
  await assertOk(res, "Google 연결 상태를 확인하지 못했습니다.");
  return (await res.json()) as GoogleDriveSheetStatus;
}

export async function fetchSheetExportStatus(
  resolveApiHref: ResolveApiHref,
  spaceId: string
): Promise<SheetExportStatus> {
  const res = await fetch(
    resolveApiHref(`/api/v1/spaces/${spaceId}/sheet-export`)
  );
  await assertOk(res, "시트 익스포트 설정을 불러오지 못했습니다.");
  return (await res.json()) as SheetExportStatus;
}

export async function connectSheetExport(
  resolveApiHref: ResolveApiHref,
  spaceId: string,
  sheetUrl: string
): Promise<void> {
  const res = await fetch(
    resolveApiHref(`/api/v1/spaces/${spaceId}/sheet-export`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheetUrl }),
    }
  );
  await assertOk(res, "시트를 연결하지 못했습니다.");
}

export async function syncSheetExport(
  resolveApiHref: ResolveApiHref,
  spaceId: string
): Promise<SheetExportSyncResult> {
  const res = await fetch(
    resolveApiHref(`/api/v1/spaces/${spaceId}/sheet-export/sync`),
    { method: "POST" }
  );
  await assertOk(res, "시트에 반영하지 못했습니다.");
  return (await res.json()) as SheetExportSyncResult;
}

export async function importSheetExport(
  resolveApiHref: ResolveApiHref,
  spaceId: string
): Promise<SheetExportImportResult> {
  const res = await fetch(
    resolveApiHref(`/api/v1/spaces/${spaceId}/sheet-export/import`),
    { method: "POST" }
  );

  if (res.status === 409) {
    return (await res.json()) as SheetExportImportResult;
  }

  await assertOk(res, "시트에서 수강생 데이터를 가져오지 못했습니다.");
  return (await res.json()) as SheetExportImportResult;
}

export async function fetchStudentExportBlob(
  resolveApiHref: ResolveApiHref,
  spaceId: string,
  format: StudentExportFormat
): Promise<Blob> {
  const res = await fetch(
    resolveApiHref(`/api/v1/spaces/${spaceId}/export/${format}`)
  );
  await assertOk(
    res,
    format === "csv"
      ? "CSV 다운로드에 실패했습니다."
      : "엑셀 다운로드에 실패했습니다."
  );
  return res.blob();
}

export async function disconnectSheetExport(
  resolveApiHref: ResolveApiHref,
  spaceId: string
): Promise<void> {
  const res = await fetch(
    resolveApiHref(`/api/v1/spaces/${spaceId}/sheet-export`),
    {
      method: "DELETE",
    }
  );
  await assertOk(res, "연결을 해제하지 못했습니다.");
}
