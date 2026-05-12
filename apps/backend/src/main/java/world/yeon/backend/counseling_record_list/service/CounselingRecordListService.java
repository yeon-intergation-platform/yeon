package world.yeon.backend.counseling_record_list.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import world.yeon.backend.counseling_record_list.dto.CounselingRecordListItemResponse;
import world.yeon.backend.counseling_record_list.dto.CounselingRecordListResponse;
import world.yeon.backend.counseling_record_list.repository.CounselingRecordListRepository;

@Service
public class CounselingRecordListService {
	private static final String AUDIO_UPLOAD = "audio_upload";
	private static final String TEXT_MEMO = "text_memo";
	private static final String DEMO_PLACEHOLDER = "demo_placeholder";
	private static final Set<String> VALID_STATUSES = Set.of("processing", "ready", "error");
	private static final Set<String> VALID_PROCESSING_STAGES = Set.of(
		"queued", "downloading", "chunking", "transcribing", "partial_transcript_ready",
		"resolving_speakers", "transcript_ready", "analyzing", "completed", "error"
	);
	private static final Set<String> VALID_ANALYSIS_STATUSES = Set.of("idle", "queued", "processing", "ready", "error");

	private final CounselingRecordListRepository repository;

	public CounselingRecordListService(CounselingRecordListRepository repository) {
		this.repository = repository;
	}

	public CounselingRecordListResponse listRecords(
		UUID userId,
		String spacePublicId,
		boolean unlinkedOnly,
		Integer limit,
		OffsetDateTime beforeCreatedAt
	) {
		List<CounselingRecordListItemResponse> records = repository
			.listRecords(userId, spacePublicId, unlinkedOnly, limit, beforeCreatedAt)
			.stream()
			.filter(row -> !DEMO_PLACEHOLDER.equals(resolveRecordSource(row.recordSource(), row.audioStoragePath())))
			.map(this::toResponse)
			.toList();
		return new CounselingRecordListResponse(records);
	}

	private CounselingRecordListItemResponse toResponse(CounselingRecordListRepository.RecordRow row) {
		String transcriptText = row.transcriptText() == null ? "" : row.transcriptText();
		String recordSource = resolveRecordSource(row.recordSource(), row.audioStoragePath());
		return new CounselingRecordListItemResponse(
			row.publicId(),
			row.spacePublicId(),
			row.memberPublicId(),
			row.studentName(),
			row.sessionTitle(),
			row.counselingType(),
			row.counselorName(),
			normalizeStatus(row.status()),
			recordSource,
			buildPreview(transcriptText, normalizeStatus(row.status()), row.errorMessage()),
			row.counselingType() == null || row.counselingType().isBlank() ? List.of() : List.of(row.counselingType()),
			row.audioOriginalName(),
			row.audioMimeType(),
			row.audioByteSize(),
			row.audioDurationMs(),
			Math.max(row.transcriptSegmentCount(), 0),
			transcriptText.length(),
			normalizeProcessingStage(row.processingStage()),
			clampProgress(row.processingProgress()),
			row.processingMessage(),
			Math.max(orZero(row.processingChunkCount()), 0),
			Math.max(orZero(row.processingChunkCompletedCount()), 0),
			Math.max(orZero(row.transcriptionAttemptCount()), 0),
			normalizeAnalysisStatus(row.analysisStatus()),
			clampProgress(row.analysisProgress()),
			row.analysisErrorMessage(),
			Math.max(orZero(row.analysisAttemptCount()), 0),
			row.language(),
			row.sttModel(),
			row.errorMessage(),
			toIsoString(row.createdAt()),
			toIsoString(row.updatedAt()),
			toIsoString(row.transcriptionCompletedAt()),
			toIsoString(row.analysisCompletedAt())
		);
	}

	private String buildPreview(String transcriptText, String status, String errorMessage) {
		if ("error".equals(status)) {
			return errorMessage == null || errorMessage.isBlank() ? "전사 처리 중 오류가 발생했습니다." : errorMessage;
		}
		String trimmed = transcriptText.trim();
		if (!trimmed.isEmpty()) {
			return trimmed.substring(0, Math.min(trimmed.length(), 96));
		}
		return "원문 전사를 준비 중입니다.";
	}

	private String resolveRecordSource(String raw, String audioStoragePath) {
		if (AUDIO_UPLOAD.equals(raw) || TEXT_MEMO.equals(raw) || DEMO_PLACEHOLDER.equals(raw)) {
			return raw;
		}
		if (audioStoragePath != null && audioStoragePath.startsWith("local://demo/")) {
			return DEMO_PLACEHOLDER;
		}
		if (audioStoragePath != null && audioStoragePath.startsWith("text_memo://")) {
			return TEXT_MEMO;
		}
		return AUDIO_UPLOAD;
	}

	private String normalizeStatus(String raw) {
		return VALID_STATUSES.contains(raw) ? raw : "error";
	}

	private String normalizeProcessingStage(String raw) {
		return VALID_PROCESSING_STAGES.contains(raw) ? raw : "error";
	}

	private String normalizeAnalysisStatus(String raw) {
		return VALID_ANALYSIS_STATUSES.contains(raw) ? raw : "idle";
	}

	private int clampProgress(Integer value) {
		if (value == null) return 0;
		return Math.max(0, Math.min(100, value));
	}

	private int orZero(Integer value) {
		return value == null ? 0 : value;
	}

	private String toIsoString(OffsetDateTime value) {
		return value == null ? null : value.toString();
	}
}
