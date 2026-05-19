package world.yeon.backend.star_lobby.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import world.yeon.backend.star_lobby.dto.StarLobbyDtos.StarLobbyRealtimeEvent;

@Component
public class StarLobbyRealtimePublisher {
	private static final Logger log = LoggerFactory.getLogger(StarLobbyRealtimePublisher.class);
	private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(2);

	private final HttpClient httpClient;
	private final ObjectMapper objectMapper;
	private final String eventsUrl;
	private final String internalToken;

	@Autowired
	public StarLobbyRealtimePublisher(
		ObjectMapper objectMapper,
		@Value("${STAR_LOBBY_REALTIME_EVENTS_URL:}") String eventsUrl,
		@Value("${STAR_LOBBY_INTERNAL_TOKEN:${SPRING_INTERNAL_TOKEN:}}") String internalToken
	) {
		this(HttpClient.newBuilder().connectTimeout(REQUEST_TIMEOUT).build(), objectMapper, eventsUrl, internalToken);
	}

	StarLobbyRealtimePublisher(HttpClient httpClient, ObjectMapper objectMapper, String eventsUrl, String internalToken) {
		this.httpClient = httpClient;
		this.objectMapper = objectMapper;
		this.eventsUrl = trimToNull(eventsUrl);
		this.internalToken = trimToNull(internalToken);
	}

	public void publishAfterCommit(List<StarLobbyRealtimeEvent> events) {
		if (events == null || events.isEmpty() || eventsUrl == null) return;
		List<StarLobbyRealtimeEvent> snapshot = List.copyOf(events);
		if (TransactionSynchronizationManager.isSynchronizationActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override public void afterCommit() {
					publish(snapshot);
				}
			});
			return;
		}
		publish(snapshot);
	}

	private void publish(List<StarLobbyRealtimeEvent> events) {
		for (StarLobbyRealtimeEvent event : events) {
			try {
				HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(eventsUrl))
					.timeout(REQUEST_TIMEOUT)
					.header("content-type", "application/json")
					.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(event)));
				if (internalToken != null) builder.header("X-Yeon-Internal-Token", internalToken);
				httpClient.sendAsync(builder.build(), HttpResponse.BodyHandlers.discarding())
					.thenAccept(response -> {
						if (response.statusCode() >= 400) {
							log.warn("스타 로비 실시간 이벤트 전송 실패: status={} type={}", response.statusCode(), event.type());
						}
					})
					.exceptionally(error -> {
						log.warn("스타 로비 실시간 이벤트 전송 중 오류: type={}", event.type(), error);
						return null;
					});
			} catch (Exception error) {
				log.warn("스타 로비 실시간 이벤트 요청 생성 실패: type={}", event.type(), error);
			}
		}
	}

	private String trimToNull(String value) {
		if (value == null) return null;
		String normalized = value.trim();
		return normalized.isEmpty() ? null : normalized;
	}
}
