package world.yeon.backend.sheet_integrations.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import world.yeon.backend.sheet_integrations.dto.CreateSheetIntegrationRequest;
import world.yeon.backend.sheet_integrations.dto.SheetIntegrationColumnMappingDto;
import world.yeon.backend.sheet_integrations.repository.SheetIntegrationRepository;

@ExtendWith(MockitoExtension.class)
class SheetIntegrationServiceTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000902");
	private static final String COLUMN_MAPPING_JSON = """
		{"nameColumn":0,"dateColumn":1,"statusColumn":2,"typeColumn":3}
		""".strip();

	@Mock private SheetIntegrationRepository repository;
	private SheetIntegrationService service;

	@BeforeEach
	void setUp() {
		service = new SheetIntegrationService(repository) {
			@Override
			protected List<List<String>> fetchSheetValues(String sheetId) {
				return List.of(
					List.of("이름", "일시", "상태", "유형"),
					List.of("홍길동", "2026-05-08T00:00:00Z", "출석", "attendance")
				);
			}
		};
	}

	@Test
	void 잘못된url이면400이다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		assertThatThrownBy(() -> service.createIntegration("space_alpha", OWNER_ID, new CreateSheetIntegrationRequest("https://example.com/not-sheet", "attendance", null)))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("시트 ID");
	}

	@Test
	void 생성응답을반환한다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.insertIntegration(
			eq(11L),
			any(),
			eq("https://docs.google.com/spreadsheets/d/sheet-1/edit"),
			eq("sheet-1"),
			eq("attendance"),
			eq(COLUMN_MAPPING_JSON),
			any()
		)).thenReturn(new SheetIntegrationRepository.SheetIntegrationRow(
			21L,
			11L,
			"sht_1",
			"https://docs.google.com/spreadsheets/d/sheet-1/edit",
			"sheet-1",
			"attendance",
			COLUMN_MAPPING_JSON,
			null,
			OffsetDateTime.parse("2026-05-08T07:00:00Z"),
			OffsetDateTime.parse("2026-05-08T07:00:00Z")
		));

		var result = service.createIntegration("space_alpha", OWNER_ID, new CreateSheetIntegrationRequest(
			"https://docs.google.com/spreadsheets/d/sheet-1/edit",
			"attendance",
			new SheetIntegrationColumnMappingDto(0, 1, 2, 3)
		));
		assertThat(result.integration().sheetId()).isEqualTo("sheet-1");
	}

	@Test
	void sync가activityLog를기록한다() {
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findIntegration("space_alpha", "sht_1"))
			.thenReturn(new SheetIntegrationRepository.SheetIntegrationRow(
				31L,
				11L,
				"sht_1",
				"https://docs.google.com/spreadsheets/d/sheet-1/edit",
				"sheet-1",
				"attendance",
				COLUMN_MAPPING_JSON,
				null,
				OffsetDateTime.parse("2026-05-08T07:00:00Z"),
				OffsetDateTime.parse("2026-05-08T07:00:00Z")
			));
		when(repository.findMemberInternalIdByName(11L, "홍길동")).thenReturn(51L);
		when(repository.existsActivityLog(eq(51L), eq(OffsetDateTime.parse("2026-05-08T00:00:00Z")), eq("attendance"))).thenReturn(false);

		var result = service.syncIntegration("space_alpha", "sht_1", OWNER_ID);
		assertThat(result.synced()).isEqualTo(1);
		assertThat(result.errors()).isEqualTo(0);
		verify(repository).insertActivityLog(any(), eq(51L), eq(11L), eq("attendance"), eq("출석"), eq(OffsetDateTime.parse("2026-05-08T00:00:00Z")), eq("google_sheet"));
		verify(repository).updateLastSyncedAt(eq(31L), any());
	}

	@Test
	void 빈시트면동기화하지않는다() {
		service = new SheetIntegrationService(repository) {
			@Override
			protected List<List<String>> fetchSheetValues(String sheetId) {
				return List.of();
			}
		};
		when(repository.findSpaceInternalId("space_alpha")).thenReturn(11L);
		when(repository.findIntegration("space_alpha", "sht_1"))
			.thenReturn(new SheetIntegrationRepository.SheetIntegrationRow(
				31L,
				11L,
				"sht_1",
				"https://docs.google.com/spreadsheets/d/sheet-1/edit",
				"sheet-1",
				"attendance",
				null,
				null,
				OffsetDateTime.parse("2026-05-08T07:00:00Z"),
				OffsetDateTime.parse("2026-05-08T07:00:00Z")
			));

		var result = service.syncIntegration("space_alpha", "sht_1", OWNER_ID);
		assertThat(result.synced()).isEqualTo(0);
		assertThat(result.errors()).isEqualTo(0);
		verify(repository, never()).updateLastSyncedAt(any(), any());
	}
}
