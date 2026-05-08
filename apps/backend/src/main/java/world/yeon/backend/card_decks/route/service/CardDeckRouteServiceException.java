package world.yeon.backend.card_decks.route.service;

public class CardDeckRouteServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public CardDeckRouteServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
