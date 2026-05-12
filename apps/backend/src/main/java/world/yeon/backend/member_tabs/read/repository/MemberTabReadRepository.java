package world.yeon.backend.member_tabs.read.repository;

import java.math.BigInteger;
import java.util.List;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import world.yeon.backend.member_tabs.read.model.MemberTabDefinitionEntity;

@Repository
public class MemberTabReadRepository {

	private final EntityManager entityManager;

	public MemberTabReadRepository(EntityManager entityManager) {
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

		Object value = result.getFirst();
		if (value instanceof BigInteger bigInteger) {
			return bigInteger.longValue();
		}
		if (value instanceof Number number) {
			return number.longValue();
		}
		throw new IllegalStateException("스페이스 ID를 숫자로 해석하지 못했습니다.");
	}

	public List<MemberTabDefinitionEntity> findTabsBySpaceInternalId(Long spaceInternalId) {
		return entityManager.createQuery(
			"""
				select tab
				from MemberTabDefinitionEntity tab
				where tab.spaceId = :spaceInternalId
				order by tab.displayOrder asc
				""",
			MemberTabDefinitionEntity.class
		)
			.setParameter("spaceInternalId", spaceInternalId)
			.getResultList();
	}
}
