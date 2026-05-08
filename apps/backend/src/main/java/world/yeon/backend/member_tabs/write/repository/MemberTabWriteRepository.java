package world.yeon.backend.member_tabs.write.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import world.yeon.backend.member_tabs.read.model.MemberTabDefinitionEntity;

@Repository
@Profile("jdbc")
public class MemberTabWriteRepository {

	@PersistenceContext
	private EntityManager entityManager;

	public Long findSpaceInternalId(String spacePublicId) {
		List<?> result = entityManager
			.createNativeQuery("""
				select id
				from public.spaces
				where public_id = :spacePublicId
				limit 1
				""")
			.setParameter("spacePublicId", spacePublicId)
			.getResultList();

		if (result.isEmpty()) {
			return null;
		}

		return ((Number) result.getFirst()).longValue();
	}

	public Optional<MemberTabDefinitionEntity> findByPublicIdAndSpaceId(String tabPublicId, Long spaceInternalId) {
		List<MemberTabDefinitionEntity> result = entityManager
			.createQuery(
				"""
					select tab
					from MemberTabDefinitionEntity tab
					where tab.publicId = :tabPublicId
					  and tab.spaceId = :spaceInternalId
					""",
				MemberTabDefinitionEntity.class
			)
			.setParameter("tabPublicId", tabPublicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.getResultList();

		return result.stream().findFirst();
	}

	public int findMaxDisplayOrder(Long spaceInternalId) {
		Integer result = entityManager
			.createQuery(
				"""
					select max(tab.displayOrder)
					from MemberTabDefinitionEntity tab
					where tab.spaceId = :spaceInternalId
					""",
				Integer.class
			)
			.setParameter("spaceInternalId", spaceInternalId)
			.getSingleResult();

		return result == null ? -1 : result;
	}

	@Transactional
	public MemberTabDefinitionEntity save(MemberTabDefinitionEntity entity) {
		if (entity.getId() == null) {
			entityManager.persist(entity);
			entityManager.flush();
			return entity;
		}

		MemberTabDefinitionEntity merged = entityManager.merge(entity);
		entityManager.flush();
		return merged;
	}

	@Transactional
	public void delete(MemberTabDefinitionEntity entity) {
		MemberTabDefinitionEntity managed = entityManager.contains(entity)
			? entity
			: entityManager.merge(entity);
		entityManager.remove(managed);
		entityManager.flush();
	}
}
