package world.yeon.backend.public_content.repository;

import java.util.List;
import java.util.Optional;

public interface PublicContentArticleStore {
	List<PublicContentArticleRecord> findAll();
	Optional<String> findArchivedRedirect(String channel, String slug);
}
