package world.yeon.backend.counseling_record_mutation.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class CounselingRecordMutationRepository {
	public record OwnedRecordRow(Long internalId, String publicId, String recordSource, String audioStoragePath) {}
	public record OwnedMemberRow(Long internalId, Long spaceInternalId, String spacePublicId) {}

	@PersistenceContext
	private EntityManager entityManager;

	public OwnedRecordRow findOwnedRecord(UUID userId, String recordPublicId) {
		List<?> rows = entityManager.createNativeQuery("""
			select cr.id, cr.public_id, cr.record_source, cr.audio_storage_path
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
		return new OwnedRecordRow(((Number) v[0]).longValue(), (String) v[1], (String) v[2], (String) v[3]);
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
}
