package world.yeon.backend.counseling_record_details.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.NullNode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordAssistantMessageResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailItemResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailsResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTranscriptSegmentResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSegmentResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSourceItemResponse;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTrendSourcesResponse;
import world.yeon.backend.counseling_record_details.repository.CounselingRecordDetailRepository;

@Service
@Profile("jdbc")
public class CounselingRecordDetailService {
	private static final String AUDIO_UPLOAD = "audio_upload";
	private static final String TEXT_MEMO = "text_memo";
	private static final String DEMO_PLACEHOLDER = "demo_placeholder";
	private static final Set<String> VALID_STATUSES = Set.of("processing", "ready", "error");
	private static final Set<String> VALID_PROCESSING_STAGES = Set.of(
		"queued", "downloading", "chunking", "transcribing", "partial_transcript_ready",
		"resolving_speakers", "transcript_ready", "analyzing", "completed", "error"
	);
	private static final Set<String> VALID_ANALYSIS_STATUSES = Set.of("idle", "queued", "processing", "ready", "error");
	private static final Set<String> VALID_SPEAKER_TONES = Set.of("teacher", "student", "unknown");
	private static final TypeReference<List<CounselingRecordAssistantMessageResponse>> ASSISTANT_MESSAGE_LIST_TYPE =
		new TypeReference<>() {};

	private final CounselingRecordDetailRepository repository;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public CounselingRecordDetailService(CounselingRecordDetailRepository repository) {
		this.repository = repository;
	}

	public CounselingRecordDetailsResponse getDetails(UUID userId, List<String> recordPublicIds) {
		List<CounselingRecordDetailRepository.RecordRow> rows = repository.findOwnedRecords(userId, recordPublicIds);
		Map<String, CounselingRecordDetailRepository.RecordRow> rowByPublicId = new LinkedHashMap<>();
		for (CounselingRecordDetailRepository.RecordRow row : rows) {
			rowByPublicId.put(row.publicId(), row);
		}

		Map<Long, List<CounselingRecordDetailRepository.SegmentRow>> segmentsByRecordId = new LinkedHashMap<>();
		for (CounselingRecordDetailRepository.SegmentRow segment : repository.findSegments(
			rows.stream().map(CounselingRecordDetailRepository.RecordRow::internalId).toList()
		)) {
			segmentsByRecordId.computeIfAbsent(segment.recordInternalId(), key -> new ArrayList<>()).add(segment);
		}

		List<CounselingRecordDetailItemResponse> records = new ArrayList<>();
		for (String recordPublicId : recordPublicIds) {
			CounselingRecordDetailRepository.RecordRow row = rowByPublicId.get(recordPublicId);
			if (row == null || DEMO_PLACEHOLDER.equals(resolveRecordSource(row.recordSource(), row.audioStoragePath()))) {
				continue;
			}
			records.add(toResponse(row, segmentsByRecordId.getOrDefault(row.internalId(), List.of())));
		}

		return new CounselingRecordDetailsResponse(records);
	}

	public CounselingRecordDetailItemResponse getDetail(UUID userId, String recordPublicId) {
		List<CounselingRecordDetailRepository.RecordRow> rows = repository.findOwnedRecords(userId, List.of(recordPublicId));
		CounselingRecordDetailRepository.RecordRow row = rows.stream()
			.filter(item -> recordPublicId.equals(item.publicId()))
			.findFirst()
			.orElseThrow(() -> new CounselingRecordDetailServiceException(404, "COUNSELING_RECORD_NOT_FOUND", "상담 기록을 찾지 못했습니다."));

		String recordSource = resolveRecordSource(row.recordSource(), row.audioStoragePath());
		if (DEMO_PLACEHOLDER.equals(recordSource)) {
			throw new CounselingRecordDetailServiceException(
				404,
				"COUNSELING_RECORD_PLACEHOLDER",
				"이 상담 기록은 실제 원본 음성이 없는 데모 데이터라 더 이상 열 수 없습니다."
			);
		}

		List<CounselingRecordDetailRepository.SegmentRow> segments = repository.findSegments(List.of(row.internalId()));
		return toResponse(row, segments);
	}

	public CounselingRecordTrendSourcesResponse getTrendSources(UUID userId, List<String> recordPublicIds) {
		List<CounselingRecordDetailItemResponse> records = getDetails(userId, recordPublicIds.stream().limit(5).toList()).records();
		Set<String> names = records.stream().map(CounselingRecordDetailItemResponse::studentName).collect(java.util.stream.Collectors.toSet());
		if (names.size() > 1) {
			throw new CounselingRecordDetailServiceException(400, "TREND_RECORD_STUDENT_MISMATCH", "같은 수강생의 기록만 추이 분석할 수 있습니다.");
		}

		return new CounselingRecordTrendSourcesResponse(
			records.stream().map(record -> new CounselingRecordTrendSourceItemResponse(
				record.studentName(),
				record.sessionTitle(),
				record.counselingType(),
				record.createdAt(),
				record.transcriptSegments().stream()
					.map(segment -> new CounselingRecordTrendSegmentResponse(
						segment.speakerLabel(),
						segment.text(),
						segment.startMs() == null ? 0 : segment.startMs()
					))
					.toList()
			)).toList()
		);
	}

	private CounselingRecordDetailItemResponse toResponse(
		CounselingRecordDetailRepository.RecordRow row,
		List<CounselingRecordDetailRepository.SegmentRow> segments
	) {
		String transcriptText = row.transcriptText() == null ? "" : row.transcriptText();
		String recordSource = resolveRecordSource(row.recordSource(), row.audioStoragePath());
		return new CounselingRecordDetailItemResponse(
			row.publicId(),
			row.spacePublicId(),
			row.memberPublicId(),
			row.studentName(),
			row.sessionTitle(),
			row.counselingType(),
			row.counselorName(),
			normalizeStatus(row.status()),
			recordSource,
			buildPreview(transcriptText),
			List.of(row.counselingType()),
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
			toIsoString(row.analysisCompletedAt()),
			transcriptText,
			segments.stream().map(this::toSegmentResponse).toList(),
			AUDIO_UPLOAD.equals(recordSource) ? "/api/v1/counseling-records/" + row.publicId() + "/audio" : null,
			parseAnalysisResult(row.analysisResultJson()),
			parseAssistantMessages(row.assistantMessagesJson())
		);
	}

	private CounselingRecordTranscriptSegmentResponse toSegmentResponse(CounselingRecordDetailRepository.SegmentRow segment) {
		return new CounselingRecordTranscriptSegmentResponse(
			segment.publicId(),
			segment.segmentIndex(),
			segment.startMs(),
			segment.endMs(),
			segment.speakerLabel(),
			normalizeSpeakerTone(segment.speakerTone()),
			segment.text()
		);
	}

	private JsonNode parseAnalysisResult(String raw) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		try {
			return objectMapper.readTree(raw);
		} catch (Exception ignored) {
			return null;
		}
	}

	private List<CounselingRecordAssistantMessageResponse> parseAssistantMessages(String raw) {
		if (raw == null || raw.isBlank()) {
			return List.of();
		}
		try {
			return objectMapper.readValue(raw, ASSISTANT_MESSAGE_LIST_TYPE);
		} catch (Exception ignored) {
			return List.of();
		}
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

	private String normalizeSpeakerTone(String raw) {
		return VALID_SPEAKER_TONES.contains(raw) ? raw : "unknown";
	}

	private int clampProgress(Integer value) {
		if (value == null) {
			return 0;
		}
		return Math.max(0, Math.min(100, value));
	}

	private int orZero(Integer value) {
		return value == null ? 0 : value;
	}

	private String buildPreview(String transcriptText) {
		if (transcriptText != null && !transcriptText.trim().isEmpty()) {
			String normalized = transcriptText.trim().replaceAll("\\s+", " ");
			return normalized.substring(0, Math.min(normalized.length(), 96));
		}
		return "원문 전사를 준비 중입니다.";
	}

	private String toIsoString(java.time.OffsetDateTime value) {
		return value == null ? null : value.toString();
	}
}
