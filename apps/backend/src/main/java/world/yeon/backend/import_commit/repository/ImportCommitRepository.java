package world.yeon.backend.import_commit.repository;

import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class ImportCommitRepository {
	public record CreatedSpaceRow(Long id, String publicId) {}
	public record InsertedTabRow(Long id, String systemKey) {}
	public record InsertedFieldRow(Long id, String name, String fieldType) {}
	public record InsertedMemberRow(Long id, String publicId) {}
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
		if (tabs.isEmpty()) return List.of();
		Timestamp ts = Timestamp.from(now.toInstant());
		StringBuilder sql = new StringBuilder("""
			insert into public.member_tab_definitions (public_id, space_id, created_by_user_id, tab_type, system_key, name, is_visible, display_order, created_at, updated_at)
			values """);
		for (int i = 0; i < tabs.size(); i++) {
			if (i > 0) sql.append(", ");
			sql.append("(:publicId").append(i).append(", :spaceId, :userId, 'system', :systemKey").append(i)
				.append(", :name").append(i).append(", true, :displayOrder").append(i).append(", :createdAt, :updatedAt)");
		}
		var query = entityManager.createNativeQuery(sql.toString())
			.setParameter("spaceId", spaceId)
			.setParameter("userId", userId)
			.setParameter("createdAt", ts)
			.setParameter("updatedAt", ts);
		for (int i = 0; i < tabs.size(); i++) {
			Object[] tab = tabs.get(i);
			query.setParameter("publicId" + i, tab[0])
				.setParameter("systemKey" + i, tab[1])
				.setParameter("name" + i, tab[2])
				.setParameter("displayOrder" + i, tab[3]);
		}
		query.executeUpdate();
		List<?> rows = entityManager.createNativeQuery("select id, system_key from public.member_tab_definitions where space_id = :spaceId order by display_order asc")
			.setParameter("spaceId", spaceId)
			.getResultList();
		return rows.stream().map(row -> { Object[] v=(Object[])row; return new InsertedTabRow(((Number)v[0]).longValue(), (String)v[1]); }).toList();
	}

	public List<InsertedFieldRow> insertCustomFields(Long spaceId, Long tabId, UUID userId, OffsetDateTime now, List<Object[]> fields) {
		if (fields.isEmpty()) return List.of();
		Timestamp ts = Timestamp.from(now.toInstant());
		StringBuilder sql = new StringBuilder("""
			insert into public.member_field_definitions (public_id, space_id, tab_id, created_by_user_id, name, source_key, field_type, options, is_required, display_order, created_at, updated_at)
			values """);
		for (int i = 0; i < fields.size(); i++) {
			if (i > 0) sql.append(", ");
			sql.append("(:publicId").append(i).append(", :spaceId, :tabId, :userId, :name").append(i)
				.append(", null, :fieldType").append(i).append(", null, false, :displayOrder").append(i).append(", :createdAt, :updatedAt)");
		}
		var query = entityManager.createNativeQuery(sql.toString())
			.setParameter("spaceId", spaceId)
			.setParameter("tabId", tabId)
			.setParameter("userId", userId)
			.setParameter("createdAt", ts)
			.setParameter("updatedAt", ts);
		for (int i = 0; i < fields.size(); i++) {
			Object[] field = fields.get(i);
			query.setParameter("publicId" + i, field[0])
				.setParameter("name" + i, field[1])
				.setParameter("fieldType" + i, field[2])
				.setParameter("displayOrder" + i, field[3]);
		}
		query.executeUpdate();
		List<?> rows = entityManager.createNativeQuery("select id, name, field_type from public.member_field_definitions where space_id = :spaceId and tab_id = :tabId order by display_order asc")
			.setParameter("spaceId", spaceId)
			.setParameter("tabId", tabId)
			.getResultList();
		return rows.stream().map(row -> { Object[] v=(Object[])row; return new InsertedFieldRow(((Number)v[0]).longValue(), (String)v[1], (String)v[2]); }).toList();
	}

	public List<InsertedMemberRow> insertMembers(Long spaceId, OffsetDateTime now, List<Object[]> members) {
		if (members.isEmpty()) return List.of();
		Timestamp ts = Timestamp.from(now.toInstant());
		StringBuilder sql = new StringBuilder("""
			insert into public.members (public_id, space_id, name, email, phone, status, initial_risk_level, created_at, updated_at)
			values """);
		for (int i = 0; i < members.size(); i++) {
			if (i > 0) sql.append(", ");
			sql.append("(:publicId").append(i).append(", :spaceId, :name").append(i).append(", :email").append(i)
				.append(", :phone").append(i).append(", :status").append(i).append(", null, :createdAt, :updatedAt)");
		}
		sql.append(" returning id, public_id");
		var query = entityManager.createNativeQuery(sql.toString())
			.setParameter("spaceId", spaceId)
			.setParameter("createdAt", ts)
			.setParameter("updatedAt", ts);
		for (int i = 0; i < members.size(); i++) {
			Object[] member = members.get(i);
			query.setParameter("publicId" + i, member[0])
				.setParameter("name" + i, member[1])
				.setParameter("email" + i, member[2])
				.setParameter("phone" + i, member[3])
				.setParameter("status" + i, member[4]);
		}
		List<?> rows = query.getResultList();
		return rows.stream().map(row -> { Object[] v=(Object[])row; return new InsertedMemberRow(((Number) v[0]).longValue(), (String) v[1]); }).toList();
	}

	public void insertFieldValues(OffsetDateTime now, List<Object[]> values) {
		if (values.isEmpty()) return;
		Timestamp ts = Timestamp.from(now.toInstant());
		StringBuilder sql = new StringBuilder("""
			insert into public.member_field_values (public_id, member_id, field_definition_id, value_text, value_number, value_boolean, value_json, created_at, updated_at)
			values """);
		for (int i = 0; i < values.size(); i++) {
			if (i > 0) sql.append(", ");
			sql.append("(:publicId").append(i).append(", :memberId").append(i).append(", :fieldDefinitionId").append(i)
				.append(", :valueText").append(i).append(", :valueNumber").append(i).append(", :valueBoolean").append(i)
				.append(", cast(:valueJson").append(i).append(" as jsonb), :createdAt, :updatedAt)");
		}
		var query = entityManager.createNativeQuery(sql.toString())
			.setParameter("createdAt", ts)
			.setParameter("updatedAt", ts);
		for (int i = 0; i < values.size(); i++) {
			Object[] value = values.get(i);
			query.setParameter("publicId" + i, value[0])
				.setParameter("memberId" + i, value[1])
				.setParameter("fieldDefinitionId" + i, value[2])
				.setParameter("valueText" + i, value[3])
				.setParameter("valueNumber" + i, value[4])
				.setParameter("valueBoolean" + i, value[5])
				.setParameter("valueJson" + i, value[6]);
		}
		query.executeUpdate();
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
