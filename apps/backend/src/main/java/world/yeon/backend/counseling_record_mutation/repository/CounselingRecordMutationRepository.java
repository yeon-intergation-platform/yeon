package world.yeon.backend.counseling_record_mutation.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class CounselingRecordMutationRepository {
	public record OwnedRecordRow(Long internalId, String publicId, String status, String recordSource, String audioStoragePath) {}
	public record OwnedMemberRow(Long internalId, Long spaceInternalId, String spacePublicId) {}
	public record SegmentRow(
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

	public OwnedRecordRow findOwnedRecord(UUID userId, String recordPublicId) {
		List<?> rows = entityManager.createNativeQuery("""
			select cr.id, cr.public_id, cr.status, cr.record_source, cr.audio_storage_path
			from public.counseling_records cr
			where cr.created_by_user_id = :userId
			  and cr.public_id = :recordPublicId
			limit 1
		""")
			.setParameter("userId", userId)
			.setParameter("recordPublicId", recordPublicId)
			.getResultList();
		if (rows.isEmpty()) {
			return null;
		}
		Object[] v = (Object[]) rows.getFirst();
		return new OwnedRecordRow(((Number) v[0]).longValue(), (String) v[1], (String) v[2], (String) v[3], (String) v[4]);
	}

	public OwnedMemberRow findOwnedMember(UUID userId, String memberPublicId) {
		List<?> rows = entityManager.createNativeQuery("""
			select m.id, s.id, s.public_id
			from public.members m
			join public.spaces s on s.id = m.space_id
			where m.public_id = :memberPublicId
			  and s.created_by_user_id = :userId
			limit 1
		""")
			.setParameter("userId", userId)
			.setParameter("memberPublicId", memberPublicId)
			.getResultList();
		if (rows.isEmpty()) {
			return null;
		}
		Object[] v = (Object[]) rows.getFirst();
		return new OwnedMemberRow(((Number) v[0]).longValue(), ((Number) v[1]).longValue(), (String) v[2]);
	}

	@Transactional
	public void linkRecord(long recordInternalId, Long memberInternalId, Long spaceInternalId) {
		entityManager.createNativeQuery("""
			update public.counseling_records
			set member_id = :memberInternalId,
			    space_id = :spaceInternalId,
			    updated_at = now()
			where id = :recordInternalId
		""")
			.setParameter("recordInternalId", recordInternalId)
			.setParameter("memberInternalId", memberInternalId)
			.setParameter("spaceInternalId", spaceInternalId)
			.executeUpdate();
	}

	@Transactional
	public void deleteRecord(long recordInternalId) {
		entityManager.createNativeQuery("delete from public.counseling_records where id = :recordInternalId")
			.setParameter("recordInternalId", recordInternalId)
			.executeUpdate();
	}

	@Transactional
	public SegmentRow updateSegment(
		long recordInternalId,
		String segmentPublicId,
		boolean hasText,
		String text,
		boolean hasSpeakerLabel,
		String speakerLabel,
		boolean hasSpeakerTone,
		String speakerTone
	) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.counseling_transcript_segments
			set text = case when :hasText then cast(:text as text) else text end,
			    speaker_label = case when :hasSpeakerLabel then cast(:speakerLabel as text) else speaker_label end,
			    speaker_tone = case when :hasSpeakerTone then cast(:speakerTone as text) else speaker_tone end
			where record_id = :recordInternalId
			  and public_id = :segmentPublicId
			returning public_id, segment_index, start_ms, end_ms, speaker_label, speaker_tone, text
		""")
			.setParameter("recordInternalId", recordInternalId)
			.setParameter("segmentPublicId", segmentPublicId)
			.setParameter("hasText", hasText)
			.setParameter("text", text)
			.setParameter("hasSpeakerLabel", hasSpeakerLabel)
			.setParameter("speakerLabel", speakerLabel)
			.setParameter("hasSpeakerTone", hasSpeakerTone)
			.setParameter("speakerTone", speakerTone)
			.getResultList();
		if (rows.isEmpty()) {
			return null;
		}
		return toSegmentRow(rows.getFirst());
	}

	@Transactional
	public int bulkUpdateSpeaker(long recordInternalId, String fromSpeakerLabel, String toSpeakerLabel, String toSpeakerTone) {
		int updatedCount = entityManager.createNativeQuery("""
			update public.counseling_transcript_segments
			set speaker_label = :toSpeakerLabel,
			    speaker_tone = coalesce(cast(:toSpeakerTone as text), speaker_tone)
			where record_id = :recordInternalId
			  and speaker_label = :fromSpeakerLabel
		""")
			.setParameter("recordInternalId", recordInternalId)
			.setParameter("fromSpeakerLabel", fromSpeakerLabel)
			.setParameter("toSpeakerLabel", toSpeakerLabel)
			.setParameter("toSpeakerTone", toSpeakerTone)
			.executeUpdate();
		return updatedCount;
	}

	@Transactional
	public void rebuildTranscriptText(long recordInternalId) {
		entityManager.createNativeQuery("""
			update public.counseling_records
			set transcript_text = coalesce((
			        select string_agg(ts.text, E'\\n' order by ts.segment_index)
			        from public.counseling_transcript_segments ts
			        where ts.record_id = :recordInternalId
			    ), ''),
			    updated_at = now()
			where id = :recordInternalId
		""")
			.setParameter("recordInternalId", recordInternalId)
			.executeUpdate();
	}

	@Transactional
	public void queueAnalysisAfterTranscriptMutation(long recordInternalId, String processingMessage) {
		entityManager.createNativeQuery("""
			update public.counseling_records
			set analysis_result = null,
			    analysis_status = 'queued',
			    analysis_progress = 0,
			    analysis_error_message = null,
			    analysis_completed_at = null,
			    processing_stage = 'transcript_ready',
			    processing_message = :processingMessage,
			    updated_at = now()
			where id = :recordInternalId
		""")
			.setParameter("recordInternalId", recordInternalId)
			.setParameter("processingMessage", processingMessage)
			.executeUpdate();
	}

	private SegmentRow toSegmentRow(Object row) {
		Object[] v = (Object[]) row;
		return new SegmentRow(
			(String) v[0],
			((Number) v[1]).intValue(),
			(Integer) v[2],
			(Integer) v[3],
			(String) v[4],
			(String) v[5],
			(String) v[6]
		);
	}
}
