package world.yeon.backend.card_decks.route.dto;

import com.fasterxml.jackson.databind.JsonNode;

public final class UpdateCardDeckRequest {
	private final boolean hasTitle;
	private final String title;
	private final boolean hasDescription;
	private final String description;

	public UpdateCardDeckRequest(JsonNode node) {
		JsonNode safe = node == null ? com.fasterxml.jackson.databind.node.NullNode.getInstance() : node;
		this.hasTitle = safe.has("title");
		this.title = readNullableText(safe.get("title"));
		this.hasDescription = safe.has("description");
		this.description = readNullableText(safe.get("description"));
	}

	private static String readNullableText(JsonNode node) {
		if (node == null || node.isNull()) return null;
		return node.asText();
	}

	public boolean hasTitle() { return hasTitle; }
	public String title() { return title; }
	public boolean hasDescription() { return hasDescription; }
	public String description() { return description; }
}
