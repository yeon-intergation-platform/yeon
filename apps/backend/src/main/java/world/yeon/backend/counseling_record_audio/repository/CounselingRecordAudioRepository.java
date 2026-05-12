package world.yeon.backend.counseling_record_audio.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class CounselingRecordAudioRepository {
	public record AudioRecordRow(
		String publicId,
		String recordSource,
		String audioStoragePath,
		String audioOriginalName,
		String audioMimeType,
		int audioByteSize
	) {}

	@PersistenceContext
	private EntityManager entityManager;

	public AudioRecordRow findOwnedRecord(UUID userId, String recordPublicId) {
		List<?> rows = entityManager.createNativeQuery("""
			select cr.public_id,
			       cr.record_source,
			       cr.audio_storage_path,
			       cr.audio_original_name,
			       cr.audio_mime_type,
			       coalesce(cr.audio_byte_size, 0)
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
		return new AudioRecordRow(
			(String) v[0],
			(String) v[1],
			(String) v[2],
			(String) v[3],
			(String) v[4],
			((Number) v[5]).intValue()
		);
	}
}
