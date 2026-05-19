package world.yeon.backend.star_lobby.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
public class StarLobbyDiscordWebhookNotifier {
	private static final Logger log = LoggerFactory.getLogger(StarLobbyDiscordWebhookNotifier.class);
	private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(3);

	private final HttpClient httpClient;
	private final ObjectMapper objectMapper;

	public StarLobbyDiscordWebhookNotifier(ObjectMapper objectMapper) {
		this(HttpClient.newBuilder().connectTimeout(REQUEST_TIMEOUT).build(), objectMapper);
	}

	StarLobbyDiscordWebhookNotifier(HttpClient httpClient, ObjectMapper objectMapper) {
		this.httpClient = httpClient;
		this.objectMapper = objectMapper;
	}

	public void notifyAfterCommit(List<DiscordWebhookNotification> notifications) {
		if (notifications == null || notifications.isEmpty()) return;
		List<DiscordWebhookNotification> snapshot = List.copyOf(notifications);
		if (TransactionSynchronizationManager.isSynchronizationActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override public void afterCommit() {
					sendAll(snapshot);
				}
			});
			return;
		}
		sendAll(snapshot);
	}

	public void sendTest(String webhookUrl) {
		send(webhookUrl, "[방 떴다] Discord 알림 테스트입니다. 이 메시지가 보이면 스타 로비 Discord 알림 전송 경로가 동작합니다.");
	}

	private void sendAll(List<DiscordWebhookNotification> notifications) {
		for (DiscordWebhookNotification notification : notifications) {
			sendAsync(notification.webhookUrl(), notification.content());
		}
	}

	private void sendAsync(String webhookUrl, String content) {
		try {
			httpClient.sendAsync(request(webhookUrl, content), HttpResponse.BodyHandlers.discarding())
				.thenAccept(response -> {
					if (response.statusCode() >= 400) {
						log.warn("스타 로비 Discord 알림 전송 실패: status={}", response.statusCode());
					}
				})
				.exceptionally(error -> {
					log.warn("스타 로비 Discord 알림 전송 중 오류", error);
					return null;
				});
		} catch (Exception error) {
			log.warn("스타 로비 Discord 알림 요청 생성 실패", error);
		}
	}

	private void send(String webhookUrl, String content) {
		try {
			HttpResponse<Void> response = httpClient.send(request(webhookUrl, content), HttpResponse.BodyHandlers.discarding());
			if (response.statusCode() >= 400) {
				throw new StarLobbyServiceException(502, "STAR_LOBBY_DISCORD_SEND_FAILED", "Discord 테스트 알림 전송에 실패했습니다.");
			}
		} catch (StarLobbyServiceException error) {
			throw error;
		} catch (Exception error) {
			throw new StarLobbyServiceException(502, "STAR_LOBBY_DISCORD_SEND_FAILED", "Discord 테스트 알림을 보내지 못했습니다.");
		}
	}

	private HttpRequest request(String webhookUrl, String content) throws Exception {
		String payload = objectMapper.writeValueAsString(Map.of("content", truncateDiscordContent(content)));
		return HttpRequest.newBuilder(URI.create(webhookUrl))
			.timeout(REQUEST_TIMEOUT)
			.header("content-type", "application/json")
			.POST(HttpRequest.BodyPublishers.ofString(payload))
			.build();
	}

	private String truncateDiscordContent(String content) {
		if (content == null) return "";
		return content.length() <= 1900 ? content : content.substring(0, 1900);
	}

	public record DiscordWebhookNotification(String webhookUrl, String content) {}
}
