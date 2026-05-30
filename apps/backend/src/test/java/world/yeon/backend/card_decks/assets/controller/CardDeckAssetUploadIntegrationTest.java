package world.yeon.backend.card_decks.assets.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * 카드 이미지 업로드/조회를 실제 임베디드 Tomcat + Spring Security 필터 체인을 거쳐 검증한다.
 *
 * <p>기존 {@link CardDeckAssetControllerTests}는 {@code @WebMvcTest} + {@code MockMultipartFile}
 * 이라 (1) 서블릿 멀티파트 크기 한도와 (2) URL 경로의 인코딩된 슬래시(%2F) 처리를 전혀
 * 검증하지 못한다. 두 지점 모두 "이미지 등록이 제대로 안 됨" 증상의 실제 원인이 될 수 있어
 * 실 HTTP 왕복으로 회귀를 막는다.
 *
 * <p>HTTP 클라이언트는 SecurityConfigTests와 동일하게 JDK {@link HttpClient}를 쓴다
 * (Spring Boot 4에서 TestRestTemplate 제거).
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CardDeckAssetUploadIntegrationTest {

	private static final String INTERNAL_TOKEN = "test-internal-token";
	private static final String BOUNDARY = "yeonCardAssetBoundary";
	private static final Pattern STORAGE_KEY = Pattern.compile("\"storageKey\"\\s*:\\s*\"([^\"]+)\"");
	private static final Pattern IMAGE_URL = Pattern.compile("\"imageUrl\"\\s*:\\s*\"([^\"]+)\"");

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

	private final HttpClient httpClient = HttpClient.newHttpClient();

	@LocalServerPort
	private int port;

	@Test
	void 일메가초과_이미지도_등록된다() throws IOException, InterruptedException {
		// 회귀 방지: 서블릿 멀티파트 기본 한도(1MB) 때문에 1MB 초과 사진이 컨트롤러 도달 전에 거부되던 버그.
		HttpResponse<String> response = uploadImage(new byte[2 * 1024 * 1024], "photo.png", "image/png");

		assertThat(response.statusCode()).isEqualTo(201);
		assertThat(group(STORAGE_KEY, response.body())).startsWith("card-service/images/");
		assertThat(group(IMAGE_URL, response.body())).startsWith("/api/v1/card-decks/assets/");
	}

	@Test
	void 업로드한_이미지를_반환URL로_되읽을_수_있다() throws IOException, InterruptedException {
		// 회귀 방지: imageUrl 경로의 인코딩된 슬래시(%2F)를 Tomcat/Security가 막지 않고
		// 원본 바이트 + content-type을 그대로 돌려주어야 화면에 이미지가 뜬다.
		byte[] original = new byte[2 * 1024 * 1024];
		HttpResponse<String> upload = uploadImage(original, "photo.png", "image/png");
		assertThat(upload.statusCode()).isEqualTo(201);

		// 프로덕션과 동일하게 반환된 imageUrl(예: /api/v1/card-decks/assets/card-service%2F...)에서
		// /api/v1 프리픽스만 떼고 Spring 엔드포인트로 그대로 조회한다(%2F 재인코딩하지 않음).
		String springPath = group(IMAGE_URL, upload.body()).substring("/api/v1".length());
		HttpRequest readRequest = HttpRequest.newBuilder()
			.uri(URI.create("http://127.0.0.1:" + port + springPath))
			.header("X-Yeon-Internal-Token", INTERNAL_TOKEN)
			.GET()
			.build();
		HttpResponse<byte[]> read = httpClient.send(readRequest, HttpResponse.BodyHandlers.ofByteArray());

		assertThat(read.statusCode()).isEqualTo(200);
		assertThat(read.headers().firstValue("content-type")).hasValue("image/png");
		assertThat(read.body()).hasSize(original.length);
	}

	@Test
	void 오메가초과_이미지는_친절한_400을_준다() throws IOException, InterruptedException {
		// 서블릿 한도(6MB) 미만이되 서비스 한도(5MB)를 초과하는 5.5MB로, 컨트롤러까지 도달해
		// 서비스 검증이 친절한 400을 내는지 확인한다(연결 리셋 없이 안정적).
		byte[] overLimit = new byte[(int) (5.5 * 1024 * 1024)];
		HttpResponse<String> response = uploadImage(overLimit, "huge.png", "image/png");

		assertThat(response.statusCode()).isEqualTo(400);
		assertThat(response.body()).contains("5MB 이하");
	}

	@Test
	void 이미지가_아닌_파일은_400으로_거부한다() throws IOException, InterruptedException {
		HttpResponse<String> response =
			uploadImage("not-an-image".getBytes(StandardCharsets.UTF_8), "note.txt", "text/plain");

		assertThat(response.statusCode()).isEqualTo(400);
		assertThat(response.body()).contains("PNG, JPG, WEBP, GIF");
	}

	private HttpResponse<String> uploadImage(byte[] bytes, String filename, String contentType)
		throws IOException, InterruptedException {
		HttpRequest request = HttpRequest.newBuilder()
			.uri(URI.create("http://127.0.0.1:" + port + "/card-decks/assets"))
			.header("X-Yeon-Internal-Token", INTERNAL_TOKEN)
			.header("Content-Type", "multipart/form-data; boundary=" + BOUNDARY)
			.POST(HttpRequest.BodyPublishers.ofByteArray(multipartBody(bytes, filename, contentType)))
			.build();
		return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
	}

	private byte[] multipartBody(byte[] fileBytes, String filename, String contentType) {
		byte[] preamble = ("--" + BOUNDARY + "\r\n"
			+ "Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"\r\n"
			+ "Content-Type: " + contentType + "\r\n\r\n").getBytes(StandardCharsets.UTF_8);
		byte[] epilogue = ("\r\n--" + BOUNDARY + "--\r\n").getBytes(StandardCharsets.UTF_8);

		byte[] body = new byte[preamble.length + fileBytes.length + epilogue.length];
		System.arraycopy(preamble, 0, body, 0, preamble.length);
		System.arraycopy(fileBytes, 0, body, preamble.length, fileBytes.length);
		System.arraycopy(epilogue, 0, body, preamble.length + fileBytes.length, epilogue.length);
		return body;
	}

	private String group(Pattern pattern, String body) {
		Matcher matcher = pattern.matcher(body);
		assertThat(matcher.find()).as("응답 본문에서 패턴을 찾지 못함: " + body).isTrue();
		return matcher.group(1);
	}
}
