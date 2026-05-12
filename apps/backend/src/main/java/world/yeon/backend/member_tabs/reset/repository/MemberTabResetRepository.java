package world.yeon.backend.member_tabs.reset.repository;

import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Repository
public class MemberTabResetRepository {

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

	@Transactional
	public int deleteCustomTabs(Long spaceInternalId) {
		return entityManager
			.createNativeQuery("""
				delete from public.member_tab_definitions
				where space_id = :spaceInternalId
				  and tab_type <> 'system'
				""")
			.setParameter("spaceInternalId", spaceInternalId)
			.executeUpdate();
	}

	@Transactional
	public int restoreSystemTab(Long spaceInternalId, String systemKey, String name, int displayOrder) {
		return entityManager
			.createNativeQuery("""
				update public.member_tab_definitions
				set name = :name,
				    display_order = :displayOrder,
				    is_visible = true,
				    updated_at = now()
				where space_id = :spaceInternalId
				  and system_key = :systemKey
				""")
			.setParameter("name", name)
			.setParameter("displayOrder", displayOrder)
			.setParameter("spaceInternalId", spaceInternalId)
			.setParameter("systemKey", systemKey)
			.executeUpdate();
	}
}
