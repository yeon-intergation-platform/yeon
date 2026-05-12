package world.yeon.backend.member_tabs.reorder.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import world.yeon.backend.member_tabs.reorder.dto.OkResponse;
import world.yeon.backend.member_tabs.reorder.repository.MemberTabReorderRepository;

@Service
public class MemberTabReorderService {

	private final MemberTabReorderRepository repository;

	public MemberTabReorderService(MemberTabReorderRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public OkResponse reorderTabs(String spacePublicId, List<String> order) {
		Long spaceInternalId = repository.findSpaceInternalId(spacePublicId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}

		for (int index = 0; index < order.size(); index++) {
			repository.updateDisplayOrder(order.get(index), spaceInternalId, index);
		}

		return OkResponse.success();
	}
}
