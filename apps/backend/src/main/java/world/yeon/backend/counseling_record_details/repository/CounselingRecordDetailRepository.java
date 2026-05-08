package world.yeon.backend.counseling_record_details.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("jdbc")
public class CounselingRecordDetailRepository {
	public record RecordRow(
		Long internalId,
		String publicId,
		String spacePublicId,
		String memberPublicId,
		String studentName,
		String sessionTitle,
		String counselingType,
		String counselorName,
		String status,
		String recordSource,
		String audioOriginalName,
		String audioMimeType,
		int audioByteSize,
		Integer audioDurationMs,
		String audioStoragePath,
		String transcriptText,
		int transcriptSegmentCount,
		String processingStage,
		Integer processingProgress,
		String processingMessage,
		Integer processingChunkCount,
		Integer processingChunkCompletedCount,
		Integer transcriptionAttemptCount,
		String analysisStatus,
		Integer analysisProgress,
		String analysisErrorMessage,
		Integer analysisAttemptCount,
		String language,
		String sttModel,
		String errorMessage,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt,
		OffsetDateTime transcriptionCompletedAt,
		OffsetDateTime analysisCompletedAt,
		String analysisResultJson,
		String assistantMessagesJson
	) {}

	public record SegmentRow(
		Long recordInternalId,
		String publicId,
		int segmentIndex,
		Integer startMs,
		Integer endMs,
		String speakerLabel,
		String speakerTone,
		String text
	) {}

	@PersistenceContext
	private EntityManager entityManager;

	public List<RecordRow> findOwnedRecords(UUID userId, List<String> recordPublicIds) {
		if (recordPublicIds.isEmpty()) {
			return List.of();
		}

		return entityManager.createNativeQuery("""
			select cr.id,
			       cr.public_id,
			       s.public_id as space_public_id,
			       m.public_id as member_public_id,
			       cr.student_name,
			       cr.session_title,
			       cr.counseling_type,
			       cr.counselor_name,
			       cr.status,
			       cr.record_source,
			       cr.audio_original_name,
			       cr.audio_mime_type,
			       coalesce(cr.audio_byte_size, 0),
			       cr.audio_duration_ms,
			       cr.audio_storage_path,
			       cr.transcript_text,
			       coalesce(cr.transcript_segment_count, 0),
			       cr.processing_stage,
			       cr.processing_progress,
			       cr.processing_message,
			       cr.processing_chunk_count,
			       cr.processing_chunk_completed_count,
			       cr.transcription_attempt_count,
			       cr.analysis_status,
			       cr.analysis_progress,
			       cr.analysis_error_message,
			       cr.analysis_attempt_count,
			       cr.language,
			       cr.stt_model,
			       cr.error_message,
			       cr.created_at,
			       cr.updated_at,
			       cr.transcription_completed_at,
			       cr.analysis_completed_at,
			       cr.analysis_result::text,
			       cr.assistant_messages::text
			from public.counseling_records cr
			left join public.spaces s on s.id = cr.space_id
			left join public.members m on m.id = cr.member_id
			where cr.created_by_user_id = :userId
			  and cr.public_id in (:recordPublicIds)
		""")
			.setParameter("userId", userId)
			.setParameter("recordPublicIds", recordPublicIds)
			.getResultList()
			.stream()
			.map(this::toRecordRow)
			.toList();
	}

	public List<SegmentRow> findSegments(List<Long> recordInternalIds) {
		if (recordInternalIds.isEmpty()) {
			return List.of();
		}

		return entityManager.createNativeQuery("""
			select ts.record_id,
			       ts.public_id,
			       ts.segment_index,
			       ts.start_ms,
			       ts.end_ms,
			       ts.speaker_label,
			       ts.speaker_tone,
			       ts.text
			from public.counseling_transcript_segments ts
			where ts.record_id in (:recordInternalIds)
			order by ts.record_id asc, ts.segment_index asc
		""")
			.setParameter("recordInternalIds", recordInternalIds)
			.getResultList()
			.stream()
			.map(this::toSegmentRow)
			.toList();
	}

	private RecordRow toRecordRow(Object row) {
		Object[] v = (Object[]) row;
		return new RecordRow(
			asLong(v[0]),
			(String) v[1],
			(String) v[2],
			(String) v[3],
			(String) v[4],
			(String) v[5],
			(String) v[6],
			(String) v[7],
			(String) v[8],
			(String) v[9],
			(String) v[10],
			(String) v[11],
			((Number) v[12]).intValue(),
			(Integer) v[13],
			(String) v[14],
			(String) v[15],
			((Number) v[16]).intValue(),
			(String) v[17],
			(Integer) v[18],
			(String) v[19],
			(Integer) v[20],
			(Integer) v[21],
			(Integer) v[22],
			(String) v[23],
			(Integer) v[24],
			(String) v[25],
			(Integer) v[26],
			(String) v[27],
			(String) v[28],
			(String) v[29],
			asOffsetDateTime(v[30]),
			asOffsetDateTime(v[31]),
			asOffsetDateTime(v[32]),
			asOffsetDateTime(v[33]),
			(String) v[34],
			(String) v[35]
		);
	}

	private SegmentRow toSegmentRow(Object row) {
		Object[] v = (Object[]) row;
		return new SegmentRow(
			asLong(v[0]),
			(String) v[1],
			((Number) v[2]).intValue(),
			(Integer) v[3],
			(Integer) v[4],
			(String) v[5],
			(String) v[6],
			(String) v[7]
		);
	}

	private Long asLong(Object value) {
		return value == null ? null : ((Number) value).longValue();
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		return OffsetDateTime.parse(String.valueOf(value));
	}
}
