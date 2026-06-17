package world.yeon.backend.public_content.dto;

import java.util.List;

public final class PublicContentDtos {
	private PublicContentDtos() {}

	public record PublicContentArticleSummaryDto(
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
		int readingMinutes
	) {}

	public record PublicContentArticleDetailDto(
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
		String ctaHref
	) {}

	public record PublicContentArticleListResponse(
		List<PublicContentArticleSummaryDto> articles
	) {}

	public record PublicContentArticleResponse(
		PublicContentArticleDetailDto article
	) {}

	public record PublicContentAdminArticleDto(
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
	) {}

	public record PublicContentAdminArticleListResponse(
		List<PublicContentAdminArticleDto> articles
	) {}

	public record PublicContentAdminArticleResponse(
		PublicContentAdminArticleDto article
	) {}

	public record PublicContentSitemapEntryDto(
		String url,
		String lastModified,
		String changeFrequency,
		double priority
	) {}

	public record PublicContentSitemapResponse(
		List<PublicContentSitemapEntryDto> entries
	) {}
}
