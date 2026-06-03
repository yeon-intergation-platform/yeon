package world.yeon.backend.sheet_export.import_mutation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import world.yeon.backend.member_field_values.write.dto.BulkUpsertMemberFieldValuesRequest;
import world.yeon.backend.member_field_values.write.service.MemberFieldValueWriteService;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationItemRequest;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationPayloadCoreRequest;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationPayloadRequest;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationRequest;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationResponse;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationValueRequest;
import world.yeon.backend.sheet_export.import_mutation.repository.SheetExportImportMutationRepository;
import world.yeon.backend.space_access.service.SpaceAccessService;

@ExtendWith(MockitoExtension.class)
class SheetExportImportMutationServiceTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000798");

	@Mock private SheetExportImportMutationRepository repository;
	@Mock private MemberFieldValueWriteService memberFieldValueWriteService;
	@Mock private SpaceAccessService spaceAccessService;

	private SheetExportImportMutationService service;

	@BeforeEach
	void setUp() {
		service = new SheetExportImportMutationService(repository, memberFieldValueWriteService, spaceAccessService);
	}

	@Test
	void plannedCreate와Update를순서대로적용한다() {
		when(repository.findLinkedExportSpaceInternalId("space_alpha", "sheet-1")).thenReturn(11L);
		when(repository.updateMember(eq(11L), eq("mem_existing"), eq("기존 학생"), eq("existing@example.com"), eq(null), eq(false), eq(null), eq(null)))
			.thenReturn(true);
		when(repository.createMember(eq(11L), any(), eq("새 학생"), eq(null), eq("010-0000-0000"), eq("active"), eq("high")))
			.thenReturn("mem_created");

		SheetExportImportMutationResponse result = service.apply("space_alpha", OWNER_ID, new SheetExportImportMutationRequest(
			"sheet-1",
			List.of(new SheetExportImportMutationItemRequest(
				null,
				new SheetExportImportMutationPayloadRequest(
					new SheetExportImportMutationPayloadCoreRequest("새 학생", null, "010-0000-0000", null, "high"),
					Map.of("상태", "in_progress")
				),
				List.of(new SheetExportImportMutationValueRequest("mfd_status", "in_progress"))
			)),
			List.of(new SheetExportImportMutationItemRequest(
				"mem_existing",
				new SheetExportImportMutationPayloadRequest(
					new SheetExportImportMutationPayloadCoreRequest("기존 학생", "existing@example.com", null, null, null),
					Map.of()
				),
				List.of()
			))
		));

		assertThat(result.createdCount()).isEqualTo(1);
		assertThat(result.updatedCount()).isEqualTo(1);
		verify(memberFieldValueWriteService).bulkUpsert(eq("space_alpha"), eq("mem_created"), eq(OWNER_ID), any(BulkUpsertMemberFieldValuesRequest.class));
	}

	@Test
	void linkedExport가없으면404다() {
		when(repository.findLinkedExportSpaceInternalId("space_alpha", "sheet-1")).thenReturn(null);

		assertThatThrownBy(() -> service.apply("space_alpha", OWNER_ID, new SheetExportImportMutationRequest("sheet-1", List.of(), List.of())))
			.isInstanceOf(SheetExportImportMutationServiceException.class)
			.hasMessage("연동된 익스포트 시트를 찾지 못했습니다.");
	}

	@Test
	void update에memberPublicId가없으면400이다() {
		when(repository.findLinkedExportSpaceInternalId("space_alpha", "sheet-1")).thenReturn(11L);

		assertThatThrownBy(() -> service.apply("space_alpha", OWNER_ID, new SheetExportImportMutationRequest(
			"sheet-1",
			List.of(),
			List.of(new SheetExportImportMutationItemRequest(
				null,
				new SheetExportImportMutationPayloadRequest(
					new SheetExportImportMutationPayloadCoreRequest("학생", null, null, null, null),
					Map.of()
				),
				List.of()
			))
		)))
			.isInstanceOf(SheetExportImportMutationServiceException.class)
			.hasMessage("update mutation에는 memberPublicId가 필요합니다.");
	}
}
