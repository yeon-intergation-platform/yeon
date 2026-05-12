import type {
  CounselingChatMessage,
  CounselingRecordDetail,
  CounselingRecordListItem,
} from "@yeon/api-contract/counseling-records";
import { analysisResultSchema } from "@yeon/api-contract/counseling-records";

import type { AiMessage, RecordItem, TranscriptSegment } from "./types";
import { fmtDurationMs, fmtRelativeDate } from "./utils";
import { normalizeCounselingTranscriptSegments } from "@/lib/counseling-transcript-display";

export const PARTIAL_TRANSCRIPT_READY_STAGE = "partial_transcript_ready";

export function mapAssistantMessages(
  messages: CounselingChatMessage[]
): AiMessage[] {
  return messages.map((message) => ({
    role: message.role,
    text: message.content,
    createdAt: message.createdAt,
  }));
}

export function listItemToRecordItem(
  item: CounselingRecordListItem
): RecordItem {
  return {
    id: item.id,
    spaceId: item.spaceId ?? null,
    memberId: item.memberId ?? null,
    createdAt: item.createdAt,
    title: item.sessionTitle || "제목 없음",
    status: item.status,
    errorMessage:
      item.status === "error" ? (item.errorMessage ?? "알 수 없는 오류") : null,
    meta: `${item.studentName || "수강생 미지정"} · ${fmtRelativeDate(item.createdAt)}`,
    duration: fmtDurationMs(item.audioDurationMs),
    durationMs: item.audioDurationMs ?? 0,
    studentName: item.studentName || "",
    type: item.counselingType || "",
    recordSource: item.recordSource,
    audioUrl: null,
    transcript: [],
    aiSummary: item.preview || "",
    aiMessages: [],
    aiMessagesLoaded: false,
    analysisResult: null,
    processingStage: item.processingStage,
    processingProgress: item.processingProgress,
    processingMessage: item.processingMessage,
    analysisStatus: item.analysisStatus,
    analysisProgress: item.analysisProgress,
  };
}

export function detailToTranscript(
  detail: CounselingRecordDetail
): TranscriptSegment[] {
  return normalizeCounselingTranscriptSegments(detail.transcriptSegments);
}

export function detailToRecordPatch(
  detail: CounselingRecordDetail
): Partial<RecordItem> {
  const rawAnalysis = detail.analysisResult;
  const parsedAnalysis =
    rawAnalysis != null ? analysisResultSchema.safeParse(rawAnalysis) : null;
  const analysisResult = parsedAnalysis?.success ? parsedAnalysis.data : null;

  return {
    spaceId: detail.spaceId ?? null,
    memberId: detail.memberId ?? null,
    createdAt: detail.createdAt,
    title: detail.sessionTitle || "제목 없음",
    status: detail.status,
    errorMessage:
      detail.status === "error"
        ? (detail.errorMessage ?? "알 수 없는 오류")
        : null,
    meta: `${detail.studentName || "수강생 미지정"} · ${fmtRelativeDate(detail.createdAt)}`,
    duration: fmtDurationMs(detail.audioDurationMs),
    durationMs: detail.audioDurationMs ?? 0,
    studentName: detail.studentName || "",
    type: detail.counselingType || "",
    recordSource: detail.recordSource,
    audioUrl: detail.audioUrl || null,
    transcript: detailToTranscript(detail),
    aiSummary: detail.preview || "",
    aiMessages: mapAssistantMessages(detail.assistantMessages),
    aiMessagesLoaded: true,
    analysisResult,
    processingStage: detail.processingStage,
    processingProgress: detail.processingProgress,
    processingMessage: detail.processingMessage,
    analysisStatus: detail.analysisStatus,
    analysisProgress: detail.analysisProgress,
  };
}

export function isPartialTranscriptReady(record: {
  status: RecordItem["status"];
  processingStage?: RecordItem["processingStage"];
}) {
  return (
    record.status === "processing" &&
    record.processingStage === PARTIAL_TRANSCRIPT_READY_STAGE
  );
}

export function needsBackgroundPolling(record: {
  status: RecordItem["status"];
  processingStage?: RecordItem["processingStage"];
  analysisStatus?: RecordItem["analysisStatus"];
}) {
  return (
    (record.status === "processing" &&
      record.processingStage !== PARTIAL_TRANSCRIPT_READY_STAGE) ||
    ["queued", "processing"].includes(record.analysisStatus ?? "")
  );
}

export function mergeRecordSources({
  serverItems,
  localOverrides,
  tempRecords,
}: {
  serverItems: CounselingRecordListItem[];
  localOverrides: Map<string, Partial<RecordItem>>;
  tempRecords: RecordItem[];
}): RecordItem[] {
  const serverMerged = serverItems.map(listItemToRecordItem).map((record) => {
    const overrides = localOverrides.get(record.id);
    if (!overrides) return record;
    return { ...record, ...overrides };
  });

  const serverIds = new Set(serverItems.map((item) => item.id));
  const preserved = tempRecords.filter(
    (record) =>
      !serverIds.has(record.id) &&
      (record.id.startsWith("temp-") || record.status === "processing")
  );

  return [...preserved, ...serverMerged];
}
