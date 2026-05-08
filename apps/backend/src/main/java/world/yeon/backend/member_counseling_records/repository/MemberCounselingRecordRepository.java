package world.yeon.backend.member_counseling_records.repository;

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
public class MemberCounselingRecordRepository {
	public record RecordRow(
		String publicId,
		String studentName,
		String sessionTitle,
		String counselingType,
		String counselorName,
		String status,
		String recordSource,
		String audioOriginalName,
		String audioMimeType,
		long audioByteSize,
		Integer audioDurationMs,
		String processingStage,
		Integer processingProgress,
		String processingMessage,
		String analysisStatus,
		Integer analysisProgress,
		String analysisErrorMessage,
		String errorMessage,
		String language,
		String sttModel,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt,
		OffsetDateTime transcriptionCompletedAt,
		OffsetDateTime analysisCompletedAt,
		String spacePublicId,
		String memberPublicId
	) {}

	@PersistenceContext
	private EntityManager entityManager;

	public List<RecordRow> listByMember(UUID userId, String memberPublicId, Integer limit, OffsetDateTime beforeCreatedAt) {
		StringBuilder sql = new StringBuilder("""
			select cr.public_id,
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
			       cr.processing_stage,
			       cr.processing_progress,
			       cr.processing_message,
			       cr.analysis_status,
			       cr.analysis_progress,
			       cr.analysis_error_message,
			       cr.error_message,
			       cr.language,
			       cr.stt_model,
			       cr.created_at,
			       cr.updated_at,
			       cr.transcription_completed_at,
			       cr.analysis_completed_at,
			       s.public_id as space_public_id,
			       m.public_id as member_public_id
			from public.counseling_records cr
			join public.members m on m.id = cr.member_id
			left join public.spaces s on s.id = cr.space_id
			where cr.created_by_user_id = :userId
			  and m.public_id = :memberPublicId
		""");
		if (beforeCreatedAt != null) {
			sql.append(" and cr.created_at < :beforeCreatedAt\n");
		}
		sql.append(" order by cr.created_at desc\n");
		var query = entityManager.createNativeQuery(sql.toString())
			.setParameter("userId", userId)
			.setParameter("memberPublicId", memberPublicId);
		if (beforeCreatedAt != null) {
			query.setParameter("beforeCreatedAt", Timestamp.from(beforeCreatedAt.toInstant()));
		}
		query.setMaxResults(limit == null ? 100 : limit);
		List<?> rows = query.getResultList();
		return rows.stream().map(row -> {
			Object[] v = (Object[]) row;
			return new RecordRow(
				(String) v[0], (String) v[1], (String) v[2], (String) v[3], (String) v[4], (String) v[5], (String) v[6],
				(String) v[7], (String) v[8], ((Number) v[9]).longValue(), (Integer) v[10], (String) v[11], (Integer) v[12],
				(String) v[13], (String) v[14], (Integer) v[15], (String) v[16], (String) v[17], (String) v[18], (String) v[19],
				asOffsetDateTime(v[20]), asOffsetDateTime(v[21]), asOffsetDateTime(v[22]), asOffsetDateTime(v[23]), (String) v[24], (String) v[25]
			);
		}).toList();
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		return OffsetDateTime.parse(String.valueOf(value));
	}
}
