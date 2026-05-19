package world.yeon.backend.star_lobby.service;

public final class StarLobbyDomainRules {
	public static final int RECENT_ROOM_LIMIT = 100;
	public static final int GUEST_SESSION_MAX_LENGTH = 128;
	public static final int ROOM_TITLE_MAX_LENGTH = 160;
	public static final int ROOM_RAW_TEXT_MAX_LENGTH = 1000;
	public static final int ALERT_NAME_MAX_LENGTH = 80;
	public static final int KEYWORD_MAX_LENGTH = 80;
	public static final int INCLUDE_KEYWORD_MIN_COUNT = 1;
	public static final int KEYWORD_MAX_COUNT = 20;
	public static final int PLAYER_MIN = 0;
	public static final int PLAYER_MAX = 12;
	public static final int DISCORD_WEBHOOK_URL_MAX_LENGTH = 2000;
	public static final int DISCORD_CONTENT_MAX_LENGTH = 1900;

	public static final String ROOM_STATUS_OBSERVED = "observed";
	public static final String ROOM_STATUS_DISAPPEARED = "disappeared";
	public static final String ALERT_MATCH_STATUS_MATCHED = "matched";
	public static final String ALERT_MATCH_STATUS_SUPPRESSED = "suppressed";
	public static final String EVENT_ROOM_OBSERVED = "room_observed";
	public static final String EVENT_ROOM_DISAPPEARED = "room_disappeared";
	public static final String EVENT_ALERT_MATCHED = "alert_matched";

	private StarLobbyDomainRules() {}
}
