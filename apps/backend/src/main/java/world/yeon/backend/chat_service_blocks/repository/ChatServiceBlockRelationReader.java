package world.yeon.backend.chat_service_blocks.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * IDX 47: 양방향 차단 관계 조회 로직이 chat_service 슬라이스마다 동일 SQL로 복붙되어 있었다.
 * 차단 테이블(public.chat_service_blocks)을 소유한 chat_service_blocks 슬라이스에 단일 reader 를 두고
 * 각 슬라이스 repository 가 위임하도록 해 조건(예: 양방향 처리)을 한곳에서만 바꾸도록 한다.
 */
@Component
public class ChatServiceBlockRelationReader {
	@PersistenceContext
	private EntityManager entityManager;

	/** currentProfileId 가 차단했거나 차단당한 모든 상대 profile id 를 반환한다. */
	public Set<UUID> listBlockedRelationIds(UUID currentProfileId) {
		List<?> rows = entityManager.createNativeQuery("""
			select blocker_id, blocked_id
			from public.chat_service_blocks
			where blocker_id = :currentProfileId or blocked_id = :currentProfileId
		""")
			.setParameter("currentProfileId", currentProfileId)
			.getResultList();
		return rows.stream().map(row -> {
			Object[] v = (Object[]) row;
			UUID blockerId = (UUID) v[0];
			UUID blockedId = (UUID) v[1];
			return blockerId.equals(currentProfileId) ? blockedId : blockerId;
		}).collect(Collectors.toSet());
	}

	/** 두 profile 사이에 어느 방향으로든 차단 관계가 존재하는지 확인한다. */
	public boolean hasBlockedRelation(UUID currentProfileId, UUID targetProfileId) {
		return !entityManager.createNativeQuery("""
			select 1
			from public.chat_service_blocks
			where (blocker_id = :currentProfileId and blocked_id = :targetProfileId)
			   or (blocker_id = :targetProfileId and blocked_id = :currentProfileId)
			limit 1
		""")
			.setParameter("currentProfileId", currentProfileId)
			.setParameter("targetProfileId", targetProfileId)
			.getResultList()
			.isEmpty();
	}
}
