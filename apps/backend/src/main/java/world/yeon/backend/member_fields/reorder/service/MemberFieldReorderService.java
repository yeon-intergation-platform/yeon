package world.yeon.backend.member_fields.reorder.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import world.yeon.backend.member_fields.reorder.dto.OkResponse;
import world.yeon.backend.member_fields.reorder.repository.MemberFieldReorderRepository;
import world.yeon.backend.space_access.service.SpaceAccessService;

@Service
public class MemberFieldReorderService {

	private final MemberFieldReorderRepository repository;
	private final SpaceAccessService spaceAccessService;

	public MemberFieldReorderService(MemberFieldReorderRepository repository, SpaceAccessService spaceAccessService) {
		this.repository = repository;
		this.spaceAccessService = spaceAccessService;
	}

	@Transactional
	public OkResponse reorderFields(UUID userId, String spacePublicId, List<String> order) {
		// IDOR 방지: 타인 스페이스의 필드 순서를 변경하지 못하도록 소유권을 먼저 검증한다.
		spaceAccessService.requireOwnedSpace(spacePublicId, userId);
		Long spaceInternalId = repository.findSpaceInternalId(spacePublicId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}

		if (order.isEmpty()) {
			return OkResponse.success();
		}

		// N+1 방지: 행별 UPDATE 대신 단일 배치 UPDATE로 전체 순서를 반영한다.
		int affected = repository.batchUpdateDisplayOrder(order, spaceInternalId);
		if (affected != order.size()) {
			throw new IllegalArgumentException(
				"순서 배열에 이 스페이스에 속하지 않는 필드 ID가 포함되어 있습니다."
			);
		}

		return OkResponse.success();
	}
}
