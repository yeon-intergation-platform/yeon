package world.yeon.backend.member_fields.write.repository;

import java.math.BigInteger;
import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import world.yeon.backend.member_fields.read.model.MemberFieldDefinitionEntity;

@Repository
@Profile("jdbc")
public class MemberFieldWriteRepository {

	public record TabLookup(Long tabInternalId, Long spaceInternalId) {}

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
		if (result.isEmpty()) return null;
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
		if (result.isEmpty()) return null;
		Object row = result.getFirst();
		if (row instanceof Object[] values && values.length >= 2) {
			return new TabLookup(asLong(values[0]), asLong(values[1]));
		}
		throw new IllegalStateException("탭 lookup 결과를 해석하지 못했습니다.");
	}

	public MemberFieldDefinitionEntity findFieldByPublicIdInSpace(String fieldPublicId, Long spaceInternalId) {
		List<MemberFieldDefinitionEntity> result = entityManager.createQuery(
			"""
				select field
				from MemberFieldDefinitionEntity field
				where field.publicId = :fieldPublicId
				  and field.spaceId = :spaceInternalId
				""",
			MemberFieldDefinitionEntity.class
		)
			.setParameter("fieldPublicId", fieldPublicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.setMaxResults(1)
			.getResultList();
		return result.isEmpty() ? null : result.getFirst();
	}

	public int findMaxDisplayOrder(Long spaceInternalId, Long tabInternalId) {
		Integer result = entityManager.createQuery(
			"""
				select max(field.displayOrder)
				from MemberFieldDefinitionEntity field
				where field.spaceId = :spaceInternalId
				  and field.tabId = :tabInternalId
				  and field.deletedAt is null
				""",
			Integer.class
		)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("tabInternalId", tabInternalId)
			.getSingleResult();
		return result == null ? -1 : result;
	}

	@Transactional
	public MemberFieldDefinitionEntity save(MemberFieldDefinitionEntity entity) {
		if (entity.getId() == null) {
			entityManager.persist(entity);
			entityManager.flush();
			return entity;
		}
		MemberFieldDefinitionEntity merged = entityManager.merge(entity);
		entityManager.flush();
		return merged;
	}

	private Long asLong(Object value) {
		if (value instanceof BigInteger bigInteger) return bigInteger.longValue();
		if (value instanceof Number number) return number.longValue();
		throw new IllegalStateException("ID를 숫자로 해석하지 못했습니다.");
	}
}
