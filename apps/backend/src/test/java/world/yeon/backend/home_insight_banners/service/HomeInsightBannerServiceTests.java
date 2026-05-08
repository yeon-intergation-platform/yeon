package world.yeon.backend.home_insight_banners.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import world.yeon.backend.home_insight_banners.dto.DismissHomeInsightBannerRequest;
import world.yeon.backend.home_insight_banners.repository.HomeInsightBannerRepository;

@ExtendWith(MockitoExtension.class)
class HomeInsightBannerServiceTests {
	@Mock private HomeInsightBannerRepository repository;
	private HomeInsightBannerService service;
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000981");
	@BeforeEach void setUp() { service = new HomeInsightBannerService(repository); }
	@Test void list응답shape를반환한다() {
		when(repository.findDismissals(USER_ID)).thenReturn(List.of(new HomeInsightBannerRepository.DismissalRow("counseling_none", OffsetDateTime.parse("2026-05-08T06:00:00Z"))));
		var result = service.list(USER_ID);
		assertThat(result.dismissals()).hasSize(2);
	}
	@Test void dismiss는upsert후응답을반환한다() {
		var result = service.dismiss(USER_ID, new DismissHomeInsightBannerRequest("counseling_none"));
		assertThat(result.dismissal().bannerKey()).isEqualTo("counseling_none");
		verify(repository).upsertDismissal(any(), eq(USER_ID), eq("counseling_none"), any(), any());
	}
}
