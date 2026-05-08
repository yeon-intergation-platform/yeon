package world.yeon.backend.public_check_locations.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("jdbc")
public class KakaoLocationGateway {
	private static final String BASE_URL = "https://dapi.kakao.com/v2/local/search";
	private static final int MAX_RESULTS = 6;
	private static final Duration TIMEOUT = Duration.ofSeconds(7);

	private final HttpClient httpClient = HttpClient.newHttpClient();
	private final ObjectMapper objectMapper = new ObjectMapper();

	public JsonNode keywordSearch(String apiKey, String query) {
		return fetch(apiKey, "keyword.json", query, "카카오 키워드 위치 검색");
	}

	public JsonNode addressSearch(String apiKey, String query) {
		return fetch(apiKey, "address.json", query, "카카오 주소 위치 검색");
	}

	private JsonNode fetch(String apiKey, String path, String query, String label) {
		String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
		URI uri = URI.create(BASE_URL + "/" + path + "?query=" + encoded + "&size=" + MAX_RESULTS);
		HttpRequest request = HttpRequest.newBuilder(uri)
			.timeout(TIMEOUT)
			.header("Authorization", "KakaoAK " + apiKey)
			.GET()
			.build();

		HttpResponse<String> response;
		try {
			response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
		} catch (IOException | InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new PublicCheckLocationServiceException(502, "KAKAO_REQUEST_FAILED", "카카오 위치 검색 요청이 실패했습니다.");
		}

		JsonNode body;
		try {
			body = objectMapper.readTree(response.body());
		} catch (IOException error) {
			throw new PublicCheckLocationServiceException(502, "KAKAO_INVALID_JSON", "카카오 위치 검색 응답을 해석하지 못했습니다.");
		}

		if (response.statusCode() < 200 || response.statusCode() >= 300) {
			String errorType = body.path("errorType").asText(null);
			String message = body.path("message").asText(null);
			if ("NotAuthorizedError".equals(errorType) && message != null && message.contains("OPEN_MAP_AND_LOCAL")) {
				throw new PublicCheckLocationServiceException(500, "KAKAO_FEATURE_DISABLED", "Kakao Developers에서 OPEN_MAP_AND_LOCAL 서비스를 활성화해야 위치 검색을 사용할 수 있습니다.");
			}
			if ("NotAuthorizedError".equals(errorType)) {
				throw new PublicCheckLocationServiceException(500, "KAKAO_CONFIG_INVALID", "KAKAO_REST_API_KEY 설정 또는 Kakao 앱 권한을 확인해 주세요.");
			}
			throw new PublicCheckLocationServiceException(502, "KAKAO_REQUEST_FAILED", "카카오 위치 검색 요청이 실패했습니다.");
		}

		if (!body.has("documents") || !body.get("documents").isArray()) {
			throw new PublicCheckLocationServiceException(502, "KAKAO_INVALID_SCHEMA", label + " 응답 형식이 올바르지 않습니다.");
		}

		return body;
	}
}
