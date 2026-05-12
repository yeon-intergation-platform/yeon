package world.yeon.backend.member_fields.bootstrap_overview.service;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import world.yeon.backend.member_fields.bootstrap_overview.dto.OkResponse;
import world.yeon.backend.member_fields.bootstrap_overview.repository.MemberFieldOverviewBootstrapRepository;
import world.yeon.backend.member_fields.bootstrap_overview.support.DefaultOverviewFields;

@Service
public class MemberFieldOverviewBootstrapService {

	private final MemberFieldOverviewBootstrapRepository repository;

	public MemberFieldOverviewBootstrapService(MemberFieldOverviewBootstrapRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public OkResponse bootstrap(String spacePublicId, String tabPublicId, UUID userId) {
		Long spaceInternalId = repository.findSpaceInternalId(spacePublicId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}

		var tabLookup = repository.findTabLookup(tabPublicId);
		if (tabLookup == null) {
			throw new NoSuchElementException("탭을 찾지 못했습니다.");
		}
		if (!spaceInternalId.equals(tabLookup.spaceInternalId())) {
			throw new IllegalArgumentException("탭이 스페이스에 속하지 않습니다.");
		}
		if (!"overview".equals(tabLookup.systemKey())) {
			throw new IllegalArgumentException("개요 탭에서만 기본 필드 초기화를 수행할 수 있습니다.");
		}

		repository.lockTabRow(tabLookup.tabInternalId());
		var existingSourceKeys = repository.findExistingSourceKeys(spaceInternalId, tabLookup.tabInternalId());
		for (var field : DefaultOverviewFields.DEFAULTS) {
			if (existingSourceKeys.contains(field.sourceKey())) {
				continue;
			}
			repository.insertOverviewField(spaceInternalId, tabLookup.tabInternalId(), userId, field);
		}

		return OkResponse.success();
	}
}
