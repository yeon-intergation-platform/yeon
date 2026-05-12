package world.yeon.backend.counseling_record_create.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class CounselingRecordCreateRepository {
	public record MemberRow(Long internalId, Long spaceInternalId, String name) {}

	@PersistenceContext
	private EntityManager entityManager;

	public MemberRow findOwnedMember(UUID userId, String memberPublicId) {
		if (memberPublicId == null || memberPublicId.isBlank()) return null;
		List<?> rows = entityManager.createNativeQuery("""
			select m.id, m.space_id, m.name
			from public.members m
			join public.spaces s on s.id = m.space_id
			where m.public_id = :memberPublicId
			  and s.owner_user_id = :userId
			limit 1
		""")
			.setParameter("memberPublicId", memberPublicId)
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object[] v = (Object[]) rows.getFirst();
		return new MemberRow(asLong(v[0]), asLong(v[1]), (String) v[2]);
	}

	@Transactional
	public void insertAudioRecord(AudioRecordInsert row) {
		entityManager.createNativeQuery("""
			insert into public.counseling_records
			(public_id, created_by_user_id, member_id, space_id, student_name, session_title, counseling_type,
			 counselor_name, status, record_source, audio_original_name, audio_mime_type, audio_byte_size,
			 audio_duration_ms, audio_storage_path, audio_sha256, language, processing_stage, processing_progress,
			 processing_message, processing_chunk_count, processing_chunk_completed_count, transcription_attempt_count,
			 analysis_status, analysis_progress, analysis_attempt_count, created_at, updated_at)
			values
			(:publicId, :userId, :memberId, :spaceId, :studentName, :sessionTitle, :counselingType,
			 :counselorName, 'processing', 'audio_upload', :audioOriginalName, :audioMimeType, :audioByteSize,
			 :audioDurationMs, :audioStoragePath, :audioSha256, 'ko', 'queued', 5,
			 '업로드가 완료되어 백그라운드 전사를 준비하고 있습니다.', 0, 0, 0,
			 'idle', 0, 0, now(), now())
		""")
			.setParameter("publicId", row.publicId())
			.setParameter("userId", row.userId())
			.setParameter("memberId", row.memberId())
			.setParameter("spaceId", row.spaceId())
			.setParameter("studentName", row.studentName())
			.setParameter("sessionTitle", row.sessionTitle())
			.setParameter("counselingType", row.counselingType())
			.setParameter("counselorName", row.counselorName())
			.setParameter("audioOriginalName", row.audioOriginalName())
			.setParameter("audioMimeType", row.audioMimeType())
			.setParameter("audioByteSize", row.audioByteSize())
			.setParameter("audioDurationMs", row.audioDurationMs())
			.setParameter("audioStoragePath", row.audioStoragePath())
			.setParameter("audioSha256", row.audioSha256())
			.executeUpdate();
	}

	@Transactional
	public void insertTextMemoRecord(TextMemoRecordInsert row) {
		Object insertedId = entityManager.createNativeQuery("""
			insert into public.counseling_records
			(public_id, created_by_user_id, member_id, space_id, student_name, session_title, counseling_type,
			 counselor_name, status, record_source, audio_original_name, audio_mime_type, audio_byte_size,
			 audio_duration_ms, audio_storage_path, audio_sha256, transcript_text, transcript_segment_count,
			 language, processing_stage, processing_progress, processing_message, analysis_status, analysis_progress,
			 created_at, updated_at)
			values
			(:publicId, :userId, :memberId, :spaceId, :studentName, :sessionTitle, :counselingType,
			 :counselorName, 'ready', 'text_memo', '텍스트 메모', 'text/plain', 0,
			 null, :audioStoragePath, '', :content, 1, 'ko', 'completed', 100,
			 '텍스트 메모 원문이 즉시 준비되었습니다.', 'idle', 0, now(), now())
			returning id
		""")
			.setParameter("publicId", row.publicId())
			.setParameter("userId", row.userId())
			.setParameter("memberId", row.memberId())
			.setParameter("spaceId", row.spaceId())
			.setParameter("studentName", row.studentName())
			.setParameter("sessionTitle", row.sessionTitle())
			.setParameter("counselingType", row.counselingType())
			.setParameter("counselorName", row.counselorName())
			.setParameter("audioStoragePath", "text_memo://" + row.publicId())
			.setParameter("content", row.content())
			.getSingleResult();
		Long recordId = asLong(insertedId);
		entityManager.createNativeQuery("""
			insert into public.counseling_transcript_segments
			(public_id, record_id, segment_index, start_ms, end_ms, speaker_label, speaker_tone, text, created_at, updated_at)
			values (:publicId, :recordId, 0, null, null, '메모', 'unknown', :content, now(), now())
		""")
			.setParameter("publicId", row.segmentPublicId())
			.setParameter("recordId", recordId)
			.setParameter("content", row.content())
			.executeUpdate();
	}

	private Long asLong(Object value) { return value == null ? null : ((Number) value).longValue(); }

	public record AudioRecordInsert(
		String publicId,
		UUID userId,
		Long memberId,
		Long spaceId,
		String studentName,
		String sessionTitle,
		String counselingType,
		String counselorName,
		String audioOriginalName,
		String audioMimeType,
		int audioByteSize,
		Long audioDurationMs,
		String audioStoragePath,
		String audioSha256
	) {}

	public record TextMemoRecordInsert(
		String publicId,
		String segmentPublicId,
		UUID userId,
		Long memberId,
		Long spaceId,
		String studentName,
		String sessionTitle,
		String counselingType,
		String counselorName,
		String content
	) {}
}
