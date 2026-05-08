package world.yeon.backend.space_templates.write.repository;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
@Profile("jdbc")
public class SpaceTemplateApplyRepository {

	private final JdbcClient jdbcClient;

	public SpaceTemplateApplyRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	public Long requireSpaceInternalId(String spacePublicId) {
		Long id = jdbcClient.sql("select id from spaces where public_id = :spacePublicId")
			.param("spacePublicId", spacePublicId)
			.query(Long.class)
			.optional()
			.orElse(null);
		if (id == null) {
			throw new java.util.NoSuchElementException("스페이스를 찾지 못했습니다.");
		}
		return id;
	}

	public List<SystemTabRow> loadExistingSystemTabs(Long spaceId) {
		return jdbcClient.sql("""
			select id, system_key
			from member_tab_definitions
			where space_id = :spaceId and tab_type = 'system'
			order by display_order asc
			""")
			.param("spaceId", spaceId)
			.query((rs, rowNum) -> new SystemTabRow(rs.getLong("id"), rs.getString("system_key")))
			.list();
	}

	public void deleteAllFieldDefinitions(Long spaceId) {
		jdbcClient.sql("delete from member_field_definitions where space_id = :spaceId")
			.param("spaceId", spaceId)
			.update();
	}

	public void deleteCustomTabs(Long spaceId) {
		jdbcClient.sql("delete from member_tab_definitions where space_id = :spaceId and tab_type <> 'system'")
			.param("spaceId", spaceId)
			.update();
	}

	public void ensureSystemTab(
		String publicId,
		Long spaceId,
		UUID userId,
		String systemKey,
		String name,
		int displayOrder,
		OffsetDateTime now
	) {
		jdbcClient.sql("""
			insert into member_tab_definitions (
				public_id, space_id, created_by_user_id, tab_type, system_key,
				name, is_visible, display_order, created_at, updated_at
			) values (
				:publicId, :spaceId, :userId, 'system', :systemKey,
				:name, true, :displayOrder, :createdAt, :updatedAt
			)
			on conflict (space_id, system_key) do nothing
			""")
			.param("publicId", publicId)
			.param("spaceId", spaceId)
			.param("userId", userId)
			.param("systemKey", systemKey)
			.param("name", name)
			.param("displayOrder", displayOrder)
			.param("createdAt", Timestamp.from(now.toInstant()))
			.param("updatedAt", Timestamp.from(now.toInstant()))
			.update();
	}

	public Long findSystemTabId(Long spaceId, String systemKey) {
		return jdbcClient.sql("select id from member_tab_definitions where space_id = :spaceId and system_key = :systemKey")
			.param("spaceId", spaceId)
			.param("systemKey", systemKey)
			.query(Long.class)
			.single();
	}

	public void updateSystemTab(Long id, String name, int displayOrder, OffsetDateTime now) {
		jdbcClient.sql("update member_tab_definitions set name = :name, display_order = :displayOrder, updated_at = :updatedAt where id = :id")
			.param("id", id)
			.param("name", name)
			.param("displayOrder", displayOrder)
			.param("updatedAt", Timestamp.from(now.toInstant()))
			.update();
	}

	public Long insertCustomTab(String publicId, Long spaceId, UUID userId, String name, int displayOrder, OffsetDateTime now) {
		return jdbcClient.sql("""
			insert into member_tab_definitions (
				public_id, space_id, created_by_user_id, tab_type, system_key,
				name, is_visible, display_order, created_at, updated_at
			) values (
				:publicId, :spaceId, :userId, 'custom', null,
				:name, true, :displayOrder, :createdAt, :updatedAt
			)
			returning id
			""")
			.param("publicId", publicId)
			.param("spaceId", spaceId)
			.param("userId", userId)
			.param("name", name)
			.param("displayOrder", displayOrder)
			.param("createdAt", Timestamp.from(now.toInstant()))
			.param("updatedAt", Timestamp.from(now.toInstant()))
			.query(Long.class)
			.single();
	}

	public void insertField(
		String publicId,
		Long spaceId,
		UUID userId,
		Long tabId,
		String name,
		String fieldType,
		String optionsJson,
		boolean isRequired,
		int displayOrder,
		OffsetDateTime now
	) {
		jdbcClient.sql("""
			insert into member_field_definitions (
				public_id, space_id, created_by_user_id, tab_id, name, field_type,
				options, is_required, display_order, created_at, updated_at
			) values (
				:publicId, :spaceId, :userId, :tabId, :name, :fieldType,
				cast(:optionsJson as jsonb), :isRequired, :displayOrder, :createdAt, :updatedAt
			)
			""")
			.param("publicId", publicId)
			.param("spaceId", spaceId)
			.param("userId", userId)
			.param("tabId", tabId)
			.param("name", name)
			.param("fieldType", fieldType)
			.param("optionsJson", optionsJson)
			.param("isRequired", isRequired)
			.param("displayOrder", displayOrder)
			.param("createdAt", Timestamp.from(now.toInstant()))
			.param("updatedAt", Timestamp.from(now.toInstant()))
			.update();
	}

	public record SystemTabRow(Long id, String systemKey) {
	}
}
