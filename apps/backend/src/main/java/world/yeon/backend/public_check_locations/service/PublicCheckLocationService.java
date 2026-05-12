package world.yeon.backend.public_check_locations.service;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import world.yeon.backend.public_check_locations.dto.PublicCheckLocationResultResponse;
import world.yeon.backend.public_check_locations.dto.PublicCheckLocationSearchResponse;
import world.yeon.backend.public_check_locations.repository.PublicCheckLocationRepository;

@Service
public class PublicCheckLocationService {
	private static final int MAX_RESULTS = 6;

	private final PublicCheckLocationRepository repository;
	private final KakaoLocationGateway kakaoLocationGateway;

	public PublicCheckLocationService(
		PublicCheckLocationRepository repository,
		KakaoLocationGateway kakaoLocationGateway
	) {
		this.repository = repository;
		this.kakaoLocationGateway = kakaoLocationGateway;
	}

	public PublicCheckLocationSearchResponse search(UUID userId, String spaceId, String query) {
		if (!repository.isOwnedSpace(userId, spaceId)) {
			throw new PublicCheckLocationServiceException(404, "SPACE_NOT_FOUND", "스페이스를 찾지 못했습니다.");
		}

		String trimmedQuery = query == null ? "" : query.trim();
		if (trimmedQuery.isEmpty() || trimmedQuery.length() < 2) {
			return new PublicCheckLocationSearchResponse(List.of());
		}

		String apiKey = requiredKakaoApiKey();
		JsonNode keywordBody = kakaoLocationGateway.keywordSearch(apiKey, trimmedQuery);
		JsonNode addressBody = kakaoLocationGateway.addressSearch(apiKey, trimmedQuery);

		List<PublicCheckLocationResultResponse> merged = new ArrayList<>();
		keywordBody.get("documents").forEach(document -> merged.add(normalizeKeyword(document)));
		addressBody.get("documents").forEach(document -> merged.add(normalizeAddress(document)));

		return new PublicCheckLocationSearchResponse(dedupe(merged));
	}

	private String requiredKakaoApiKey() {
		String value = System.getProperty("KAKAO_REST_API_KEY");
		if (value == null || value.trim().isEmpty()) {
			value = System.getenv("KAKAO_REST_API_KEY");
		}
		if (value == null || value.trim().isEmpty()) {
			throw new PublicCheckLocationServiceException(500, "KAKAO_CONFIG_MISSING", "KAKAO_REST_API_KEY가 설정되지 않았습니다.");
		}
		return value.trim();
	}

	private PublicCheckLocationResultResponse normalizeKeyword(JsonNode document) {
		String placeName = textOrNull(document.get("place_name"));
		String roadAddressName = textOrNull(document.get("road_address_name"));
		String addressName = textOrNull(document.get("address_name"));
		return new PublicCheckLocationResultResponse(
			"keyword:" + requiredText(document.get("id")),
			buildKeywordLabel(placeName, roadAddressName, addressName),
			placeName,
			roadAddressName,
			addressName,
			parseCoordinate(requiredText(document.get("y")), "위도"),
			parseCoordinate(requiredText(document.get("x")), "경도"),
			"keyword"
		);
	}

	private PublicCheckLocationResultResponse normalizeAddress(JsonNode document) {
		JsonNode roadAddress = document.get("road_address");
		JsonNode address = document.get("address");
		String buildingName = roadAddress == null ? null : textOrNull(roadAddress.get("building_name"));
		String roadAddressName = roadAddress == null ? null : textOrNull(roadAddress.get("address_name"));
		String addressName = address != null && !address.isNull()
			? textOrNull(address.get("address_name"))
			: textOrNull(document.get("address_name"));
		String label = buildingName != null && roadAddressName != null
			? buildingName + " · " + roadAddressName
			: (roadAddressName != null ? roadAddressName : addressName);
		return new PublicCheckLocationResultResponse(
			"address:" + requiredText(document.get("address_name")) + ":" + requiredText(document.get("x")) + ":" + requiredText(document.get("y")),
			label,
			buildingName,
			roadAddressName,
			addressName,
			parseCoordinate(requiredText(document.get("y")), "위도"),
			parseCoordinate(requiredText(document.get("x")), "경도"),
			"address"
		);
	}

	private List<PublicCheckLocationResultResponse> dedupe(List<PublicCheckLocationResultResponse> results) {
		Map<String, PublicCheckLocationResultResponse> deduped = new LinkedHashMap<>();
		for (PublicCheckLocationResultResponse result : results) {
			String key = String.format(
				java.util.Locale.ROOT,
				"%.6f:%.6f:%s:%s",
				result.latitude(),
				result.longitude(),
				result.roadAddressName() == null ? "" : result.roadAddressName(),
				result.addressName() == null ? "" : result.addressName()
			);
			deduped.putIfAbsent(key, result);
		}
		return deduped.values().stream().limit(MAX_RESULTS).toList();
	}

	private String buildKeywordLabel(String placeName, String roadAddressName, String addressName) {
		if (roadAddressName != null) return placeName + " · " + roadAddressName;
		if (addressName != null) return placeName + " · " + addressName;
		return placeName;
	}

	private String textOrNull(JsonNode node) {
		if (node == null || node.isNull()) return null;
		String value = node.asText().trim();
		return value.isEmpty() ? null : value;
	}

	private String requiredText(JsonNode node) {
		String value = textOrNull(node);
		if (value == null) {
			throw new PublicCheckLocationServiceException(502, "KAKAO_INVALID_SCHEMA", "카카오 위치 검색 응답 형식이 올바르지 않습니다.");
		}
		return value;
	}

	private double parseCoordinate(String value, String axis) {
		try {
			return Double.parseDouble(value);
		} catch (NumberFormatException error) {
			throw new PublicCheckLocationServiceException(502, "KAKAO_INVALID_COORDINATE", "카카오 위치 검색 응답의 " + axis + " 값이 올바르지 않습니다.");
		}
	}
}
