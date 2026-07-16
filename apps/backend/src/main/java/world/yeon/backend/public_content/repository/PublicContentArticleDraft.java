package world.yeon.backend.public_content.repository;

import java.util.List;

public record PublicContentArticleDraft(
	String channel,
	String serviceKey,
	String category,
	String slug,
	String title,
	String description,
	String summary,
	String canonicalUrl,
	int readingMinutes,
	String bodyFormat,
	String bodyMarkdown,
	String ctaLabel,
	String ctaHref,
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
	public PublicContentArticleDraft {
		sourcePaths = sourcePaths == null ? List.of() : List.copyOf(sourcePaths);
	}
}
