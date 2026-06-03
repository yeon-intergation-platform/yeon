package world.yeon.backend.space_templates.write.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Repository
public class SpaceTemplateSnapshotQueryRepository {

	private static final TypeReference<List<OptionRow>> OPTION_LIST_TYPE = new TypeReference<>() {
	};

	private final JdbcClient jdbcClient;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public SpaceTemplateSnapshotQueryRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	public boolean existsSpace(String spacePublicId) {
		Integer count = jdbcClient.sql("""
			select count(*)
			from spaces
			where public_id = :spacePublicId
			""")
			.param("spacePublicId", spacePublicId)
			.query(Integer.class)
			.single();
		return count != null && count > 0;
	}

	public List<TabSnapshotRow> loadTabs(String spacePublicId) {
		return jdbcClient.sql("""
			select
				tab.id as tab_id,
				tab.name,
				tab.tab_type,
				tab.system_key,
				tab.display_order
			from member_tab_definitions tab
			join spaces space on space.id = tab.space_id
			where space.public_id = :spacePublicId
			order by tab.display_order asc
			""")
			.param("spacePublicId", spacePublicId)
			.query((rs, rowNum) -> new TabSnapshotRow(
				rs.getLong("tab_id"),
				rs.getString("name"),
				rs.getString("tab_type"),
				rs.getString("system_key"),
				rs.getInt("display_order")
			))
			.list();
	}

	/**
	 * 스페이스의 모든 탭 필드를 1회 쿼리로 로드한다. tab_id 기준으로 그룹핑해 N+1을 방지한다.
	 */
	public java.util.Map<Long, List<FieldSnapshotRow>> loadAllFields(String spacePublicId) {
		List<FieldWithTabId> rows = jdbcClient.sql("""
			select
				field.tab_id,
				field.name,
				field.field_type,
				field.options::text as options_json,
				field.is_required,
				field.display_order
			from member_field_definitions field
			join member_tab_definitions tab on tab.id = field.tab_id
			join spaces space on space.id = tab.space_id
			where space.public_id = :spacePublicId
			order by field.tab_id asc, field.display_order asc
			""")
			.param("spacePublicId", spacePublicId)
			.query((rs, rowNum) -> new FieldWithTabId(
				rs.getLong("tab_id"),
				new FieldSnapshotRow(
					rs.getString("name"),
					rs.getString("field_type"),
					parseOptions(rs.getString("options_json")),
					rs.getBoolean("is_required"),
					rs.getInt("display_order")
				)
			))
			.list();

		return rows.stream().collect(
			java.util.stream.Collectors.groupingBy(
				FieldWithTabId::tabId,
				java.util.LinkedHashMap::new,
				java.util.stream.Collectors.mapping(FieldWithTabId::field, java.util.stream.Collectors.toList())
			)
		);
	}

	/** @deprecated {@link #loadAllFields(String)} 를 사용해 N+1을 방지한다. */
	@Deprecated
	public List<FieldSnapshotRow> loadFields(String spacePublicId, String tabName, int displayOrder) {
		return jdbcClient.sql("""
			select
				field.name,
				field.field_type,
				field.options::text as options_json,
				field.is_required,
				field.display_order
			from member_field_definitions field
			join member_tab_definitions tab on tab.id = field.tab_id
			join spaces space on space.id = tab.space_id
			where space.public_id = :spacePublicId
			  and tab.name = :tabName
			  and tab.display_order = :displayOrder
			order by field.display_order asc
			""")
			.param("spacePublicId", spacePublicId)
			.param("tabName", tabName)
			.param("displayOrder", displayOrder)
			.query((rs, rowNum) -> new FieldSnapshotRow(
				rs.getString("name"),
				rs.getString("field_type"),
				parseOptions(rs.getString("options_json")),
				rs.getBoolean("is_required"),
				rs.getInt("display_order")
			))
			.list();
	}

	private List<OptionRow> parseOptions(String raw) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		try {
			return objectMapper.readValue(raw, OPTION_LIST_TYPE);
		} catch (Exception error) {
			throw new IllegalArgumentException("템플릿 스냅샷 옵션을 해석하지 못했습니다.", error);
		}
	}

	public record TabSnapshotRow(
		long tabId,
		String name,
		String tabType,
		String systemKey,
		int displayOrder
	) {
	}

	public record FieldSnapshotRow(
		String name,
		String fieldType,
		List<OptionRow> options,
		boolean isRequired,
		int displayOrder
	) {
	}

	public record OptionRow(String value, String color) {
	}

	private record FieldWithTabId(long tabId, FieldSnapshotRow field) {
	}
}
