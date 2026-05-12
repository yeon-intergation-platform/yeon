package world.yeon.backend.counseling_record_transcription.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class CounselingRecordTranscriptionRepository {
	public record RecordRow(
		Long internalId,
		String publicId,
		UUID createdByUserId,
		String status,
		String processingStage,
		String recordSource,
		String audioStoragePath,
		String audioOriginalName,
		String audioMimeType,
		int audioByteSize,
		Integer audioDurationMs,
		String studentName,
		Integer transcriptionAttemptCount
	) {}

	public record TranscriptSegment(
		int segmentIndex,
		Integer startMs,
		Integer endMs,
		String speakerLabel,
		String speakerTone,
		String text
	) {}

	@PersistenceContext
	private EntityManager entityManager;

	public RecordRow findOwnedRecord(UUID userId, String recordPublicId) {
		List<?> rows = entityManager.createNativeQuery("""
			select cr.id,
			       cr.public_id,
			       cr.created_by_user_id,
			       cr.status,
			       cr.processing_stage,
			       cr.record_source,
			       cr.audio_storage_path,
			       cr.audio_original_name,
			       cr.audio_mime_type,
			       coalesce(cr.audio_byte_size, 0),
			       cr.audio_duration_ms,
			       cr.student_name,
			       cr.transcription_attempt_count
			from public.counseling_records cr
			where cr.created_by_user_id = :userId
			  and cr.public_id = :recordPublicId
			limit 1
		""")
			.setParameter("userId", userId)
			.setParameter("recordPublicId", recordPublicId)
			.getResultList();

		if (rows.isEmpty()) return null;
		Object[] v = (Object[]) rows.getFirst();
		return new RecordRow(
			asLong(v[0]),
			(String) v[1],
			asUuid(v[2]),
			(String) v[3],
			(String) v[4],
			(String) v[5],
			(String) v[6],
			(String) v[7],
			(String) v[8],
			((Number) v[9]).intValue(),
			(Integer) v[10],
			(String) v[11],
			(Integer) v[12]
		);
	}

	@Transactional
	public void markQueued(RecordRow record, boolean preservePartial) {
		entityManager.createNativeQuery("""
			update public.counseling_records
			set status = 'processing',
			    error_message = null,
			    processing_stage = 'queued',
			    processing_progress = 5,
			    processing_message = :message,
			    processing_chunk_count = 0,
			    processing_chunk_completed_count = 0,
			    transcription_chunks = null,
			    analysis_status = 'idle',
			    analysis_progress = 0,
			    analysis_error_message = null,
			    analysis_result = null,
			    analysis_completed_at = null,
			    updated_at = now()
			where id = :id
		""")
			.setParameter("message", preservePartial ? "누락된 전사 구간을 다시 준비하고 있습니다." : "백그라운드 전사를 다시 준비하고 있습니다.")
			.setParameter("id", record.internalId())
			.executeUpdate();
	}

	@Transactional
	public void updateProcessing(Long recordInternalId, String stage, int progress, String message, Integer attemptCount) {
		entityManager.createNativeQuery("""
			update public.counseling_records
			set status = 'processing',
			    processing_stage = :stage,
			    processing_progress = :progress,
			    processing_message = :message,
			    transcription_attempt_count = coalesce(:attemptCount, transcription_attempt_count),
			    error_message = null,
			    updated_at = now()
			where id = :id
		""")
			.setParameter("stage", stage)
			.setParameter("progress", progress)
			.setParameter("message", message)
			.setParameter("attemptCount", attemptCount)
			.setParameter("id", recordInternalId)
			.executeUpdate();
	}

	@Transactional
	public void persistTranscript(Long recordInternalId, String transcriptText, String language, String model, Integer durationMs, List<TranscriptSegment> segments) {
		entityManager.createNativeQuery("""
			update public.counseling_records
			set status = 'ready',
			    transcript_text = :transcriptText,
			    transcript_segment_count = :segmentCount,
			    language = :language,
			    stt_model = :model,
			    audio_duration_ms = coalesce(:durationMs, audio_duration_ms),
			    error_message = null,
			    processing_stage = 'transcript_ready',
			    processing_progress = 100,
			    processing_message = '원문 준비가 완료되었습니다. AI 분석을 백그라운드에서 생성합니다.',
			    transcription_chunks = null,
			    analysis_status = 'queued',
			    analysis_progress = 0,
			    analysis_error_message = null,
			    transcription_completed_at = now(),
			    updated_at = now()
			where id = :id
		""")
			.setParameter("transcriptText", transcriptText)
			.setParameter("segmentCount", segments.size())
			.setParameter("language", language)
			.setParameter("model", model)
			.setParameter("durationMs", durationMs)
			.setParameter("id", recordInternalId)
			.executeUpdate();

		entityManager.createNativeQuery("delete from public.counseling_transcript_segments where record_id = :recordId")
			.setParameter("recordId", recordInternalId)
			.executeUpdate();

		for (TranscriptSegment segment : segments) {
			entityManager.createNativeQuery("""
				insert into public.counseling_transcript_segments
				(public_id, record_id, segment_index, start_ms, end_ms, speaker_label, speaker_tone, text, created_at, updated_at)
				values (:publicId, :recordId, :segmentIndex, :startMs, :endMs, :speakerLabel, :speakerTone, :text, now(), now())
			""")
				.setParameter("publicId", "cts_" + UUID.randomUUID().toString().replace("-", ""))
				.setParameter("recordId", recordInternalId)
				.setParameter("segmentIndex", segment.segmentIndex())
				.setParameter("startMs", segment.startMs())
				.setParameter("endMs", segment.endMs())
				.setParameter("speakerLabel", segment.speakerLabel())
				.setParameter("speakerTone", segment.speakerTone())
				.setParameter("text", segment.text())
				.executeUpdate();
		}
	}

	@Transactional
	public void markError(Long recordInternalId, String message) {
		entityManager.createNativeQuery("""
			update public.counseling_records
			set status = 'error',
			    processing_stage = 'error',
			    processing_progress = 0,
			    processing_message = :message,
			    error_message = :message,
			    analysis_status = 'idle',
			    analysis_progress = 0,
			    updated_at = now()
			where id = :id
		""")
			.setParameter("message", message)
			.setParameter("id", recordInternalId)
			.executeUpdate();
	}

	@SuppressWarnings("unused")
	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		return OffsetDateTime.parse(String.valueOf(value));
	}

	private Long asLong(Object value) { return value == null ? null : ((Number) value).longValue(); }
	private UUID asUuid(Object value) { return value instanceof UUID uuid ? uuid : UUID.fromString(String.valueOf(value)); }
}
