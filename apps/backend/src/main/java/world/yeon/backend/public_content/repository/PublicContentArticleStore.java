package world.yeon.backend.public_content.repository;

import java.util.List;

public interface PublicContentArticleStore {
	List<PublicContentArticleRecord> findAll();

	default List<PublicContentAdminArticleRecord> findAllForAdmin() {
		return findAll().stream()
			.map(PublicContentAdminArticleRecord::fromPublishedArticle)
			.toList();
	}
}
