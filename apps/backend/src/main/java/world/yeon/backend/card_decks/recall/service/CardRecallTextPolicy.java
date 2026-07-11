package world.yeon.backend.card_decks.recall.service;

import java.util.regex.Pattern;

final class CardRecallTextPolicy {
	private static final Pattern HTML_TAG = Pattern.compile("<[^>]*>", Pattern.DOTALL);
	private static final Pattern ACCESSIBLE_MEDIA_TEXT = Pattern.compile(
		"\\b(?:alt|title)\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)')",
		Pattern.CASE_INSENSITIVE
	);
	private static final Pattern NON_BREAKING_SPACE = Pattern.compile(
		"&(?:nbsp|#160|#x0*a0);",
		Pattern.CASE_INSENSITIVE
	);

	private CardRecallTextPolicy() {}

	static boolean hasGradeableText(String value) {
		if (value == null || value.isBlank()) return false;

		StringBuilder candidate = new StringBuilder(HTML_TAG.matcher(value).replaceAll(" "));
		var matcher = ACCESSIBLE_MEDIA_TEXT.matcher(value);
		while (matcher.find()) {
			candidate.append(' ').append(matcher.group(1) != null ? matcher.group(1) : matcher.group(2));
		}

		return !NON_BREAKING_SPACE.matcher(candidate).replaceAll(" ").trim().isEmpty();
	}
}
