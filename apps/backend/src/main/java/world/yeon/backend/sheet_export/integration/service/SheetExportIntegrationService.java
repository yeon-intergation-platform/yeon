package world.yeon.backend.sheet_export.integration.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import world.yeon.backend.sheet_export.integration.dto.DeleteSheetExportIntegrationResponse;
import world.yeon.backend.sheet_export.integration.dto.GetSheetExportIntegrationResponse;
import world.yeon.backend.sheet_export.integration.dto.SheetExportIntegrationResponse;
import world.yeon.backend.sheet_export.integration.dto.UpsertSheetExportIntegrationRequest;
import world.yeon.backend.sheet_export.integration.dto.UpsertSheetExportIntegrationResponse;
import world.yeon.backend.sheet_export.integration.repository.SheetExportIntegrationRepository;

@Service
@Profile("jdbc")
public class SheetExportIntegrationService {

	private static final String PUBLIC_ID_PREFIX = "sgi_";

	private final SheetExportIntegrationRepository repository;

	public SheetExportIntegrationService(SheetExportIntegrationRepository repository) {
		this.repository = repository;
	}

	public GetSheetExportIntegrationResponse getIntegration(String spaceId) {
		Long spaceInternalId = repository.findSpaceInternalId(spaceId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}
		return new GetSheetExportIntegrationResponse(toResponse(repository.findExportIntegration(spaceId)));
	}

	public UpsertSheetExportIntegrationResponse upsertIntegration(String spaceId, UUID userId, UpsertSheetExportIntegrationRequest request) {
		Long spaceInternalId = repository.findSpaceInternalId(spaceId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}
		if (request == null || request.sheetUrl() == null || request.sheetUrl().isBlank()) {
			throw new IllegalArgumentException("sheetUrl은 필수입니다.");
		}
		String sheetId = extractSheetId(request.sheetUrl());
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		var existing = repository.findExportIntegration(spaceId);
		var row = existing == null
			? repository.insertExportIntegration(spaceInternalId, generatePublicId(), request.sheetUrl().trim(), sheetId, now)
			: repository.updateExportIntegration(existing.integrationInternalId(), request.sheetUrl().trim(), sheetId, now);
		if (row == null) {
			throw new SheetExportIntegrationServiceException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "연동을 저장하지 못했습니다.", "SHEET_EXPORT_INTEGRATION_SAVE_FAILED");
		}
		return new UpsertSheetExportIntegrationResponse(toResponse(row));
	}

	public DeleteSheetExportIntegrationResponse deleteIntegration(String spaceId, UUID userId) {
		Long spaceInternalId = repository.findSpaceInternalId(spaceId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}
		repository.deleteExportIntegration(spaceInternalId);
		return new DeleteSheetExportIntegrationResponse(true);
	}

	private SheetExportIntegrationResponse toResponse(SheetExportIntegrationRepository.IntegrationRow row) {
		if (row == null) return null;
		return new SheetExportIntegrationResponse(
			row.publicId(),
			row.sheetUrl(),
			row.sheetId(),
			row.dataType(),
			row.columnMapping(),
			row.lastSyncedAt(),
			row.createdAt(),
			row.updatedAt()
		);
	}

	private String extractSheetId(String sheetUrl) {
		var match = java.util.regex.Pattern.compile("/spreadsheets/d/([a-zA-Z0-9_-]+)").matcher(sheetUrl);
		if (!match.find() || match.group(1) == null) {
			throw new IllegalArgumentException("구글 시트 URL에서 시트 ID를 추출하지 못했습니다. URL 형식을 확인해 주세요.");
		}
		return match.group(1);
	}

	private String generatePublicId() {
		return PUBLIC_ID_PREFIX + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
	}
}
