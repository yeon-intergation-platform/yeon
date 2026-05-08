package world.yeon.backend.member_fields.reorder.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import world.yeon.backend.member_fields.reorder.dto.OkResponse;
import world.yeon.backend.member_fields.reorder.repository.MemberFieldReorderRepository;

@Service
@Profile("jdbc")
public class MemberFieldReorderService {

	private final MemberFieldReorderRepository repository;

	public MemberFieldReorderService(MemberFieldReorderRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public OkResponse reorderFields(String spacePublicId, List<String> order) {
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
