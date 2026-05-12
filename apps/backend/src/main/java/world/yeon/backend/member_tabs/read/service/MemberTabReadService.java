package world.yeon.backend.member_tabs.read.service;

import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import world.yeon.backend.member_tabs.read.dto.MemberTabListResponse;
import world.yeon.backend.member_tabs.read.mapper.MemberTabReadMapper;
import world.yeon.backend.member_tabs.read.repository.MemberTabReadRepository;

@Service
public class MemberTabReadService {

	private final MemberTabReadRepository repository;
	private final MemberTabReadMapper mapper;

	public MemberTabReadService(
		MemberTabReadRepository repository,
		MemberTabReadMapper mapper
	) {
		this.repository = repository;
		this.mapper = mapper;
	}

	public MemberTabListResponse listTabs(String spacePublicId) {
		Long spaceInternalId = repository.findSpaceInternalId(spacePublicId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}

		return mapper.toList(repository.findTabsBySpaceInternalId(spaceInternalId));
	}
}
