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
	@Transactional
	public void markAnalysisProcessing(UUID userId, String recordPublicId) {
		entityManager.createNativeQuery("""
			update public.counseling_records
			set analysis_status = 'processing',
			    analysis_progress = 10,
			    analysis_error_message = null,
			    analysis_attempt_count = coalesce(analysis_attempt_count, 0) + 1,
			    processing_stage = 'analyzing',
			    processing_message = 'AI가 긴 상담 원문을 순차적으로 분석하고 있습니다.',
			    updated_at = now()
			where created_by_user_id = :userId
			  and public_id = :recordPublicId
		""")
			.setParameter("userId", userId)
			.setParameter("recordPublicId", recordPublicId)
			.executeUpdate();
	}

	@Transactional
	public void saveAnalysisResult(UUID userId, String recordPublicId, String analysisResultJson) {
		entityManager.createNativeQuery("""
			update public.counseling_records
			set analysis_result = cast(:analysisResultJson as jsonb),
			    analysis_status = 'ready',
			    analysis_progress = 100,
			    analysis_error_message = null,
			    analysis_completed_at = now(),
			    processing_stage = 'completed',
			    processing_message = 'AI 분석이 완료되었습니다.',
			    updated_at = now()
			where created_by_user_id = :userId
			  and public_id = :recordPublicId
		""")
			.setParameter("userId", userId)
			.setParameter("recordPublicId", recordPublicId)
			.setParameter("analysisResultJson", analysisResultJson)
			.executeUpdate();
	}

	@Transactional
	public void saveAnalysisError(UUID userId, String recordPublicId, String message) {
		entityManager.createNativeQuery("""
			update public.counseling_records
			set analysis_status = 'error',
			    analysis_progress = 0,
			    analysis_error_message = :message,
			    processing_stage = 'error',
			    processing_message = :message,
			    updated_at = now()
			where created_by_user_id = :userId
			  and public_id = :recordPublicId
		""")
			.setParameter("userId", userId)
			.setParameter("recordPublicId", recordPublicId)
			.setParameter("message", message)
			.executeUpdate();
	}

}
