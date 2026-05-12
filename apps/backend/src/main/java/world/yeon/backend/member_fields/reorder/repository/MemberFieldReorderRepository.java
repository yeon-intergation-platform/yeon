package world.yeon.backend.member_fields.reorder.repository;

import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Repository
public class MemberFieldReorderRepository {

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

		if (result.isEmpty()) return null;
		return ((Number) result.getFirst()).longValue();
	}

	@Transactional
	public int updateDisplayOrder(String fieldPublicId, Long spaceInternalId, int displayOrder) {
		return entityManager
			.createNativeQuery("""
				update public.member_field_definitions
				set display_order = :displayOrder,
				    updated_at = now()
				where public_id = :fieldPublicId
				  and space_id = :spaceInternalId
				""")
			.setParameter("displayOrder", displayOrder)
			.setParameter("fieldPublicId", fieldPublicId)
			.setParameter("spaceInternalId", spaceInternalId)
			.executeUpdate();
	}
}
