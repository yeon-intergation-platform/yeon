package world.yeon.backend.typing_decks.dto;

public record TypingRaceSeedDto(
	String passageId,
	String prompt,
	String roundLabel,
	String seedToken,
	String deckId,
	String deckVisibility,
	String lobbyDeckTitle,
	String participantDeckTitle,
	String languageTag
) {}
