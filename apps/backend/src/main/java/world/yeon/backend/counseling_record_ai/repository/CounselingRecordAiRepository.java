package world.yeon.backend.counseling_record_ai.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class CounselingRecordAiRepository {
	@PersistenceContext
	private EntityManager entityManager;

	@Transactional
	public int appendAssistantMessages(UUID userId, String recordPublicId, String messagesJson) {
		return entityManager.createNativeQuery("""
			update public.counseling_records
			set assistant_messages = coalesce(assistant_messages, '[]'::jsonb) || cast(:messagesJson as jsonb),
			    updated_at = now()
			where created_by_user_id = :userId
			  and public_id = :recordPublicId
		""")
			.setParameter("userId", userId)
			.setParameter("recordPublicId", recordPublicId)
			.setParameter("messagesJson", messagesJson)
			.executeUpdate();
	}

	@Transactional
	public int clearAssistantMessages(UUID userId, String recordPublicId) {
		return entityManager.createNativeQuery("""
			update public.counseling_records
			set assistant_messages = '[]'::jsonb,
			    updated_at = now()
			where created_by_user_id = :userId
			  and public_id = :recordPublicId
		""")
			.setParameter("userId", userId)
			.setParameter("recordPublicId", recordPublicId)
			.executeUpdate();
	}
}
