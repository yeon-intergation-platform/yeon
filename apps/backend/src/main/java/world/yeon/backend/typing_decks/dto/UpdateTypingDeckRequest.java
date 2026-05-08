package world.yeon.backend.typing_decks.dto;

import com.fasterxml.jackson.databind.JsonNode;

public final class UpdateTypingDeckRequest {
	private final boolean hasTitle;
	private final String title;
	private final boolean hasDescription;
	private final String description;
	private final boolean hasLanguageTag;
	private final String languageTag;
	private final boolean hasVisibility;
	private final String visibility;

	public UpdateTypingDeckRequest(JsonNode node) {
		JsonNode safeNode = node == null ? com.fasterxml.jackson.databind.node.NullNode.getInstance() : node;
		this.hasTitle = safeNode.has("title");
		this.title = readNullableText(safeNode.get("title"));
		this.hasDescription = safeNode.has("description");
		this.description = readNullableText(safeNode.get("description"));
		this.hasLanguageTag = safeNode.has("languageTag");
		this.languageTag = readNullableText(safeNode.get("languageTag"));
		this.hasVisibility = safeNode.has("visibility");
		this.visibility = readNullableText(safeNode.get("visibility"));
	}

	private static String readNullableText(JsonNode node) {
		if (node == null || node.isNull()) return null;
		return node.asText();
	}

	public boolean hasTitle() { return hasTitle; }
	public String title() { return title; }
	public boolean hasDescription() { return hasDescription; }
	public String description() { return description; }
	public boolean hasLanguageTag() { return hasLanguageTag; }
	public String languageTag() { return languageTag; }
	public boolean hasVisibility() { return hasVisibility; }
	public String visibility() { return visibility; }
}
