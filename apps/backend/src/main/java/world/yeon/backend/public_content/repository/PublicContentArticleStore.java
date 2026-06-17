package world.yeon.backend.public_content.repository;

import java.util.List;

public interface PublicContentArticleStore {
	List<PublicContentArticleRecord> findAll();
}
