package world.yeon.backend.star_lobby.service;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class StarLobbyOperationsReadiness {
	private final boolean springInternalTokenConfigured;
	private final boolean realtimeEventsUrlConfigured;
	private final boolean realtimeInternalTokenConfigured;

	public StarLobbyOperationsReadiness(Environment environment) {
		this.springInternalTokenConfigured = isConfigured(environment, "SPRING_INTERNAL_TOKEN", "spring.internal.token");
		this.realtimeEventsUrlConfigured = isConfigured(environment, "STAR_LOBBY_REALTIME_EVENTS_URL", "star-lobby.realtime.events-url");
		this.realtimeInternalTokenConfigured = isConfigured(environment, "STAR_LOBBY_INTERNAL_TOKEN", "star-lobby.internal-token") || springInternalTokenConfigured;
	}

	public boolean springInternalTokenConfigured() {
		return springInternalTokenConfigured;
	}

	public boolean realtimeEventsUrlConfigured() {
		return realtimeEventsUrlConfigured;
	}

	public boolean realtimeInternalTokenConfigured() {
		return realtimeInternalTokenConfigured;
	}

	private boolean isConfigured(Environment environment, String environmentName, String propertyName) {
		return trimToNull(environment.getProperty(environmentName)) != null
			|| trimToNull(environment.getProperty(propertyName)) != null
			|| trimToNull(System.getenv(environmentName)) != null;
	}

	private String trimToNull(String value) {
		if (value == null) return null;
		String normalized = value.trim();
		return normalized.isEmpty() ? null : normalized;
	}
}
