package world.yeon.backend.member_tabs.reset.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import world.yeon.backend.member_tabs.reset.dto.OkResponse;
import world.yeon.backend.member_tabs.reset.repository.MemberTabResetRepository;

@Service
@Profile("jdbc")
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

	public MemberTabResetService(MemberTabResetRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public OkResponse resetTabs(String spacePublicId) {
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
