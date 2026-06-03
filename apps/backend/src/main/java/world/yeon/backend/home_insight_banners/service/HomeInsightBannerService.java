package world.yeon.backend.home_insight_banners.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import world.yeon.backend.home_insight_banners.dto.*;
import world.yeon.backend.home_insight_banners.repository.HomeInsightBannerRepository;

@Service
public class HomeInsightBannerService {
	private static final long HIDE_DURATION_MS = 1000L * 60 * 60 * 3;
	private static final List<String> BANNER_KEYS = List.of("counseling_none", "counseling_warning");
	private final HomeInsightBannerRepository repository;
	public HomeInsightBannerService(HomeInsightBannerRepository repository) { this.repository = repository; }
	public HomeInsightBannerStateResponse list(UUID userId) {
		var rows = repository.findDismissals(userId);
		var map = new java.util.HashMap<String, String>();
		for (var row : rows) map.put(row.bannerKey(), row.hiddenUntil() == null ? null : row.hiddenUntil().toString());
		return new HomeInsightBannerStateResponse(BANNER_KEYS.stream().map(key -> new HomeInsightBannerDismissalResponse(key, map.get(key))).toList());
	}
	public DismissHomeInsightBannerResponse dismiss(UUID userId, DismissHomeInsightBannerRequest request) {
		if (request == null || request.bannerKey() == null) {
			throw new IllegalArgumentException("배너 dismiss 요청에 bannerKey가 필요합니다.");
		}
		if (!BANNER_KEYS.contains(request.bannerKey())) {
			throw new IllegalArgumentException("허용되지 않은 배너 키입니다: " + request.bannerKey());
		}
		OffsetDateTime hiddenUntil = OffsetDateTime.ofInstant(java.time.Instant.ofEpochMilli(System.currentTimeMillis() + HIDE_DURATION_MS), ZoneOffset.UTC);
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		repository.upsertDismissal(generatePublicId("hibd"), userId, request.bannerKey(), hiddenUntil, now);
		return new DismissHomeInsightBannerResponse(new HomeInsightBannerDismissalResponse(request.bannerKey(), hiddenUntil.toString()));
	}
	private String generatePublicId(String prefix) { return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24); }
}
