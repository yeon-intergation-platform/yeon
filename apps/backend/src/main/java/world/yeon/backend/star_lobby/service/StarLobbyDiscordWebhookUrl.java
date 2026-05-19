package world.yeon.backend.star_lobby.service;

import static world.yeon.backend.star_lobby.service.StarLobbyDomainRules.DISCORD_WEBHOOK_URL_MAX_LENGTH;

import java.net.URI;
import java.util.Locale;

public record StarLobbyDiscordWebhookUrl(String value) {
	private static final String DISCORD_WEBHOOK_PATH_PREFIX = "/api/webhooks/";
	private static final String DISCORD_HOST = "discord.com";
	private static final String DISCORD_APP_HOST = "discordapp.com";

	public StarLobbyDiscordWebhookUrl {
		value = normalize(value);
		if (!isDiscordWebhook(value)) {
			throw new StarLobbyServiceException(400, "STAR_LOBBY_INVALID_DISCORD_WEBHOOK", "Discord 웹훅 URL 형식이 올바르지 않습니다.");
		}
	}

	private static String normalize(String input) {
		if (input == null || input.trim().isEmpty()) {
			throw new StarLobbyServiceException(400, "STAR_LOBBY_INVALID_DISCORD_WEBHOOK", "Discord 웹훅 URL을 입력해 주세요.");
		}
		String normalized = input.trim();
		if (normalized.length() > DISCORD_WEBHOOK_URL_MAX_LENGTH) {
			throw new StarLobbyServiceException(400, "STAR_LOBBY_INVALID_DISCORD_WEBHOOK", "Discord 웹훅 URL은 " + DISCORD_WEBHOOK_URL_MAX_LENGTH + "자 이하로 입력해 주세요.");
		}
		return normalized;
	}

	private static boolean isDiscordWebhook(String value) {
		try {
			URI uri = URI.create(value);
			String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);
			String path = uri.getPath() == null ? "" : uri.getPath();
			return "https".equalsIgnoreCase(uri.getScheme())
				&& isDiscordHost(host)
				&& path.startsWith(DISCORD_WEBHOOK_PATH_PREFIX);
		} catch (Exception error) {
			return false;
		}
	}

	private static boolean isDiscordHost(String host) {
		return host.equals(DISCORD_HOST)
			|| host.endsWith("." + DISCORD_HOST)
			|| host.equals(DISCORD_APP_HOST)
			|| host.endsWith("." + DISCORD_APP_HOST);
	}
}
