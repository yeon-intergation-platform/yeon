package world.yeon.backend.public_content.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PublicContentAdminArticleStore {
	List<PublicContentAdminArticleRecord> findAllForAdmin();

	default Optional<PublicContentAdminArticleRecord> findForAdmin(String articleId) {
		return findAllForAdmin().stream()
			.filter(article -> article.id().equals(articleId))
			.findFirst();
	}

	default PublicContentAdminArticleRecord create(
		PublicContentArticleDraft draft,
		UUID actorId
	) {
		throw unavailable();
	}

	default PublicContentAdminArticleRecord update(
		String articleId,
		PublicContentArticleDraft draft,
		long expectedVersion,
		UUID actorId
	) {
		throw unavailable();
	}

	default PublicContentAdminArticleRecord requestReview(
		String articleId,
		long expectedVersion,
		UUID actorId
	) {
		throw unavailable();
	}

	default PublicContentAdminArticleRecord publish(
		String articleId,
		long expectedVersion,
		UUID actorId
	) {
		throw unavailable();
	}

	default PublicContentAdminArticleRecord archive(
		String articleId,
		long expectedVersion,
		UUID actorId
	) {
		throw unavailable();
	}

	default PublicContentAdminArticleRecord restore(
		String articleId,
		long expectedVersion,
		UUID actorId
	) {
		throw unavailable();
	}

	default void delete(String articleId, long expectedVersion) {
		throw unavailable();
	}

	default List<PublicContentRevisionRecord> findRevisions(String articleId) {
		return List.of();
	}

	private static PublicContentStoreUnavailableException unavailable() {
		return new PublicContentStoreUnavailableException(
			"현재 공개 콘텐츠 저장소는 읽기 전용입니다. PUBLIC_CONTENT_STORE=jdbc 설정을 확인해 주세요."
		);
	}
}
