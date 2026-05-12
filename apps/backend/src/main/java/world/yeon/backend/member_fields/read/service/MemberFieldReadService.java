package world.yeon.backend.member_fields.read.service;

import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import world.yeon.backend.member_fields.read.dto.MemberFieldListResponse;
import world.yeon.backend.member_fields.read.mapper.MemberFieldReadMapper;
import world.yeon.backend.member_fields.read.repository.MemberFieldReadRepository;

@Service
public class MemberFieldReadService {

	private final MemberFieldReadRepository repository;
	private final MemberFieldReadMapper mapper;

	public MemberFieldReadService(
		MemberFieldReadRepository repository,
		MemberFieldReadMapper mapper
	) {
		this.repository = repository;
		this.mapper = mapper;
	}

	public MemberFieldListResponse listFields(String spacePublicId, String tabPublicId) {
		Long spaceInternalId = repository.findSpaceInternalId(spacePublicId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}

		MemberFieldReadRepository.TabLookup tabLookup = repository.findTabLookup(tabPublicId);
		if (tabLookup == null) {
			throw new NoSuchElementException("탭을 찾지 못했습니다.");
		}
		if (!spaceInternalId.equals(tabLookup.spaceInternalId())) {
			throw new IllegalArgumentException("탭이 스페이스에 속하지 않습니다.");
		}

		return mapper.toList(repository.findFields(spaceInternalId, tabLookup.tabInternalId()));
	}
}
