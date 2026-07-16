package world.yeon.backend.public_content.repository;

public class PublicContentStoreUnavailableException extends RuntimeException {
	public PublicContentStoreUnavailableException(String message) {
		super(message);
	}
}
