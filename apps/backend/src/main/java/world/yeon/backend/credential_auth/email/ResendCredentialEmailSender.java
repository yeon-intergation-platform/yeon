package world.yeon.backend.credential_auth.email;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ResendCredentialEmailSender {
	private static final String RESEND_ENDPOINT = "https://api.resend.com/emails";
	private final Environment environment;
	private final HttpClient httpClient;

	public ResendCredentialEmailSender(Environment environment) {
		this.environment = environment;
		this.httpClient = HttpClient.newHttpClient();
	}

	public boolean send(String to, CredentialEmailTemplates.EmailMessage message) {
		String apiKey = resolve("RESEND_API_KEY", "resend.api.key");
		String from = resolve("RESEND_FROM_ADDRESS", "resend.from.address");
		if (apiKey == null || from == null) {
			System.err.println("이메일 발송 설정이 없어 메일을 건너뜁니다.");
			return false;
		}

		try {
			String body = "{\"from\":\"" + jsonEscape(from) + "\",\"to\":\"" + jsonEscape(to) + "\",\"subject\":\"" + jsonEscape(message.subject()) + "\",\"html\":\"" + jsonEscape(message.html()) + "\"}";
			HttpRequest request = HttpRequest.newBuilder(URI.create(RESEND_ENDPOINT))
				.header("authorization", "Bearer " + apiKey)
				.header("content-type", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(body))
				.build();
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() >= 200 && response.statusCode() < 300) {
				return true;
			}
			System.err.println("이메일 발송 실패: status=" + response.statusCode());
			return false;
		} catch (Exception error) {
			System.err.println("이메일 발송 중 오류: " + error.getMessage());
			return false;
		}
	}

	private String resolve(String envName, String propertyName) {
		String fromProperty = environment.getProperty(envName);
		if (fromProperty != null && !fromProperty.trim().isBlank()) return fromProperty.trim();
		String normalized = environment.getProperty(propertyName);
		if (normalized != null && !normalized.trim().isBlank()) return normalized.trim();
		String fromEnv = System.getenv(envName);
		if (fromEnv != null && !fromEnv.trim().isBlank()) return fromEnv.trim();
		return null;
	}

	private String jsonEscape(String raw) {
		return raw
			.replace("\\", "\\\\")
			.replace("\"", "\\\"")
			.replace("\n", "\\n")
			.replace("\r", "\\r")
			.replace("\t", "\\t");
	}
}
