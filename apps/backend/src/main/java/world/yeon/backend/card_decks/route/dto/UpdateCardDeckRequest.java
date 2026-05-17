package world.yeon.backend.card_decks.route.dto;

import java.util.Map;

public final class UpdateCardDeckRequest {
	private final boolean hasTitle;
	private final String title;
	private final boolean hasDescription;
	private final String description;

	public UpdateCardDeckRequest(Map<String, Object> body) {
		Map<String, Object> safe = body == null ? Map.of() : body;
		this.hasTitle = safe.containsKey("title");
		this.title = readNullableText(safe.get("title"));
		this.hasDescription = safe.containsKey("description");
		this.description = readNullableText(safe.get("description"));
	}

	private static String readNullableText(Object value) {
		if (value == null) return null;
		return String.valueOf(value);
	}

	public boolean hasTitle() { return hasTitle; }
	public String title() { return title; }
	public boolean hasDescription() { return hasDescription; }
	public String description() { return description; }
}
