package world.yeon.backend.sheet_export.integration.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import world.yeon.backend.sheet_export.integration.dto.UpsertSheetExportIntegrationRequest;
import world.yeon.backend.sheet_export.integration.repository.SheetExportIntegrationRepository;

@ExtendWith(MockitoExtension.class)
class SheetExportIntegrationServiceTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000805");

	@Mock private SheetExportIntegrationRepository repository;
	private SheetExportIntegrationService service;

	@BeforeEach
	void setUp() {
		service = new SheetExportIntegrationService(repository);
	}

	@Test
	void 기존연동이없으면생성한다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findExportIntegration("space_alpha")).thenReturn(null);
		when(repository.insertExportIntegration(eq(11L), any(), eq("https://docs.google.com/spreadsheets/d/sheet-1/edit"), eq("sheet-1"), any()))
			.thenReturn(new SheetExportIntegrationRepository.IntegrationRow(21L, 11L, "sgi_1", "https://docs.google.com/spreadsheets/d/sheet-1/edit", "sheet-1", "export", null, null, OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z")));

		var result = service.upsertIntegration("space_alpha", OWNER_ID, new UpsertSheetExportIntegrationRequest("https://docs.google.com/spreadsheets/d/sheet-1/edit"));
		assertThat(result.integration().sheetId()).isEqualTo("sheet-1");
	}

	@Test
	void 잘못된url이면400이다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		assertThatThrownBy(() -> service.upsertIntegration("space_alpha", OWNER_ID, new UpsertSheetExportIntegrationRequest("https://example.com/not-sheet")))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("시트 ID");
	}
}
