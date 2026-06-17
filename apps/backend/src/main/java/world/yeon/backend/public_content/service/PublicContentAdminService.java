package world.yeon.backend.public_content.service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleDto;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleListResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleResponse;
import world.yeon.backend.public_content.repository.PublicContentAdminArticleRecord;
import world.yeon.backend.public_content.repository.PublicContentArticleStore;
import world.yeon.backend.users.repository.UserRepository;

@Service
public class PublicContentAdminService {
	private static final String ADMIN_ROLE = "admin";
	private static final Set<String> CHANNELS = Set.of("support", "news", "blog");
	private static final Set<String> SERVICE_KEYS = Set.of(
		"nexa",
		"typing",
		"card",
		"community",
		"account",
		"yeon"
	);
	private static final Set<String> CATEGORIES = Set.of(
		"getting-started",
		"guides",
		"tutorials",
		"troubleshooting",
		"faq",
		"policy",
		"notice",
		"updates",
		"news",
		"engineering",
		"product",
		"devlog",
		"essay"
	);
	private static final Set<String> STATUSES = Set.of(
		"draft",
		"review",
		"published",
		"archived"
	);
	private static final Set<String> VISIBILITIES = Set.of(
		"public",
		"unlisted",
		"internal"
	);
	private static final Comparator<PublicContentAdminArticleRecord> ADMIN_ORDER =
		Comparator.comparing(
				PublicContentAdminArticleRecord::updatedAt,
				Comparator.nullsLast(Comparator.reverseOrder())
			)
			.thenComparing(PublicContentAdminArticleRecord::slug);

	private final PublicContentArticleStore repository;
	private final UserRepository userRepository;
	private final Set<String> adminSeedEmails;

	public PublicContentAdminService(
		PublicContentArticleStore repository,
		UserRepository userRepository,
		@Value("${YEON_ADMIN_EMAILS:${ADMIN_EMAILS:}}") String adminEmails
	) {
		this.repository = repository;
		this.userRepository = userRepository;
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
		requireOptionalValue(channel, CHANNELS, "지원하지 않는 공개 콘텐츠 채널입니다.");
		requireOptionalValue(serviceKey, SERVICE_KEYS, "지원하지 않는 공개 콘텐츠 서비스입니다.");
		requireOptionalValue(category, CATEGORIES, "지원하지 않는 공개 콘텐츠 분류입니다.");
		requireOptionalValue(status, STATUSES, "지원하지 않는 공개 콘텐츠 상태입니다.");
		requireOptionalValue(visibility, VISIBILITIES, "지원하지 않는 공개 콘텐츠 공개 범위입니다.");

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
		if (articleId == null || articleId.isBlank()) {
			throw new IllegalArgumentException("공개 콘텐츠 articleId를 입력해 주세요.");
		}

		return repository.findAllForAdmin().stream()
			.filter(article -> article.id().equals(articleId))
			.findFirst()
			.map(article -> new PublicContentAdminArticleResponse(toDto(article)))
			.orElseThrow(() ->
				new PublicContentServiceException(
					404,
					"PUBLIC_CONTENT_ADMIN_NOT_FOUND",
					"관리 대상 공개 콘텐츠 글을 찾을 수 없습니다."
				)
			);
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
			article.redirectTo()
		);
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

	private void requireOptionalValue(
		String value,
		Set<String> allowedValues,
		String message
	) {
		if (value == null || value.isBlank()) {
			return;
		}
		if (!allowedValues.contains(value)) {
			throw new IllegalArgumentException(message);
		}
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
