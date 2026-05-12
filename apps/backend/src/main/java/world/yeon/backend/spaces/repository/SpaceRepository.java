package world.yeon.backend.spaces.repository;

import jakarta.persistence.EntityManager;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.member_fields.bootstrap_overview.support.DefaultOverviewFields;

@Repository
public class SpaceRepository {
	public record SpaceRow(
		Long internalId,
		String publicId,
		String name,
		String description,
		String startDate,
		String endDate,
		String createdByUserId,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
	) {}

	private record InsertedTabRow(Long id, String systemKey) {}

	private static final List<Object[]> DEFAULT_SYSTEM_TABS = List.of(
		new Object[]{"overview", "개요", 0},
		new Object[]{"student_board", "출석·과제", 1},
		new Object[]{"counseling", "상담기록", 2},
		new Object[]{"memos", "메모", 3},
		new Object[]{"report", "리포트", 4}
	);

	private final EntityManager entityManager;

	public SpaceRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public List<SpaceRow> listOwnedSpaces(UUID userId) {
		return entityManager.createNativeQuery("""
			select id, public_id, name, description, start_date::text, end_date::text, created_by_user_id, created_at, updated_at
			from public.spaces
			where created_by_user_id = :userId
			order by created_at desc
			""")
			.setParameter("userId", userId)
			.getResultList()
			.stream()
			.map(this::toSpaceRow)
			.toList();
	}

	public SpaceRow findByPublicId(String spaceId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, public_id, name, description, start_date::text, end_date::text, created_by_user_id, created_at, updated_at
			from public.spaces
			where public_id = :spaceId
			limit 1
			""")
			.setParameter("spaceId", spaceId)
			.getResultList();
		return rows.isEmpty() ? null : toSpaceRow(rows.getFirst());
	}

	public SpaceRow findOwnedByPublicId(UUID userId, String spaceId) {
		List<?> rows = entityManager.createNativeQuery("""
			select id, public_id, name, description, start_date::text, end_date::text, created_by_user_id, created_at, updated_at
			from public.spaces
			where public_id = :spaceId and created_by_user_id = :userId
			limit 1
			""")
			.setParameter("spaceId", spaceId)
			.setParameter("userId", userId)
			.getResultList();
		return rows.isEmpty() ? null : toSpaceRow(rows.getFirst());
	}

	@Transactional
	public SpaceRow insertSpaceWithDefaults(
		String publicId,
		String name,
		String description,
		String startDate,
		String endDate,
		UUID userId,
		OffsetDateTime now,
		List<String> tabPublicIds,
		List<String> fieldPublicIds
	) {
		List<?> createdRows = entityManager.createNativeQuery("""
			insert into public.spaces (public_id, name, description, start_date, end_date, created_by_user_id, created_at, updated_at)
			values (:publicId, :name, :description, cast(:startDate as date), cast(:endDate as date), :userId, :createdAt, :updatedAt)
			returning id, public_id, name, description, start_date::text, end_date::text, created_by_user_id, created_at, updated_at
			""")
			.setParameter("publicId", publicId)
			.setParameter("name", name)
			.setParameter("description", description)
			.setParameter("startDate", startDate)
			.setParameter("endDate", endDate)
			.setParameter("userId", userId)
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.getResultList();
		SpaceRow created = toSpaceRow(createdRows.getFirst());

		for (int i = 0; i < DEFAULT_SYSTEM_TABS.size(); i += 1) {
			Object[] tab = DEFAULT_SYSTEM_TABS.get(i);
			entityManager.createNativeQuery("""
				insert into public.member_tab_definitions (public_id, space_id, created_by_user_id, tab_type, system_key, name, is_visible, display_order, created_at, updated_at)
				values (:publicId, :spaceId, :userId, 'system', :systemKey, :name, true, :displayOrder, :createdAt, :updatedAt)
				""")
				.setParameter("publicId", tabPublicIds.get(i))
				.setParameter("spaceId", created.internalId())
				.setParameter("userId", userId)
				.setParameter("systemKey", tab[0])
				.setParameter("name", tab[1])
				.setParameter("displayOrder", tab[2])
				.setParameter("createdAt", Timestamp.from(now.toInstant()))
				.setParameter("updatedAt", Timestamp.from(now.toInstant()))
				.executeUpdate();
		}

		List<InsertedTabRow> tabs = entityManager.createNativeQuery("""
			select id, system_key
			from public.member_tab_definitions
			where space_id = :spaceId
			order by display_order asc
			""")
			.setParameter("spaceId", created.internalId())
			.getResultList()
			.stream()
			.map(this::toInsertedTabRow)
			.toList();
		Long overviewTabId = tabs.stream()
			.filter(tab -> "overview".equals(tab.systemKey()))
			.map(InsertedTabRow::id)
			.findFirst()
			.orElseThrow(() -> new IllegalStateException("개요 탭을 생성하지 못했습니다."));

		for (int i = 0; i < DefaultOverviewFields.DEFAULTS.size(); i += 1) {
			var field = DefaultOverviewFields.DEFAULTS.get(i);
			entityManager.createNativeQuery("""
				insert into public.member_field_definitions (
				  public_id, space_id, created_by_user_id, tab_id, name, source_key,
				  field_type, options, is_required, display_order, deleted_at, created_at, updated_at
				)
				values (
				  :publicId, :spaceId, :userId, :tabId, :name, :sourceKey,
				  :fieldType, null, false, :displayOrder, null, :createdAt, :updatedAt
				)
				""")
				.setParameter("publicId", fieldPublicIds.get(i))
				.setParameter("spaceId", created.internalId())
				.setParameter("userId", userId)
				.setParameter("tabId", overviewTabId)
				.setParameter("name", field.name())
				.setParameter("sourceKey", field.sourceKey())
				.setParameter("fieldType", field.fieldType())
				.setParameter("displayOrder", field.displayOrder())
				.setParameter("createdAt", Timestamp.from(now.toInstant()))
				.setParameter("updatedAt", Timestamp.from(now.toInstant()))
				.executeUpdate();
		}

		return created;
	}

	@Transactional
	public SpaceRow updateOwnedSpace(
		UUID userId,
		String spaceId,
		String name,
		String startDate,
		String endDate,
		OffsetDateTime now
	) {
		List<?> rows = entityManager.createNativeQuery("""
			update public.spaces
			set name = :name,
			    start_date = cast(:startDate as date),
			    end_date = cast(:endDate as date),
			    updated_at = :updatedAt
			where public_id = :spaceId and created_by_user_id = :userId
			returning id, public_id, name, description, start_date::text, end_date::text, created_by_user_id, created_at, updated_at
			""")
			.setParameter("name", name)
			.setParameter("startDate", startDate)
			.setParameter("endDate", endDate)
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.setParameter("spaceId", spaceId)
			.setParameter("userId", userId)
			.getResultList();
		return rows.isEmpty() ? null : toSpaceRow(rows.getFirst());
	}

	@Transactional
	public boolean deleteOwnedSpace(UUID userId, String spaceId) {
		int deleted = entityManager.createNativeQuery("""
			delete from public.spaces
			where public_id = :spaceId and created_by_user_id = :userId
			""")
			.setParameter("spaceId", spaceId)
			.setParameter("userId", userId)
			.executeUpdate();
		return deleted > 0;
	}

	private InsertedTabRow toInsertedTabRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 2) {
			throw new IllegalStateException("tab row를 해석하지 못했습니다.");
		}
		return new InsertedTabRow(asLong(values[0]), (String) values[1]);
	}

	private SpaceRow toSpaceRow(Object row) {
		if (!(row instanceof Object[] values) || values.length < 9) {
			throw new IllegalStateException("space row를 해석하지 못했습니다.");
		}
		return new SpaceRow(
			asLong(values[0]),
			(String) values[1],
			(String) values[2],
			(String) values[3],
			values[4] == null ? null : values[4].toString(),
			values[5] == null ? null : values[5].toString(),
			values[6] == null ? null : values[6].toString(),
			asOffsetDateTime(values[7]),
			asOffsetDateTime(values[8])
		);
	}

	private Long asLong(Object value) {
		if (value instanceof BigInteger bigInteger) return bigInteger.longValue();
		if (value instanceof Number number) return number.longValue();
		throw new IllegalStateException("ID를 숫자로 해석하지 못했습니다.");
	}

	private OffsetDateTime asOffsetDateTime(Object value) {
		if (value == null) return null;
		if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;
		if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof Instant instant) return instant.atOffset(ZoneOffset.UTC);
		if (value instanceof Date date) return date.toInstant().atOffset(ZoneOffset.UTC);
		if (value instanceof LocalDateTime localDateTime) return localDateTime.atOffset(ZoneOffset.UTC);
		if (value instanceof ZonedDateTime zonedDateTime) return zonedDateTime.toOffsetDateTime();
		return OffsetDateTime.parse(value.toString());
	}
}
