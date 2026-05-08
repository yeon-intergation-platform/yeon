package world.yeon.backend.sheet_export.import_evaluation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.sheet_export.import_context.dto.SheetExportImportContextFieldDefinitionResponse;
import world.yeon.backend.sheet_export.import_context.dto.SheetExportImportContextMemberResponse;
import world.yeon.backend.sheet_export.import_context.dto.SheetExportImportContextResponse;
import world.yeon.backend.sheet_export.import_context.service.SheetExportImportContextService;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportEvaluationRequest;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadCoreResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportPayloadResponse;
import world.yeon.backend.sheet_export.snapshot.dto.SheetExportSnapshotItemResponse;

@ExtendWith(MockitoExtension.class)
class SheetExportImportEvaluationServiceTests {
	@Mock private SheetExportImportContextService importContextService;
	private SheetExportImportEvaluationService service;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	@BeforeEach
	void setUp() {
		service = new SheetExportImportEvaluationService(importContextService);
	}

	@Test
	void 변경없는row는applied계획으로통과한다() throws Exception {
		var payload = new SheetExportPayloadResponse(
			new SheetExportPayloadCoreResponse("홍길동", null, null, "active", null),
			Map.of("상태", "in_progress")
		);
		String payloadHash = hash(payload);
		when(importContextService.getContext("space_alpha", "sheet-1")).thenReturn(new SheetExportImportContextResponse(
			OffsetDateTime.parse("2026-05-08T00:00:00Z"),
			List.of(new SheetExportImportContextFieldDefinitionResponse("mfd_status", "상태", "select")),
			List.of(new SheetExportImportContextMemberResponse("mem_1", "홍길동", null, null, "active", null, payload)),
			List.of(new SheetExportSnapshotItemResponse("mem_1", payload, payloadHash, OffsetDateTime.parse("2026-05-08T00:00:00Z")))
		));
		var result = service.evaluate("space_alpha", new SheetExportImportEvaluationRequest("sheet-1", List.of(
			List.of("이름", "상태", "__yeon_member_id"),
			List.of("홍길동", "in_progress", "mem_1")
		)));
		assertThat(result.status()).isEqualTo("applied");
		assertThat(result.conflicts()).isEmpty();
	}

	@Test
	void 중복managedRow는blocked충돌이다() throws Exception {
		var payload = new SheetExportPayloadResponse(
			new SheetExportPayloadCoreResponse("홍길동", null, null, "active", null),
			Map.of("상태", "in_progress")
		);
		String payloadHash = hash(payload);
		when(importContextService.getContext("space_alpha", "sheet-1")).thenReturn(new SheetExportImportContextResponse(
			OffsetDateTime.parse("2026-05-08T00:00:00Z"),
			List.of(new SheetExportImportContextFieldDefinitionResponse("mfd_status", "상태", "select")),
			List.of(new SheetExportImportContextMemberResponse("mem_1", "홍길동", null, null, "active", null, payload)),
			List.of(new SheetExportSnapshotItemResponse("mem_1", payload, payloadHash, OffsetDateTime.parse("2026-05-08T00:00:00Z")))
		));
		var result = service.evaluate("space_alpha", new SheetExportImportEvaluationRequest("sheet-1", List.of(
			List.of("이름", "상태", "__yeon_member_id"),
			List.of("홍길동", "in_progress", "mem_1"),
			List.of("홍길동", "in_progress", "mem_1")
		)));
		assertThat(result.status()).isEqualTo("blocked");
		assertThat(result.conflicts()).hasSize(1);
		assertThat(result.conflicts().getFirst().type()).isEqualTo("duplicate_member_row");
	}

	private String hash(SheetExportPayloadResponse payload) throws Exception {
		String raw = objectMapper.writeValueAsString(payload);
		return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8)));
	}
}
