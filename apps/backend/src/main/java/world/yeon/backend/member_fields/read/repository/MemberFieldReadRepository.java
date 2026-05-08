package world.yeon.backend.member_fields.read.repository;

import java.math.BigInteger;
import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import world.yeon.backend.member_fields.read.model.MemberFieldDefinitionEntity;

@Repository
@Profile("jdbc")
public class MemberFieldReadRepository {

	public record TabLookup(Long tabInternalId, Long spaceInternalId) {
	}

	private final EntityManager entityManager;

	public MemberFieldReadRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

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
				select id, space_id
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
		if (row instanceof Object[] values && values.length >= 2) {
			return new TabLookup(asLong(values[0]), asLong(values[1]));
		}
		throw new IllegalStateException("탭 lookup 결과를 해석하지 못했습니다.");
	}

	public List<MemberFieldDefinitionEntity> findFields(Long spaceInternalId, Long tabInternalId) {
		return entityManager.createQuery(
			"""
				select field
				from MemberFieldDefinitionEntity field
				where field.spaceId = :spaceInternalId
				  and field.tabId = :tabInternalId
				  and field.deletedAt is null
				order by field.displayOrder asc
				""",
			MemberFieldDefinitionEntity.class
		)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("tabInternalId", tabInternalId)
			.getResultList();
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
