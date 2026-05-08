package world.yeon.backend.typing_decks.dto;

import com.fasterxml.jackson.databind.JsonNode;

public final class UpdateTypingDeckPassageRequest {
	private final boolean hasTitle;
	private final String title;
	private final boolean hasPrompt;
	private final String prompt;
	private final boolean hasTextType;
	private final String textType;
	private final boolean hasDifficulty;
	private final String difficulty;
	private final boolean hasSortOrder;
	private final Integer sortOrder;

	public UpdateTypingDeckPassageRequest(JsonNode node) {
		JsonNode safeNode = node == null ? com.fasterxml.jackson.databind.node.NullNode.getInstance() : node;
		this.hasTitle = safeNode.has("title");
		this.title = readNullableText(safeNode.get("title"));
		this.hasPrompt = safeNode.has("prompt");
		this.prompt = readNullableText(safeNode.get("prompt"));
		this.hasTextType = safeNode.has("textType");
		this.textType = readNullableText(safeNode.get("textType"));
		this.hasDifficulty = safeNode.has("difficulty");
		this.difficulty = readNullableText(safeNode.get("difficulty"));
		this.hasSortOrder = safeNode.has("sortOrder");
		this.sortOrder = readNullableInt(safeNode.get("sortOrder"));
	}

	private static String readNullableText(JsonNode node) {
		if (node == null || node.isNull()) return null;
		return node.asText();
	}

	private static Integer readNullableInt(JsonNode node) {
		if (node == null || node.isNull()) return null;
		return node.asInt();
	}

	public boolean hasTitle() { return hasTitle; }
	public String title() { return title; }
	public boolean hasPrompt() { return hasPrompt; }
	public String prompt() { return prompt; }
	public boolean hasTextType() { return hasTextType; }
	public String textType() { return textType; }
	public boolean hasDifficulty() { return hasDifficulty; }
	public String difficulty() { return difficulty; }
	public boolean hasSortOrder() { return hasSortOrder; }
	public Integer sortOrder() { return sortOrder; }
}
