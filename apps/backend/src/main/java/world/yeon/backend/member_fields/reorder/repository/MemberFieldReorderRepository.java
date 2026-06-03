package world.yeon.backend.member_fields.reorder.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class MemberFieldReorderRepository {

	private final JdbcClient jdbcClient;

	public MemberFieldReorderRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	public Long findSpaceInternalId(String spacePublicId) {
		return jdbcClient.sql("""
			select id
			from public.spaces
			where public_id = :spacePublicId
			limit 1
			""")
			.param("spacePublicId", spacePublicId)
			.query(Long.class)
			.optional()
			.orElse(null);
	}

	/**
	 * order 배열 전체를 1회 UPDATE로 반영한다.
	 * 반환값은 실제 영향받은 행 수이며, 호출자가 order.size()와 비교해 미일치 필드를 감지한다.
	 */
	public int batchUpdateDisplayOrder(List<String> fieldPublicIds, Long spaceInternalId) {
		if (fieldPublicIds.isEmpty()) {
			return 0;
		}

		// VALUES 목록 구성: (public_id, display_order) 쌍
		StringBuilder valuesClause = new StringBuilder();
		for (int i = 0; i < fieldPublicIds.size(); i++) {
			if (i > 0) {
				valuesClause.append(", ");
			}
			valuesClause.append("(?, ?)");
		}

		String sql = """
			update public.member_field_definitions mfd
			set display_order = v.display_order,
			    updated_at = now()
			from (values """ + valuesClause + """
			) as v(public_id, display_order)
			where mfd.public_id = v.public_id
			  and mfd.space_id = ?
			""";

		Object[] params = new Object[fieldPublicIds.size() * 2 + 1];
		for (int i = 0; i < fieldPublicIds.size(); i++) {
			params[i * 2] = fieldPublicIds.get(i);
			params[i * 2 + 1] = i;
		}
		params[params.length - 1] = spaceInternalId;

		return jdbcClient.sql(sql)
			.params(params)
			.update();
	}
}
