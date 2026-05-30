package world.yeon.backend.openapi;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * springdoc-openapi 가 OpenAPI 3 계약(JSON)을 실제로 생성하는지 검증한다.
 * /v3/api-docs 는 인증 대상이므로 내부 토큰으로 조회한다.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Testcontainers
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class OpenApiDocsTest {

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@DynamicPropertySource
	static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add(
			"DATABASE_URL",
			() -> "postgresql://" + postgres.getUsername() + ":" + postgres.getPassword()
				+ "@" + postgres.getHost() + ":" + postgres.getFirstMappedPort()
				+ "/" + postgres.getDatabaseName()
		);
	}

	@LocalServerPort
	int port;

	@Test
	void openapi_계약_문서를_생성한다() throws Exception {
		HttpRequest request = HttpRequest.newBuilder()
			.uri(URI.create("http://127.0.0.1:" + port + "/v3/api-docs"))
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.GET()
			.build();
		HttpResponse<String> response =
			HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(response.body()).contains("\"openapi\"");
		// 실제 컨트롤러 경로가 스펙에 포함되는지(예: 카드 에셋 업로드)
		assertThat(response.body()).contains("/card-decks/assets");
	}
}
