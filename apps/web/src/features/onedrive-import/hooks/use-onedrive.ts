"use client";

import { useCallback, useState } from "react";
import { resolveApiHrefForCurrentPath } from "@/lib/app-route-paths";
import type { ImportPreview, ImportResult, OneDriveFile } from "../types";
import {
  analyzeOneDriveFile,
  importOneDrivePreview,
  loadOneDriveConnectionStatus,
  loadOneDriveFiles,
} from "./onedrive-import-fetch";

export type {
  ImportCohort,
  ImportPreview,
  ImportResult,
  ImportStudent,
  OneDriveFile,
} from "../types";

export function useOnedrive(onImportComplete?: () => void) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [files, setFiles] = useState<OneDriveFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<OneDriveFile | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [editablePreview, setEditablePreview] = useState<ImportPreview | null>(
    null
  );
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      setConnecting(true);
      const connectedStatus = await loadOneDriveConnectionStatus(
        resolveApiHrefForCurrentPath("/api/v1/integrations/onedrive/status")
      );
      if (connectedStatus === null) return;
      setConnected(connectedStatus);
    } catch {
      // 무시: 연결 상태 확인 실패는 치명적이지 않음
    } finally {
      setConnecting(false);
    }
  }, []);

  const connectOneDrive = useCallback(() => {
    window.location.href = resolveApiHrefForCurrentPath(
      "/api/v1/integrations/onedrive/auth"
    );
  }, []);

  const loadFiles = useCallback(async (folderId?: string) => {
    try {
      setFilesLoading(true);
      setError(null);
      const url = folderId
        ? resolveApiHrefForCurrentPath(
            `/api/v1/integrations/onedrive/files?folderId=${folderId}`
          )
        : resolveApiHrefForCurrentPath("/api/v1/integrations/onedrive/files");
      setFiles(await loadOneDriveFiles(url));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "파일 목록을 불러오지 못했습니다."
      );
    } finally {
      setFilesLoading(false);
    }
  }, []);

  const analyzeFile = useCallback(async (fileId: string) => {
    try {
      setAnalyzing(true);
      setError(null);
      const data = await analyzeOneDriveFile(
        resolveApiHrefForCurrentPath("/api/v1/integrations/onedrive/analyze"),
        fileId
      );
      setPreview(data);
      setEditablePreview(structuredClone(data));
      setShowFileBrowser(false);
      setShowPreview(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "파일 분석에 실패했습니다."
      );
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const selectFile = useCallback(
    (file: OneDriveFile) => {
      setSelectedFile(file);
      analyzeFile(file.id);
    },
    [analyzeFile]
  );

  const updatePreview = useCallback((updated: ImportPreview) => {
    setEditablePreview(updated);
  }, []);

  const confirmImport = useCallback(async () => {
    if (!editablePreview) return;

    try {
      setImporting(true);
      setError(null);
      const created = await importOneDrivePreview(
        resolveApiHrefForCurrentPath("/api/v1/integrations/onedrive/import"),
        editablePreview
      );
      setImportResult(created);
      onImportComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "가져오기에 실패했습니다.");
    } finally {
      setImporting(false);
    }
  }, [editablePreview, onImportComplete]);

  const resetState = useCallback(() => {
    setFiles([]);
    setSelectedFile(null);
    setPreview(null);
    setEditablePreview(null);
    setImportResult(null);
    setError(null);
    setShowFileBrowser(false);
    setShowPreview(false);
  }, []);

  return {
    connected,
    connecting,
    files,
    filesLoading,
    selectedFile,
    analyzing,
    preview,
    editablePreview,
    importing,
    importResult,
    error,
    showFileBrowser,
    showPreview,
    checkStatus,
    connectOneDrive,
    loadFiles,
    selectFile,
    analyzeFile,
    updatePreview,
    confirmImport,
    resetState,
    setShowFileBrowser,
    setShowPreview,
  };
}
