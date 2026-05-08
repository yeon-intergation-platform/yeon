package world.yeon.backend.life_os.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.life_os.dto.LifeOsHourEntryDto;
import world.yeon.backend.life_os.dto.UpsertLifeOsDayRequest;
import world.yeon.backend.life_os.repository.LifeOsRepository;

@ExtendWith(MockitoExtension.class)
class LifeOsServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000943");
	@Mock private LifeOsRepository repository;
	private LifeOsService service;

	@BeforeEach void setUp() {
		service = new LifeOsService(repository);
	}

	@Test void 비어있는날은24시간기본엔트리를반환한다() {
		when(repository.findDay(OWNER_ID, "2026-05-08")).thenReturn(null);
		var result = service.getDay(OWNER_ID, "2026-05-08");
		assertThat(result.day().entries()).hasSize(24);
		assertThat(result.day().timezone()).isEqualTo("Asia/Seoul");
	}

	@Test void 업서트는24시간정규화를유지한다() {
		when(repository.upsertDay(eq(OWNER_ID), any(), eq("2026-05-08"), eq("Asia/Seoul"), eq(""), eq(""), any(), any()))
			.thenReturn(new LifeOsRepository.LifeOsDayRow(1L, "lod_1", OWNER_ID, "2026-05-08", "Asia/Seoul", "", "", List.of(new LifeOsHourEntryDto(0, "코딩", "코딩", null, null, "")), OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z")));
		var result = service.upsertDay(OWNER_ID, new UpsertLifeOsDayRequest("2026-05-08", "Asia/Seoul", "", "", List.of(new LifeOsHourEntryDto(0, "코딩", "코딩", null, null, ""))));
		assertThat(result.day().entries()).hasSize(24);
	}

	@Test void 일간리포트는matched를계산한다() {
		when(repository.findDay(OWNER_ID, "2026-05-08")).thenReturn(new LifeOsRepository.LifeOsDayRow(1L, "lod_1", OWNER_ID, "2026-05-08", "Asia/Seoul", "", "", List.of(
			new LifeOsHourEntryDto(0, "코딩", "코딩", "deep_work", "deep_work", ""),
			new LifeOsHourEntryDto(1, "", "", null, null, "")
		), OffsetDateTime.parse("2026-05-08T07:00:00Z"), OffsetDateTime.parse("2026-05-08T07:00:00Z")));
		var report = service.buildDailyReport(OWNER_ID, "2026-05-08");
		assertThat(((java.util.Map<?, ?>) report.report().get("metrics")).get("matchedHours")).isEqualTo(1);
	}
}
