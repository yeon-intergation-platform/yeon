package world.yeon.backend.member_tabs.reset.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import world.yeon.backend.member_tabs.reset.dto.OkResponse;
import world.yeon.backend.member_tabs.reset.repository.MemberTabResetRepository;
import world.yeon.backend.space_access.service.SpaceAccessService;

@Service
public class MemberTabResetService {

	private record SystemTabDef(String systemKey, String name, int displayOrder) {}

	private static final List<SystemTabDef> DEFAULT_SYSTEM_TABS = List.of(
		new SystemTabDef("overview", "개요", 0),
		new SystemTabDef("student_board", "출석·과제", 1),
		new SystemTabDef("counseling", "상담기록", 2),
		new SystemTabDef("memos", "메모", 3),
		new SystemTabDef("report", "리포트", 4)
	);

	private final MemberTabResetRepository repository;
	private final SpaceAccessService spaceAccessService;

	public MemberTabResetService(MemberTabResetRepository repository, SpaceAccessService spaceAccessService) {
		this.repository = repository;
		this.spaceAccessService = spaceAccessService;
	}

	@Transactional
	public OkResponse resetTabs(UUID userId, String spacePublicId) {
		// IDOR 방지: 타인 스페이스의 커스텀 탭(및 cascade 하위 필드/값) 삭제를 막기 위해 소유권을 먼저 검증한다.
		spaceAccessService.requireOwnedSpace(spacePublicId, userId);
		Long spaceInternalId = repository.findSpaceInternalId(spacePublicId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}

		repository.deleteCustomTabs(spaceInternalId);
		for (SystemTabDef def : DEFAULT_SYSTEM_TABS) {
			repository.restoreSystemTab(spaceInternalId, def.systemKey(), def.name(), def.displayOrder());
		}

		return OkResponse.success();
	}
}
