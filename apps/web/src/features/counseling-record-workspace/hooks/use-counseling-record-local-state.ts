"use client";

import { useCallback, useState } from "react";

type RecordIdentity = {
  id: string;
};

type LocalRecordShape<TMessage> = {
  aiMessages?: TMessage[];
  aiMessagesLoaded?: boolean;
  aiSummary?: string;
  status?: string;
  errorMessage?: string | null;
  analysisStatus?: string;
  analysisProgress?: number;
  processingMessage?: string | null;
  analysisResult?: unknown;
  memberId?: string | null;
};

export type CounselingRecordLocalPatch<TRecord, TMessage> = Partial<TRecord> &
  Partial<LocalRecordShape<TMessage>>;

function asLocalPatch<TRecord, TMessage>(
  patch: Partial<LocalRecordShape<TMessage>>
) {
  return patch as unknown as CounselingRecordLocalPatch<TRecord, TMessage>;
}

export function useCounselingRecordLocalState<
  TRecord extends RecordIdentity,
  TMessage,
>() {
  const [localOverrides, setLocalOverrides] = useState<
    Map<string, CounselingRecordLocalPatch<TRecord, TMessage>>
  >(new Map());
  const [tempRecords, setTempRecords] = useState<TRecord[]>([]);

  const patchRecord = useCallback(
    (id: string, patch: CounselingRecordLocalPatch<TRecord, TMessage>) => {
      setLocalOverrides((prev) => {
        const next = new Map(prev);
        const existing = next.get(id) ?? {};
        next.set(id, { ...existing, ...patch });
        return next;
      });
    },
    []
  );

  const addProcessingRecord = useCallback((record: TRecord) => {
    setTempRecords((prev) => {
      if (prev.some((r) => r.id === record.id)) return prev;
      return [record, ...prev];
    });
  }, []);

  const addReadyRecord = useCallback((record: TRecord) => {
    setTempRecords((prev) => {
      if (prev.some((r) => r.id === record.id)) return prev;
      return [record, ...prev];
    });
  }, []);

  const replaceRecord = useCallback((tempId: string, realRecord: TRecord) => {
    setTempRecords((prev) =>
      prev.map((record) => (record.id === tempId ? realRecord : record))
    );
  }, []);

  const removeRecordState = useCallback((id: string) => {
    setTempRecords((prev) => prev.filter((record) => record.id !== id));
    setLocalOverrides((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const markUploadError = useCallback(
    (id: string, message: string) => {
      const patch = asLocalPatch<TRecord, TMessage>({
        aiSummary: `업로드 실패: ${message}`,
        status: "error",
        errorMessage: message,
      });

      setTempRecords((prev) =>
        prev.map((record) =>
          record.id === id ? ({ ...record, ...patch } as TRecord) : record
        )
      );
      patchRecord(id, patch);
    },
    [patchRecord]
  );

  const updateMessages = useCallback(
    (id: string, updater: (prev: TMessage[]) => TMessage[]) => {
      setLocalOverrides((prev) => {
        const next = new Map(prev);
        const existing = next.get(id) ?? asLocalPatch<TRecord, TMessage>({});
        const currentMessages = existing.aiMessages ? existing.aiMessages : [];
        next.set(id, {
          ...existing,
          aiMessages: updater(currentMessages),
          aiMessagesLoaded: true,
        });
        return next;
      });
    },
    []
  );

  const clearMessages = useCallback(
    (id: string) => {
      patchRecord(
        id,
        asLocalPatch<TRecord, TMessage>({
          aiMessages: [],
          aiMessagesLoaded: true,
        })
      );
    },
    [patchRecord]
  );

  const markAnalysisRetryStart = useCallback(
    (id: string) => {
      patchRecord(
        id,
        asLocalPatch<TRecord, TMessage>({
          analysisStatus: "processing",
          analysisProgress: 0,
          processingMessage: "AI 분석을 다시 준비하고 있습니다.",
        })
      );
    },
    [patchRecord]
  );

  const updateAnalysisResult = useCallback(
    (id: string, result: unknown) => {
      patchRecord(
        id,
        asLocalPatch<TRecord, TMessage>({
          analysisResult: result,
        })
      );
    },
    [patchRecord]
  );

  const updateMemberId = useCallback(
    (id: string, memberId: string | null) => {
      patchRecord(id, asLocalPatch<TRecord, TMessage>({ memberId }));
    },
    [patchRecord]
  );

  return {
    localOverrides,
    tempRecords,
    patchRecord,
    addProcessingRecord,
    addReadyRecord,
    replaceRecord,
    removeRecordState,
    markUploadError,
    updateMessages,
    clearMessages,
    markAnalysisRetryStart,
    updateAnalysisResult,
    updateMemberId,
  };
}
