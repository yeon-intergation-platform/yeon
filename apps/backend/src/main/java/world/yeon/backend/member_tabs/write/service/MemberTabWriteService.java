package world.yeon.backend.member_tabs.write.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import world.yeon.backend.member_tabs.read.model.MemberTabDefinitionEntity;
import world.yeon.backend.member_tabs.write.dto.CreateMemberTabRequest;
import world.yeon.backend.member_tabs.write.dto.MemberTabMutationItemResponse;
import world.yeon.backend.member_tabs.write.dto.MemberTabMutationResponse;
import world.yeon.backend.member_tabs.write.dto.UpdateMemberTabRequest;
import world.yeon.backend.member_tabs.write.repository.MemberTabWriteRepository;

@Service
@Profile("jdbc")
public class MemberTabWriteService {

	private static final Set<String> PROTECTED_SYSTEM_KEYS = Set.of(
		"overview",
		"student_board",
		"counseling",
		"memos",
		"report"
	);

	private final MemberTabWriteRepository repository;

	public MemberTabWriteService(MemberTabWriteRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public MemberTabMutationResponse createCustomTab(
		String spacePublicId,
		UUID userId,
		CreateMemberTabRequest request
	) {
		Long spaceInternalId = requireSpaceInternalId(spacePublicId);
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		MemberTabDefinitionEntity entity = new MemberTabDefinitionEntity();
		entity.setPublicId(generatePrefixedId("mtb"));
		entity.setSpaceId(spaceInternalId);
		entity.setCreatedByUserId(userId);
		entity.setTabType("custom");
		entity.setSystemKey(null);
		entity.setName(normalizeName(request.name()));
		entity.setVisible(true);
		entity.setDisplayOrder(repository.findMaxDisplayOrder(spaceInternalId) + 1);
		entity.setCreatedAt(now);
		entity.setUpdatedAt(now);
		return toResponse(repository.save(entity));
	}

	@Transactional
	public MemberTabMutationResponse updateTab(
		String tabPublicId,
		String spacePublicId,
		UpdateMemberTabRequest request
	) {
		Long spaceInternalId = requireSpaceInternalId(spacePublicId);
		MemberTabDefinitionEntity entity = requireTab(tabPublicId, spaceInternalId);
		requireWritableTab(entity, "기본 탭은 수정할 수 없습니다.");

		if (request.name() != null) {
			entity.setName(normalizeName(request.name()));
		}
		if (request.isVisible() != null) {
			entity.setVisible(request.isVisible());
		}
		if (request.displayOrder() != null) {
			entity.setDisplayOrder(request.displayOrder());
		}
		entity.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));

		return toResponse(repository.save(entity));
	}

	@Transactional
	public void deleteCustomTab(String tabPublicId, String spacePublicId) {
		Long spaceInternalId = requireSpaceInternalId(spacePublicId);
		MemberTabDefinitionEntity entity = requireTab(tabPublicId, spaceInternalId);

		if (isProtectedSystemKey(entity.getSystemKey())) {
			throw new IllegalStateException("기본 탭은 삭제할 수 없습니다.");
		}
		if ("system".equals(entity.getTabType())) {
			throw new IllegalStateException("시스템 탭은 삭제할 수 없습니다.");
		}

		repository.delete(entity);
	}

	private Long requireSpaceInternalId(String spacePublicId) {
		Long spaceInternalId = repository.findSpaceInternalId(spacePublicId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}
		return spaceInternalId;
	}

	private MemberTabDefinitionEntity requireTab(String tabPublicId, Long spaceInternalId) {
		return repository.findByPublicIdAndSpaceId(tabPublicId, spaceInternalId)
			.orElseThrow(() -> new NoSuchElementException("탭을 찾지 못했습니다."));
	}

	private void requireWritableTab(MemberTabDefinitionEntity entity, String message) {
		if (isProtectedSystemKey(entity.getSystemKey())) {
			throw new IllegalStateException(message);
		}
	}

	private boolean isProtectedSystemKey(String systemKey) {
		return systemKey != null && PROTECTED_SYSTEM_KEYS.contains(systemKey);
	}

	private String normalizeName(String name) {
		String normalized = name == null ? "" : name.trim();
		if (normalized.isEmpty()) {
			throw new IllegalArgumentException("탭 이름은 필수입니다.");
		}
		return normalized.length() > 80 ? normalized.substring(0, 80) : normalized;
	}

	private MemberTabMutationResponse toResponse(MemberTabDefinitionEntity entity) {
		return new MemberTabMutationResponse(
			new MemberTabMutationItemResponse(
				entity.getPublicId(),
				entity.getName(),
				entity.getTabType(),
				entity.getSystemKey(),
				entity.isVisible(),
				entity.getDisplayOrder()
			)
		);
	}

	private String generatePrefixedId(String prefix) {
		String body = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
		return prefix + "_" + body;
	}
}
