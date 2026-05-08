package world.yeon.backend.import_commit.repository;

import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("jdbc")
public class ImportCommitRepository {
	public record CreatedSpaceRow(Long id, String publicId) {}
	public record InsertedTabRow(Long id, String systemKey) {}
	public record InsertedFieldRow(Long id, String name, String fieldType) {}
	public record InsertedMemberRow(Long id) {}
	public record OwnedDraftRow(String publicId) {}
	private final EntityManager entityManager;
	public ImportCommitRepository(EntityManager entityManager) { this.entityManager = entityManager; }

	public CreatedSpaceRow insertSpace(String publicId, String name, String startDate, String endDate, UUID userId, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.spaces (public_id, name, description, start_date, end_date, created_by_user_id, created_at, updated_at)
			values (:publicId, :name, null, :startDate, :endDate, :userId, :createdAt, :updatedAt)
			returning id, public_id
			""")
			.setParameter("publicId", publicId)
			.setParameter("name", name)
			.setParameter("startDate", startDate)
			.setParameter("endDate", endDate)
			.setParameter("userId", userId)
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		Object[] row = (Object[]) rows.getFirst();
		return new CreatedSpaceRow(((Number) row[0]).longValue(), (String) row[1]);
	}

	public List<InsertedTabRow> insertDefaultTabs(Long spaceId, UUID userId, OffsetDateTime now, List<Object[]> tabs) {
		for (Object[] tab : tabs) {
			entityManager.createNativeQuery("""
				insert into public.member_tab_definitions (public_id, space_id, created_by_user_id, tab_type, system_key, name, is_visible, display_order, created_at, updated_at)
				values (:publicId, :spaceId, :userId, 'system', :systemKey, :name, true, :displayOrder, :createdAt, :updatedAt)
				""")
				.setParameter("publicId", tab[0])
				.setParameter("spaceId", spaceId)
				.setParameter("userId", userId)
				.setParameter("systemKey", tab[1])
				.setParameter("name", tab[2])
				.setParameter("displayOrder", tab[3])
				.setParameter("createdAt", Timestamp.from(now.toInstant()))
				.setParameter("updatedAt", Timestamp.from(now.toInstant()))
				.executeUpdate();
		}
		List<?> rows = entityManager.createNativeQuery("select id, system_key from public.member_tab_definitions where space_id = :spaceId order by display_order asc")
			.setParameter("spaceId", spaceId)
			.getResultList();
		return rows.stream().map(row -> { Object[] v=(Object[])row; return new InsertedTabRow(((Number)v[0]).longValue(), (String)v[1]); }).toList();
	}

	public List<InsertedFieldRow> insertCustomFields(Long spaceId, Long tabId, UUID userId, OffsetDateTime now, List<Object[]> fields) {
		for (Object[] field : fields) {
			entityManager.createNativeQuery("""
				insert into public.member_field_definitions (public_id, space_id, tab_id, created_by_user_id, name, source_key, field_type, options, is_required, display_order, created_at, updated_at)
				values (:publicId, :spaceId, :tabId, :userId, :name, null, :fieldType, null, false, :displayOrder, :createdAt, :updatedAt)
				""")
				.setParameter("publicId", field[0])
				.setParameter("spaceId", spaceId)
				.setParameter("tabId", tabId)
				.setParameter("userId", userId)
				.setParameter("name", field[1])
				.setParameter("fieldType", field[2])
				.setParameter("displayOrder", field[3])
				.setParameter("createdAt", Timestamp.from(now.toInstant()))
				.setParameter("updatedAt", Timestamp.from(now.toInstant()))
				.executeUpdate();
		}
		List<?> rows = entityManager.createNativeQuery("select id, name, field_type from public.member_field_definitions where space_id = :spaceId and tab_id = :tabId order by display_order asc")
			.setParameter("spaceId", spaceId)
			.setParameter("tabId", tabId)
			.getResultList();
		return rows.stream().map(row -> { Object[] v=(Object[])row; return new InsertedFieldRow(((Number)v[0]).longValue(), (String)v[1], (String)v[2]); }).toList();
	}

	public InsertedMemberRow insertMember(Long spaceId, String publicId, String name, String email, String phone, String status, OffsetDateTime now) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.members (public_id, space_id, name, email, phone, status, initial_risk_level, created_at, updated_at)
			values (:publicId, :spaceId, :name, :email, :phone, :status, null, :createdAt, :updatedAt)
			returning id
			""")
			.setParameter("publicId", publicId)
			.setParameter("spaceId", spaceId)
			.setParameter("name", name)
			.setParameter("email", email)
			.setParameter("phone", phone)
			.setParameter("status", status)
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		Object[] row = (Object[]) rows.getFirst();
		return new InsertedMemberRow(((Number) row[0]).longValue());
	}

	public void insertFieldValue(Long memberId, Long fieldDefinitionId, String publicId, String valueText, String valueNumber, Boolean valueBoolean, String valueJson, OffsetDateTime now) {
		entityManager.createNativeQuery("""
			insert into public.member_field_values (public_id, member_id, field_definition_id, value_text, value_number, value_boolean, value_json, created_at, updated_at)
			values (:publicId, :memberId, :fieldDefinitionId, :valueText, :valueNumber, :valueBoolean, cast(:valueJson as jsonb), :createdAt, :updatedAt)
			""")
			.setParameter("publicId", publicId)
			.setParameter("memberId", memberId)
			.setParameter("fieldDefinitionId", fieldDefinitionId)
			.setParameter("valueText", valueText)
			.setParameter("valueNumber", valueNumber)
			.setParameter("valueBoolean", valueBoolean)
			.setParameter("valueJson", valueJson)
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	public OwnedDraftRow findOwnedDraft(UUID userId, String draftId) {
		List<?> rows = entityManager.createNativeQuery("select public_id from public.import_drafts where public_id = :draftId and created_by_user_id = :userId and expires_at > now() limit 1")
			.setParameter("draftId", draftId)
			.setParameter("userId", userId)
			.getResultList();
		if (rows.isEmpty()) return null;
		Object value = rows.getFirst();
		return new OwnedDraftRow(value instanceof Object[] arr ? (String) arr[0] : (String) value);
	}

	public void markDraftImporting(UUID userId, String draftId) {
		entityManager.createNativeQuery("""
			update public.import_drafts set status='analyzing', processing_stage='importing', processing_progress=80, processing_message='가져오는 중입니다.', error_message=null, updated_at=now()
			where public_id=:draftId and created_by_user_id=:userId
			""")
			.setParameter("draftId", draftId)
			.setParameter("userId", userId)
			.executeUpdate();
	}

	public void markDraftImported(UUID userId, String draftId, String resultJson) {
		entityManager.createNativeQuery("""
			update public.import_drafts set status='imported', processing_stage='completed', processing_progress=100, processing_message='가져오기가 완료되었습니다.', import_result=cast(:resultJson as jsonb), error_message=null, updated_at=now()
			where public_id=:draftId and created_by_user_id=:userId
			""")
			.setParameter("draftId", draftId)
			.setParameter("userId", userId)
			.setParameter("resultJson", resultJson)
			.executeUpdate();
	}
}
