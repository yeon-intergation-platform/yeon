package world.yeon.backend.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Import(SecurityConfigTests.SecuritySmokeController.class)
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class SecurityConfigTests {

	private final HttpClient httpClient = HttpClient.newHttpClient();

	@LocalServerPort
	private int port;

	@Test
	void healthEndpoint는인증없이접근할수있다() throws IOException, InterruptedException {
		HttpResponse<String> response = sendGet("/actuator/health");

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(response.body()).contains("UP");
	}

	@Test
	void actuatorRoot는인증없이는차단된다() throws IOException, InterruptedException {
		HttpResponse<String> response = sendGet("/actuator");

		assertThat(response.statusCode()).isEqualTo(401);
	}

	@Test
	void internalToken이맞으면spaceTemplatesRoute는통과한다()
		throws IOException, InterruptedException {
		HttpRequest request = HttpRequest.newBuilder()
			.uri(URI.create("http://127.0.0.1:" + port + "/space-templates/security-smoke"))
			.header("accept", "application/json")
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.GET()
			.build();

		HttpResponse<String> response =
			httpClient.send(request, HttpResponse.BodyHandlers.ofString());

		assertThat(response.statusCode()).isNotEqualTo(401);
	}

	@Test
	void internalToken이맞으면spacesRoute도통과한다()
		throws IOException, InterruptedException {
		HttpRequest request = HttpRequest.newBuilder()
			.uri(URI.create("http://127.0.0.1:" + port + "/spaces/security-smoke"))
			.header("accept", "application/json")
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.GET()
			.build();

		HttpResponse<String> response =
			httpClient.send(request, HttpResponse.BodyHandlers.ofString());

		assertThat(response.statusCode()).isNotEqualTo(401);
	}

	@RestController
	static class SecuritySmokeController {

		@GetMapping("/space-templates/security-smoke")
		String smoke() {
			return "ok";
		}

		@GetMapping("/spaces/security-smoke")
		String spacesSmoke() {
			return "ok";
		}
	}

	private HttpResponse<String> sendGet(String path) throws IOException, InterruptedException {
		HttpRequest request = HttpRequest.newBuilder()
			.uri(URI.create("http://127.0.0.1:" + port + path))
			.header("accept", "application/json")
			.GET()
			.build();

		return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
	}
}
