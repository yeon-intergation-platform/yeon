package world.yeon.backend.public_content.repository;

public class PublicContentStoreConflictException extends RuntimeException {
	public PublicContentStoreConflictException(String message) {
		super(message);
	}
}
