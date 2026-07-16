package world.yeon.backend.public_content.service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleDto;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleListResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleWriteRequest;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentRevisionDto;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentRevisionListResponse;
import world.yeon.backend.public_content.repository.PublicContentAdminArticleRecord;
import world.yeon.backend.public_content.repository.PublicContentAdminArticleStore;
import world.yeon.backend.public_content.repository.PublicContentStoreConflictException;
import world.yeon.backend.public_content.repository.PublicContentStoreUnavailableException;
import world.yeon.backend.users.repository.UserRepository;

@Service
public class PublicContentAdminService {
	private static final String ADMIN_ROLE = "admin";
	private static final Comparator<PublicContentAdminArticleRecord> ADMIN_ORDER =
		Comparator.comparing(
				PublicContentAdminArticleRecord::updatedAt,
				Comparator.nullsLast(Comparator.reverseOrder())
			)
			.thenComparing(PublicContentAdminArticleRecord::slug);

	private final PublicContentAdminArticleStore repository;
	private final UserRepository userRepository;
	private final PublicContentMarkdownExporter exporter;
	private final Set<String> adminSeedEmails;

	public PublicContentAdminService(
		PublicContentAdminArticleStore repository,
		UserRepository userRepository,
		PublicContentMarkdownExporter exporter,
		@Value("${YEON_ADMIN_EMAILS:${ADMIN_EMAILS:}}") String adminEmails
	) {
		this.repository = repository;
		this.userRepository = userRepository;
		this.exporter = exporter;
		this.adminSeedEmails = parseAdminSeedEmails(adminEmails);
	}

	@Transactional(readOnly = true)
	public PublicContentAdminArticleListResponse listArticles(
		UUID callerUserId,
		String channel,
		String serviceKey,
		String category,
		String status,
		String visibility
	) {
		requireAdmin(callerUserId);
		PublicContentPolicy.requireOptionalValue(
			channel,
			PublicContentPolicy.CHANNELS,
			"지원하지 않는 공개 콘텐츠 채널입니다."
		);
		PublicContentPolicy.requireOptionalValue(
			serviceKey,
			PublicContentPolicy.SERVICE_KEYS,
			"지원하지 않는 공개 콘텐츠 서비스입니다."
		);
		PublicContentPolicy.requireOptionalValue(
			category,
			PublicContentPolicy.CATEGORIES,
			"지원하지 않는 공개 콘텐츠 분류입니다."
		);
		PublicContentPolicy.requireOptionalValue(
			status,
			PublicContentPolicy.STATUSES,
			"지원하지 않는 공개 콘텐츠 상태입니다."
		);
		PublicContentPolicy.requireOptionalValue(
			visibility,
			PublicContentPolicy.VISIBILITIES,
			"지원하지 않는 공개 콘텐츠 공개 범위입니다."
		);

		var articles = repository.findAllForAdmin().stream()
			.filter(article -> channel == null || article.channel().equals(channel))
			.filter(article -> serviceKey == null || article.serviceKey().equals(serviceKey))
			.filter(article -> category == null || article.category().equals(category))
			.filter(article -> status == null || article.status().equals(status))
			.filter(article -> visibility == null || article.visibility().equals(visibility))
			.sorted(ADMIN_ORDER)
			.map(this::toDto)
			.toList();

		return new PublicContentAdminArticleListResponse(articles);
	}

	@Transactional(readOnly = true)
	public PublicContentAdminArticleResponse getArticle(UUID callerUserId, String articleId) {
		requireAdmin(callerUserId);
		return response(requireArticle(articleId));
	}

	@Transactional
	public PublicContentAdminArticleResponse createArticle(
		UUID callerUserId,
		PublicContentAdminArticleWriteRequest request
	) {
		requireAdmin(callerUserId);
		var draft = PublicContentPolicy.toDraft(request);
		return response(executeStore(() -> repository.create(draft, callerUserId)));
	}

	@Transactional
	public PublicContentAdminArticleResponse updateArticle(
		UUID callerUserId,
		String articleId,
		PublicContentAdminArticleWriteRequest request
	) {
		requireAdmin(callerUserId);
		long version = requireVersion(request == null ? null : request.version());
		var current = requireArticle(articleId);
		var draft = PublicContentPolicy.toDraft(request);

		boolean changesPublicIdentity =
			!current.channel().equals(draft.channel()) || !current.slug().equals(draft.slug());
		boolean hasPublishedHistory = current.publishedRevisionId() != null ||
			(changesPublicIdentity && !repository.findRevisions(articleId).isEmpty());
		if (changesPublicIdentity && hasPublishedHistory) {
			throw conflict("발행 이력이 있는 글의 채널과 slug는 변경할 수 없습니다.");
		}

		return response(executeStore(() ->
			repository.update(articleId, draft, version, callerUserId)));
	}

	@Transactional
	public PublicContentAdminArticleResponse requestReview(
		UUID callerUserId,
		String articleId,
		long version
	) {
		requireAdmin(callerUserId);
		requireState(articleId, version, "draft", "초안 상태의 글만 검수를 요청할 수 있습니다.");
		return response(executeStore(() ->
			repository.requestReview(articleId, version, callerUserId)));
	}

	@Transactional
	public PublicContentAdminArticleResponse publish(
		UUID callerUserId,
		String articleId,
		long version
	) {
		requireAdmin(callerUserId);
		var article = requireState(
			articleId,
			version,
			"review",
			"검수 중인 글만 발행할 수 있습니다."
		);
		if (!"public".equals(article.visibility()) || article.noindex()) {
			throw conflict("공개 발행하려면 공개 범위를 public로 두고 noindex를 해제해 주세요.");
		}
		return response(executeStore(() ->
			repository.publish(articleId, version, callerUserId)));
	}

	@Transactional
	public PublicContentAdminArticleResponse archive(
		UUID callerUserId,
		String articleId,
		long version
	) {
		requireAdmin(callerUserId);
		var article = requireArticle(articleId);
		requireMatchingVersion(article, version);
		if ("archived".equals(article.status())) {
			throw conflict("이미 보관된 글입니다.");
		}
		return response(executeStore(() ->
			repository.archive(articleId, version, callerUserId)));
	}

	@Transactional
	public PublicContentAdminArticleResponse restore(
		UUID callerUserId,
		String articleId,
		long version
	) {
		requireAdmin(callerUserId);
		requireState(articleId, version, "archived", "보관된 글만 복구할 수 있습니다.");
		return response(executeStore(() ->
			repository.restore(articleId, version, callerUserId)));
	}

	@Transactional
	public void deleteArticle(UUID callerUserId, String articleId, long version) {
		requireAdmin(callerUserId);
		var article = requireState(
			articleId,
			version,
			"draft",
			"발행 이력이 없는 초안만 영구 삭제할 수 있습니다."
		);
		if (article.publishedRevisionId() != null || !repository.findRevisions(articleId).isEmpty()) {
			throw conflict("발행 이력이 있는 글은 삭제하지 말고 보관해 주세요.");
		}
		executeStore(() -> {
			repository.delete(articleId, version);
			return null;
		});
	}

	@Transactional(readOnly = true)
	public PublicContentRevisionListResponse listRevisions(
		UUID callerUserId,
		String articleId
	) {
		requireAdmin(callerUserId);
		requireArticle(articleId);
		return new PublicContentRevisionListResponse(
			repository.findRevisions(articleId).stream()
				.map(revision -> new PublicContentRevisionDto(
					revision.id(),
					revision.articleId(),
					revision.revisionNumber(),
					revision.title(),
					revision.bodyMarkdown(),
					revision.publishedAt(),
					revision.createdBy()
				))
				.toList()
		);
	}

	@Transactional(readOnly = true)
	public PublicContentExportFile exportArticle(UUID callerUserId, String articleId) {
		requireAdmin(callerUserId);
		return exporter.markdown(requireArticle(articleId));
	}

	@Transactional(readOnly = true)
	public PublicContentExportFile exportArticles(UUID callerUserId, String channel) {
		requireAdmin(callerUserId);
		PublicContentPolicy.requireOptionalValue(
			channel,
			PublicContentPolicy.CHANNELS,
			"지원하지 않는 공개 콘텐츠 채널입니다."
		);
		List<PublicContentAdminArticleRecord> articles = repository.findAllForAdmin().stream()
			.filter(article -> channel == null || article.channel().equals(channel))
			.toList();
		return exporter.zip(articles, channel);
	}

	private PublicContentAdminArticleRecord requireState(
		String articleId,
		long version,
		String requiredStatus,
		String message
	) {
		var article = requireArticle(articleId);
		requireMatchingVersion(article, version);
		if (!requiredStatus.equals(article.status())) {
			throw conflict(message);
		}
		return article;
	}

	private void requireMatchingVersion(
		PublicContentAdminArticleRecord article,
		long version
	) {
		if (version < 1 || article.version() != version) {
			throw conflict("다른 관리자가 먼저 글을 수정했습니다. 최신 내용을 다시 불러와 주세요.");
		}
	}

	private long requireVersion(Long version) {
		if (version == null || version < 1) {
			throw new IllegalArgumentException("수정할 글의 version을 입력해 주세요.");
		}
		return version;
	}

	private PublicContentAdminArticleRecord requireArticle(String articleId) {
		if (articleId == null || articleId.isBlank()) {
			throw new IllegalArgumentException("공개 콘텐츠 articleId를 입력해 주세요.");
		}
		return repository.findForAdmin(articleId).orElseThrow(() ->
			new PublicContentServiceException(
				404,
				"PUBLIC_CONTENT_ADMIN_NOT_FOUND",
				"관리 대상 공개 콘텐츠 글을 찾을 수 없습니다."
			)
		);
	}

	private PublicContentAdminArticleResponse response(
		PublicContentAdminArticleRecord article
	) {
		return new PublicContentAdminArticleResponse(toDto(article));
	}

	private PublicContentAdminArticleDto toDto(PublicContentAdminArticleRecord article) {
		return new PublicContentAdminArticleDto(
			article.id(),
			article.channel(),
			article.serviceKey(),
			article.category(),
			article.slug(),
			article.title(),
			article.description(),
			article.summary(),
			article.canonicalUrl(),
			article.publishedAt(),
			article.updatedAt(),
			article.readingMinutes(),
			article.bodyFormat(),
			article.bodyMarkdown(),
			article.ctaLabel(),
			article.ctaHref(),
			article.status(),
			article.visibility(),
			article.noindex(),
			article.metaTitle(),
			article.metaDescription(),
			article.ogImageUrl(),
			article.authorKey(),
			article.sourceRepo(),
			article.sourcePaths(),
			article.redirectTo(),
			article.version(),
			article.publishedRevisionId()
		);
	}

	private <T> T executeStore(Supplier<T> operation) {
		try {
			return operation.get();
		} catch (PublicContentStoreConflictException error) {
			throw conflict(error.getMessage());
		} catch (PublicContentStoreUnavailableException error) {
			throw new PublicContentServiceException(
				503,
				"PUBLIC_CONTENT_STORE_UNAVAILABLE",
				error.getMessage()
			);
		}
	}

	private PublicContentServiceException conflict(String message) {
		return new PublicContentServiceException(409, "PUBLIC_CONTENT_CONFLICT", message);
	}

	private void requireAdmin(UUID userId) {
		if (userId == null) {
			throw adminRequired();
		}
		var user = userRepository.findById(userId);
		if (user == null) {
			throw adminRequired();
		}
		if (ADMIN_ROLE.equals(user.role()) || adminSeedEmails.contains(normalizeEmail(user.email()))) {
			return;
		}
		throw adminRequired();
	}

	private PublicContentServiceException adminRequired() {
		return new PublicContentServiceException(
			403,
			"ADMIN_REQUIRED",
			"관리자 권한이 필요합니다."
		);
	}

	private static Set<String> parseAdminSeedEmails(String value) {
		if (value == null || value.isBlank()) {
			return Set.of();
		}
		return Arrays.stream(value.split(","))
			.map(email -> email.trim().toLowerCase(Locale.ROOT))
			.filter(email -> !email.isBlank())
			.collect(Collectors.toUnmodifiableSet());
	}

	private String normalizeEmail(String raw) {
		if (raw == null) return null;
		String trimmed = raw.trim().toLowerCase(Locale.ROOT);
		return trimmed.isBlank() ? null : trimmed;
	}
}
