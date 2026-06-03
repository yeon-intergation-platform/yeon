package world.yeon.backend.sheet_export.import_mutation.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import world.yeon.backend.member_field_values.write.dto.BulkUpsertMemberFieldValuesRequest;
import world.yeon.backend.member_field_values.write.dto.MemberFieldValuePayloadRequest;
import world.yeon.backend.member_field_values.write.service.MemberFieldValueWriteService;
import world.yeon.backend.space_access.service.SpaceAccessService;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationItemRequest;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationPayloadCoreRequest;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationRequest;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationResponse;
import world.yeon.backend.sheet_export.import_mutation.repository.SheetExportImportMutationRepository;

@Service
public class SheetExportImportMutationService {

	private final SheetExportImportMutationRepository repository;
	private final MemberFieldValueWriteService memberFieldValueWriteService;
	private final SpaceAccessService spaceAccessService;

	public SheetExportImportMutationService(
		SheetExportImportMutationRepository repository,
		MemberFieldValueWriteService memberFieldValueWriteService,
		SpaceAccessService spaceAccessService
	) {
		this.repository = repository;
		this.memberFieldValueWriteService = memberFieldValueWriteService;
		this.spaceAccessService = spaceAccessService;
	}

	@Transactional
	public SheetExportImportMutationResponse apply(String spaceId, UUID userId, SheetExportImportMutationRequest request) {
		if (request.sheetId() == null || request.sheetId().isBlank()) {
			throw new SheetExportImportMutationServiceException(400, "sheetId가 필요합니다.", "INVALID_REQUEST");
		}
		// IDOR 방지: sheetId만 아는 타인이 수강생 데이터를 변조/생성하지 못하도록 스페이스 소유권을 먼저 검증한다.
		spaceAccessService.requireOwnedSpace(spaceId, userId);
		Long spaceInternalId = repository.findLinkedExportSpaceInternalId(spaceId, request.sheetId());
		if (spaceInternalId == null) {
			throw new SheetExportImportMutationServiceException(404, "연동된 익스포트 시트를 찾지 못했습니다.", "SHEET_INTEGRATION_NOT_FOUND");
		}

		List<SheetExportImportMutationItemRequest> plannedUpdates = request.plannedUpdates() == null ? List.of() : request.plannedUpdates();
		List<SheetExportImportMutationItemRequest> plannedCreates = request.plannedCreates() == null ? List.of() : request.plannedCreates();

		for (var update : plannedUpdates) {
			applyUpdate(spaceId, spaceInternalId, userId, update);
		}
		for (var create : plannedCreates) {
			applyCreate(spaceId, spaceInternalId, userId, create);
		}

		return new SheetExportImportMutationResponse(plannedCreates.size(), plannedUpdates.size());
	}

	private void applyUpdate(String spaceId, Long spaceInternalId, UUID userId, SheetExportImportMutationItemRequest update) {
		if (update.memberPublicId() == null || update.memberPublicId().isBlank()) {
			throw new SheetExportImportMutationServiceException(400, "update mutation에는 memberPublicId가 필요합니다.", "INVALID_REQUEST");
		}
		var core = requireCore(update);
		String normalizedStatus = normalizeText(core.status());
		boolean updated = repository.updateMember(
			spaceInternalId,
			update.memberPublicId(),
			requireName(core.name()),
			normalizeText(core.email()),
			normalizeText(core.phone()),
			normalizedStatus != null,
			normalizedStatus,
			normalizeText(core.initialRiskLevel())
		);
		if (!updated) {
			throw new SheetExportImportMutationServiceException(404, "수강생을 찾지 못했습니다.", "MEMBER_NOT_FOUND");
		}
		applyCustomValues(spaceId, update.memberPublicId(), userId, update);
	}

	private void applyCreate(String spaceId, Long spaceInternalId, UUID userId, SheetExportImportMutationItemRequest create) {
		var core = requireCore(create);
		String normalizedStatus = normalizeText(core.status());
		String createdMemberPublicId = repository.createMember(
			spaceInternalId,
			generateMemberPublicId(),
			requireName(core.name()),
			normalizeText(core.email()),
			normalizeText(core.phone()),
			normalizedStatus == null ? "active" : normalizedStatus,
			normalizeText(core.initialRiskLevel())
		);
		if (createdMemberPublicId == null) {
			throw new SheetExportImportMutationServiceException(500, "수강생을 생성하지 못했습니다.", "MEMBER_CREATE_FAILED");
		}
		applyCustomValues(spaceId, createdMemberPublicId, userId, create);
	}

	private void applyCustomValues(String spaceId, String memberPublicId, UUID userId, SheetExportImportMutationItemRequest mutation) {
		var customValues = mutation.customValues() == null ? List.<world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationValueRequest>of() : mutation.customValues();
		List<MemberFieldValuePayloadRequest> values = customValues.stream()
			.map(value -> new MemberFieldValuePayloadRequest(value.fieldDefinitionId(), value.value()))
			.toList();
		if (values.isEmpty()) {
			return;
		}
		memberFieldValueWriteService.bulkUpsert(spaceId, memberPublicId, userId, new BulkUpsertMemberFieldValuesRequest(values));
	}

	private SheetExportImportMutationPayloadCoreRequest requireCore(SheetExportImportMutationItemRequest mutation) {
		if (mutation.payload() == null || mutation.payload().core() == null) {
			throw new SheetExportImportMutationServiceException(400, "mutation payload core가 필요합니다.", "INVALID_REQUEST");
		}
		return mutation.payload().core();
	}

	private String requireName(String rawName) {
		String name = normalizeText(rawName);
		if (name == null) {
			throw new SheetExportImportMutationServiceException(400, "수강생 이름은 필수입니다.", "INVALID_REQUEST");
		}
		return name.length() > 100 ? name.substring(0, 100) : name;
	}

	private String normalizeText(String value) {
		if (value == null) return null;
		String normalized = value.trim();
		return normalized.isEmpty() ? null : normalized;
	}

	private String generateMemberPublicId() {
		return "mem_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
	}
}
