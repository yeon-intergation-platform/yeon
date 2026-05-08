package world.yeon.backend.card_decks.route.dto;

import com.fasterxml.jackson.databind.JsonNode;

public final class UpdateCardDeckItemRequest {
	private final boolean hasFrontText;
	private final String frontText;
	private final boolean hasBackText;
	private final String backText;

	public UpdateCardDeckItemRequest(JsonNode node) {
		JsonNode safe = node == null ? com.fasterxml.jackson.databind.node.NullNode.getInstance() : node;
		this.hasFrontText = safe.has("frontText");
		this.frontText = readNullableText(safe.get("frontText"));
		this.hasBackText = safe.has("backText");
		this.backText = readNullableText(safe.get("backText"));
	}

	private static String readNullableText(JsonNode node) {
		if (node == null || node.isNull()) return null;
		return node.asText();
	}

	public boolean hasFrontText() { return hasFrontText; }
	public String frontText() { return frontText; }
	public boolean hasBackText() { return hasBackText; }
	public String backText() { return backText; }
}
