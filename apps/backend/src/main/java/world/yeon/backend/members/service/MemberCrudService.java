package world.yeon.backend.members.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import world.yeon.backend.members.dto.BulkDeleteMembersRequest;
import world.yeon.backend.members.dto.BulkDeleteMembersResponse;
import world.yeon.backend.members.dto.CreateMemberRequest;
import world.yeon.backend.members.dto.CreateMemberResponse;
import world.yeon.backend.members.dto.DeleteMemberResponse;
import world.yeon.backend.members.dto.GetMemberResponse;
import world.yeon.backend.members.dto.GetMembersResponse;
import world.yeon.backend.members.dto.MemberResponse;
import world.yeon.backend.members.dto.UpdateMemberRequest;
import world.yeon.backend.members.dto.UpdateMemberResponse;
import world.yeon.backend.members.repository.MemberCrudRepository;

@Service
@Profile("jdbc")
public class MemberCrudService {

	private final MemberCrudRepository repository;

	public MemberCrudService(MemberCrudRepository repository) {
		this.repository = repository;
	}

	public GetMembersResponse getMembers(String spaceId, UUID userId) {
		ensureOwnedSpace(spaceId, userId);
		return new GetMembersResponse(repository.findMembersInOwnedSpace(spaceId, userId).stream().map(this::toResponse).toList());
	}

	public CreateMemberResponse createMember(String spaceId, UUID userId, CreateMemberRequest request) {
		Long spaceInternalId = ensureOwnedSpace(spaceId, userId);
		String name = normalizeRequiredName(request.name());
		var created = repository.insertMember(
			spaceInternalId,
			generatePublicId("mem"),
			name,
			normalizeNullable(request.email(), 255),
			normalizeNullable(request.phone(), 20),
			normalizeStatus(request.status()),
			normalizeNullable(request.initialRiskLevel(), 10),
			OffsetDateTime.now(ZoneOffset.UTC)
		);
		return new CreateMemberResponse(toResponse(created));
	}

	public GetMemberResponse getOwnedMember(String memberId, UUID userId) {
		var member = repository.findOwnedMember(memberId, userId);
		if (member == null) throw new MemberCrudServiceException(404, "MEMBER_NOT_FOUND", "해당 수강생을 찾을 수 없거나 접근 권한이 없습니다.");
		return new GetMemberResponse(toResponse(member));
	}

	public GetMemberResponse getOwnedMemberInSpace(String spaceId, String memberId, UUID userId) {
		ensureOwnedSpace(spaceId, userId);
		var member = repository.findOwnedMemberInSpace(spaceId, memberId, userId);
		if (member == null) throw new MemberCrudServiceException(404, "MEMBER_NOT_FOUND", "해당 수강생을 찾을 수 없거나 접근 권한이 없습니다.");
		return new GetMemberResponse(toResponse(member));
	}

	public UpdateMemberResponse updateMember(String spaceId, String memberId, UUID userId, UpdateMemberRequest request) {
		var current = repository.findOwnedMemberInSpace(spaceId, memberId, userId);
		if (current == null) throw new MemberCrudServiceException(404, "MEMBER_NOT_FOUND", "해당 수강생을 찾을 수 없거나 접근 권한이 없습니다.");
		var updated = repository.updateMember(
			current.memberInternalId(),
			request.name() == null ? current.name() : normalizeRequiredName(request.name()),
			request.email() == null ? current.email() : normalizeNullable(request.email(), 255),
			request.phone() == null ? current.phone() : normalizeNullable(request.phone(), 20),
			request.status() == null ? current.status() : normalizeNullable(request.status(), 20),
			request.initialRiskLevel() == null ? current.initialRiskLevel() : normalizeNullable(request.initialRiskLevel(), 10),
			OffsetDateTime.now(ZoneOffset.UTC)
		);
		return new UpdateMemberResponse(toResponse(updated));
	}

	public DeleteMemberResponse deleteMember(String spaceId, String memberId, UUID userId) {
		var current = repository.findOwnedMemberInSpace(spaceId, memberId, userId);
		if (current == null) throw new MemberCrudServiceException(404, "MEMBER_NOT_FOUND", "삭제할 수강생을 찾을 수 없거나 접근 권한이 없습니다.");
		repository.deleteMember(current.memberInternalId());
		return new DeleteMemberResponse(true);
	}

	public BulkDeleteMembersResponse bulkDeleteMembers(String spaceId, UUID userId, BulkDeleteMembersRequest request) {
		List<String> uniqueIds = request == null || request.memberIds() == null ? List.of() : new java.util.ArrayList<>(new LinkedHashSet<>(request.memberIds()));
		if (uniqueIds.isEmpty()) throw new IllegalArgumentException("삭제할 수강생을 선택해 주세요.");
		ensureOwnedSpace(spaceId, userId);
		var owned = repository.findOwnedMembersInSpace(spaceId, userId, uniqueIds);
		if (owned.size() != uniqueIds.size()) throw new MemberCrudServiceException(404, "MEMBER_NOT_FOUND", "삭제할 수강생을 찾을 수 없거나 접근 권한이 없습니다.");
		List<String> deletedIds = repository.deleteMembersInSpace(spaceId, userId, uniqueIds);
		return new BulkDeleteMembersResponse(deletedIds.size(), deletedIds);
	}

	private Long ensureOwnedSpace(String spaceId, UUID userId) {
		Long internalId = repository.findOwnedSpaceInternalId(spaceId, userId);
		if (internalId == null) throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		return internalId;
	}

	private MemberResponse toResponse(MemberCrudRepository.MemberRow row) {
		return new MemberResponse(row.memberId(), row.spaceId(), row.name(), row.email(), row.phone(), row.status(), row.initialRiskLevel(), row.createdAt(), row.updatedAt());
	}

	private String normalizeRequiredName(String raw) {
		String normalized = normalizeNullable(raw, 100);
		if (normalized == null || normalized.isBlank()) throw new IllegalArgumentException("수강생 이름은 필수입니다.");
		return normalized;
	}

	private String normalizeStatus(String raw) {
		String normalized = normalizeNullable(raw, 20);
		return normalized == null ? "active" : normalized;
	}

	private String normalizeNullable(String raw, int maxLength) {
		if (raw == null) return null;
		String trimmed = raw.trim();
		if (trimmed.isBlank()) return null;
		return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
	}

	private String generatePublicId(String prefix) {
		return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
	}
}
