package world.yeon.backend.public_content.repository;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

public record PublicContentAdminArticleRecord(
	String id,
	String channel,
	String serviceKey,
	String category,
	String slug,
	String title,
	String description,
	String summary,
	String canonicalUrl,
	String publishedAt,
	String updatedAt,
	int readingMinutes,
	String bodyFormat,
	String bodyMarkdown,
	String ctaLabel,
	String ctaHref,
	String status,
	String visibility,
	boolean noindex,
	String metaTitle,
	String metaDescription,
	String ogImageUrl,
	String authorKey,
	String sourceRepo,
	List<String> sourcePaths,
	String redirectTo
) {
	private static final String SEED_SOURCE_PATH =
		"apps/backend/src/main/resources/public-content/articles.json";

	public PublicContentAdminArticleRecord {
		sourcePaths = sourcePaths == null ? List.of() : List.copyOf(sourcePaths);
	}

	public static PublicContentAdminArticleRecord fromPublishedArticle(
		PublicContentArticleRecord article
	) {
		String metaDescription = blankToNull(article.metaDescription()) == null
			? article.description()
			: article.metaDescription();
		List<String> sourcePaths = article.sourcePaths().isEmpty()
			? List.of(SEED_SOURCE_PATH)
			: article.sourcePaths();

		return new PublicContentAdminArticleRecord(
			seedArticleId(article.channel(), article.slug()),
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
			"published",
			"public",
			false,
			null,
			metaDescription,
			null,
			"yeon",
			"yeon",
			sourcePaths,
			null
		);
	}

	private static String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value;
	}

	private static String seedArticleId(String channel, String slug) {
		return "seed-" + UUID.nameUUIDFromBytes(
			(channel + "/" + slug).getBytes(StandardCharsets.UTF_8)
		);
	}
}
