package world.yeon.backend.card_decks.route.dto;

import java.util.Map;

public final class UpdateCardDeckItemRequest {
	private final boolean hasFrontText;
	private final String frontText;
	private final boolean hasBackText;
	private final String backText;
	private final boolean hasImageStorageKey;
	private final String imageStorageKey;

	public UpdateCardDeckItemRequest(Map<String, Object> body) {
		Map<String, Object> safe = body == null ? Map.of() : body;
		this.hasFrontText = safe.containsKey("frontText");
		this.frontText = readNullableText(safe.get("frontText"));
		this.hasBackText = safe.containsKey("backText");
		this.backText = readNullableText(safe.get("backText"));
		this.hasImageStorageKey = safe.containsKey("imageStorageKey");
		this.imageStorageKey = readNullableText(safe.get("imageStorageKey"));
	}

	private static String readNullableText(Object value) {
		if (value == null) return null;
		return String.valueOf(value);
	}

	public boolean hasFrontText() { return hasFrontText; }
	public String frontText() { return frontText; }
	public boolean hasBackText() { return hasBackText; }
	public String backText() { return backText; }
	public boolean hasImageStorageKey() { return hasImageStorageKey; }
	public String imageStorageKey() { return imageStorageKey; }
}
