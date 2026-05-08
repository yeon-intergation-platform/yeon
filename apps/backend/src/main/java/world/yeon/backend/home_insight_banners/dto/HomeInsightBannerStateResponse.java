package world.yeon.backend.home_insight_banners.dto;

import java.util.List;

public record HomeInsightBannerStateResponse(
	List<HomeInsightBannerDismissalResponse> dismissals
) {}
