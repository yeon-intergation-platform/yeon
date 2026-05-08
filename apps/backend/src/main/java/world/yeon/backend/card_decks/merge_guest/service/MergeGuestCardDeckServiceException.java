package world.yeon.backend.card_decks.merge_guest.service;

public class MergeGuestCardDeckServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public MergeGuestCardDeckServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
