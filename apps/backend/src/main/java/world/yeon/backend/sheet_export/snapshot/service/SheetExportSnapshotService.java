package world.yeon.backend.sheet_export.snapshot.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;
import world.yeon.backend.sheet_export.snapshot.dto.ReplaceSheetExportSnapshotRowRequest;
import world.yeon.backend.sheet_export.snapshot.dto.ReplaceSheetExportSnapshotsRequest;
import world.yeon.backend.sheet_export.snapshot.dto.ReplaceSheetExportSnapshotsResponse;
import world.yeon.backend.sheet_export.snapshot.dto.SheetExportSnapshotItemResponse;
import world.yeon.backend.sheet_export.snapshot.dto.SheetExportSnapshotsResponse;
import world.yeon.backend.sheet_export.snapshot.repository.SheetExportSnapshotRepository;
import world.yeon.backend.sheet_export.sync.dto.FinalizeSheetExportSyncRequest;
import world.yeon.backend.sheet_export.sync.dto.FinalizeSheetExportSyncResponse;
import world.yeon.backend.sheet_export.snapshot.repository.SheetExportSnapshotRepository.SnapshotReplaceRow;

@Service
public class SheetExportSnapshotService {

	private final SheetExportSnapshotRepository repository;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public SheetExportSnapshotService(SheetExportSnapshotRepository repository) {
		this.repository = repository;
	}

	public SheetExportSnapshotsResponse getSnapshots(String spaceId, String sheetId) {
		var integration = requireIntegration(spaceId, sheetId);
		var snapshots = repository.findSnapshots(integration.integrationInternalId()).stream()
			.map(row -> new SheetExportSnapshotItemResponse(
				row.memberId(),
				convertPayload(row.basePayload()),
				row.basePayloadHash(),
				row.exportedAt()
			))
			.toList();
		return new SheetExportSnapshotsResponse(integration.lastSyncedAt(), snapshots);
	}

	public ReplaceSheetExportSnapshotsResponse replaceSnapshots(
		String spaceId,
		ReplaceSheetExportSnapshotsRequest request
	) {
		if (request == null || request.sheetId() == null || request.sheetId().isBlank()) {
			throw new IllegalArgumentException("sheetId는 필수입니다.");
		}
		if (request.exportedAt() == null) {
			throw new IllegalArgumentException("exportedAt은 필수입니다.");
		}
		List<ReplaceSheetExportSnapshotRowRequest> rows = request.rows() == null ? List.of() : request.rows();
		var integration = requireIntegration(spaceId, request.sheetId());
		repository.replaceSnapshots(
			integration.integrationInternalId(),
			integration.spaceInternalId(),
			request.exportedAt(),
			rows.stream().map(row -> new SnapshotReplaceRow(
				generateSnapshotPublicId(row.memberId(), request.exportedAt()),
				row.memberId(),
				writeJson(row.payload()),
				hashPayload(row.payload())
			)).toList()
		);
		return new ReplaceSheetExportSnapshotsResponse(rows.size());
	}

	public FinalizeSheetExportSyncResponse finalizeSync(
		String spaceId,
		FinalizeSheetExportSyncRequest request
	) {
		if (request == null || request.sheetId() == null || request.sheetId().isBlank()) {
			throw new IllegalArgumentException("sheetId는 필수입니다.");
		}
		if (request.exportedAt() == null) {
			throw new IllegalArgumentException("exportedAt은 필수입니다.");
		}
		List<ReplaceSheetExportSnapshotRowRequest> rows = request.rows() == null ? List.of() : request.rows();
		var integration = requireIntegration(spaceId, request.sheetId());
		repository.replaceSnapshots(
			integration.integrationInternalId(),
			integration.spaceInternalId(),
			request.exportedAt(),
			rows.stream().map(row -> new SnapshotReplaceRow(
				generateSnapshotPublicId(row.memberId(), request.exportedAt()),
				row.memberId(),
				writeJson(row.payload()),
				hashPayload(row.payload())
			)).toList()
		);
		repository.updateIntegrationLastSyncedAt(integration.integrationInternalId(), request.exportedAt());
		return new FinalizeSheetExportSyncResponse(rows.size(), request.exportedAt());
	}

	private SheetExportSnapshotRepository.IntegrationRow requireIntegration(String spaceId, String sheetId) {
		var integration = repository.findIntegration(spaceId, sheetId);
		if (integration == null) {
			throw new NoSuchElementException("연동된 익스포트 시트를 찾지 못했습니다.");
		}
		return integration;
	}

	private SheetExportPayloadResponse convertPayload(Object raw) {
		try {
			return objectMapper.convertValue(raw, SheetExportPayloadResponse.class);
		} catch (IllegalArgumentException error) {
			throw new IllegalStateException("snapshot payload를 응답으로 변환하지 못했습니다.", error);
		}
	}

	private String writeJson(Object payload) {
		try {
			return objectMapper.writeValueAsString(payload);
		} catch (Exception error) {
			throw new IllegalStateException("snapshot payload를 직렬화하지 못했습니다.", error);
		}
	}

	private String hashPayload(Object payload) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hashed = digest.digest(writeJson(payload).getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(hashed);
		} catch (Exception error) {
			throw new IllegalStateException("snapshot payload hash를 계산하지 못했습니다.", error);
		}
	}

	private String generateSnapshotPublicId(String memberId, OffsetDateTime exportedAt) {
		String seed = memberId + ":" + exportedAt.toInstant();
		String body = hashPayload(seed).substring(0, 12);
		return "shs_" + body;
	}
}
