package world.yeon.backend.member_fields.bootstrap_overview.repository;

import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import world.yeon.backend.member_fields.bootstrap_overview.support.DefaultOverviewFields;

@Repository
@Profile("jdbc")
public class MemberFieldOverviewBootstrapRepository {

	public record TabLookup(Long tabInternalId, Long spaceInternalId, String systemKey) {
	}

	@PersistenceContext
	private EntityManager entityManager;

	public Long findSpaceInternalId(String spacePublicId) {
		List<?> result = entityManager.createNativeQuery(
			"""
				select id
				from public.spaces
				where public_id = :spacePublicId
				limit 1
				"""
		)
			.setParameter("spacePublicId", spacePublicId)
			.getResultList();
		if (result.isEmpty()) {
			return null;
		}
		return asLong(result.getFirst());
	}

	public TabLookup findTabLookup(String tabPublicId) {
		List<?> result = entityManager.createNativeQuery(
			"""
				select id, space_id, system_key
				from public.member_tab_definitions
				where public_id = :tabPublicId
				limit 1
				"""
		)
			.setParameter("tabPublicId", tabPublicId)
			.getResultList();
		if (result.isEmpty()) {
			return null;
		}
		Object row = result.getFirst();
		if (row instanceof Object[] values && values.length >= 3) {
			return new TabLookup(asLong(values[0]), asLong(values[1]), (String) values[2]);
		}
		throw new IllegalStateException("탭 lookup 결과를 해석하지 못했습니다.");
	}

	@Transactional
	public void lockTabRow(Long tabInternalId) {
		entityManager.createNativeQuery(
			"""
				select id
				from public.member_tab_definitions
				where id = :tabInternalId
				for update
				"""
		)
			.setParameter("tabInternalId", tabInternalId)
			.getSingleResult();
	}

	public List<String> findExistingSourceKeys(Long spaceInternalId, Long tabInternalId) {
		return entityManager.createNativeQuery(
			"""
				select source_key
				from public.member_field_definitions
				where space_id = :spaceInternalId
				  and tab_id = :tabInternalId
				  and deleted_at is null
				  and source_key is not null
				order by display_order asc
				"""
		)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("tabInternalId", tabInternalId)
			.getResultList()
			.stream()
			.map(String.class::cast)
			.toList();
	}

	@Transactional
	public int insertOverviewField(
		Long spaceInternalId,
		Long tabInternalId,
		UUID userId,
		DefaultOverviewFields.FieldDef field
	) {
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		return entityManager.createNativeQuery(
			"""
				insert into public.member_field_definitions (
				  public_id, space_id, created_by_user_id, tab_id, name, source_key,
				  field_type, options, is_required, display_order, deleted_at, created_at, updated_at
				)
				values (
				  :publicId, :spaceInternalId, :userId, :tabInternalId, :name, :sourceKey,
				  :fieldType, null, false, :displayOrder, null, :createdAt, :updatedAt
				)
				"""
		)
			.setParameter("publicId", "mfd_bootstrap_" + UUID.randomUUID())
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("userId", userId)
			.setParameter("tabInternalId", tabInternalId)
			.setParameter("name", field.name())
			.setParameter("sourceKey", field.sourceKey())
			.setParameter("fieldType", field.fieldType())
			.setParameter("displayOrder", field.displayOrder())
			.setParameter("createdAt", Timestamp.from(now.toInstant()))
			.setParameter("updatedAt", Timestamp.from(now.toInstant()))
			.executeUpdate();
	}

	private Long asLong(Object value) {
		if (value instanceof BigInteger bigInteger) {
			return bigInteger.longValue();
		}
		if (value instanceof Number number) {
			return number.longValue();
		}
		throw new IllegalStateException("ID를 숫자로 해석하지 못했습니다.");
	}
}
