package world.yeon.backend.public_content.repository;

import java.util.List;

public record PublicContentArticleRecord(
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
	String metaDescription,
	List<String> sourcePaths
) {
	public PublicContentArticleRecord {
		sourcePaths = sourcePaths == null ? List.of() : List.copyOf(sourcePaths);
	}
}
