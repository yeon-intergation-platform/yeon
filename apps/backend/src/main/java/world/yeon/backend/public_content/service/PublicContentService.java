package world.yeon.backend.public_content.service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleDetailDto;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleListResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleSummaryDto;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentSitemapEntryDto;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentSitemapResponse;
import world.yeon.backend.public_content.repository.PublicContentSeedRepository;
import world.yeon.backend.public_content.repository.PublicContentSeedRepository.PublicContentSeedArticle;

@Service
public class PublicContentService {
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
	private static final Map<String, String> CHANNEL_HOSTS = Map.of(
		"support",
		"https://support.yeon.world",
		"news",
		"https://news.yeon.world",
		"blog",
		"https://blog.yeon.world"
	);
	private static final Pattern SLUG_PATTERN = Pattern.compile(
		"^[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*$"
	);
	private static final Comparator<PublicContentSeedArticle> ARTICLE_ORDER =
		Comparator.comparing(PublicContentSeedArticle::publishedAt)
			.reversed()
			.thenComparing(PublicContentSeedArticle::slug);

	private final PublicContentSeedRepository repository;

	public PublicContentService(PublicContentSeedRepository repository) {
		this.repository = repository;
	}

	public PublicContentArticleListResponse listArticles(
		String channel,
		String serviceKey,
		String category
	) {
		requireOptionalValue(channel, CHANNELS, "지원하지 않는 공개 콘텐츠 채널입니다.");
		requireOptionalValue(serviceKey, SERVICE_KEYS, "지원하지 않는 공개 콘텐츠 서비스입니다.");
		requireOptionalValue(category, CATEGORIES, "지원하지 않는 공개 콘텐츠 분류입니다.");

		var articles = repository.findAll().stream()
			.filter(article -> channel == null || article.channel().equals(channel))
			.filter(article -> serviceKey == null || article.serviceKey().equals(serviceKey))
			.filter(article -> category == null || article.category().equals(category))
			.sorted(ARTICLE_ORDER)
			.map(this::toSummary)
			.toList();

		return new PublicContentArticleListResponse(articles);
	}

	public PublicContentArticleResponse getArticle(String channel, String slug) {
		requireValue(channel, CHANNELS, "지원하지 않는 공개 콘텐츠 채널입니다.");
		requireSlug(slug);

		return repository.findAll().stream()
			.filter(article -> article.channel().equals(channel) && article.slug().equals(slug))
			.findFirst()
			.map(article -> new PublicContentArticleResponse(toDetail(article)))
			.orElseThrow(() ->
				new PublicContentServiceException(
					404,
					"PUBLIC_CONTENT_NOT_FOUND",
					"공개 콘텐츠 글을 찾을 수 없습니다."
				)
			);
	}

	public PublicContentSitemapResponse getSitemap(String channel) {
		requireValue(channel, CHANNELS, "지원하지 않는 공개 콘텐츠 채널입니다.");

		var articles = repository.findAll().stream()
			.filter(article -> article.channel().equals(channel))
			.sorted(ARTICLE_ORDER)
			.toList();
		var entries = new java.util.ArrayList<PublicContentSitemapEntryDto>();
		entries.add(channelHomeSitemapEntry(channel, articles));
		entries.addAll(articles.stream().map(this::articleSitemapEntry).toList());
		return new PublicContentSitemapResponse(List.copyOf(entries));
	}

	private PublicContentArticleSummaryDto toSummary(PublicContentSeedArticle article) {
		return new PublicContentArticleSummaryDto(
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
			article.readingMinutes()
		);
	}

	private PublicContentArticleDetailDto toDetail(PublicContentSeedArticle article) {
		return new PublicContentArticleDetailDto(
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
			article.ctaHref()
		);
	}

	private PublicContentSitemapEntryDto channelHomeSitemapEntry(
		String channel,
		List<PublicContentSeedArticle> articles
	) {
		var lastModified = articles.stream()
			.map(PublicContentSeedArticle::updatedAt)
			.max(String::compareTo)
			.orElse("2026-06-17T00:00:00.000Z");

		return new PublicContentSitemapEntryDto(
			CHANNEL_HOSTS.get(channel),
			lastModified,
			"weekly",
			0.7
		);
	}

	private PublicContentSitemapEntryDto articleSitemapEntry(
		PublicContentSeedArticle article
	) {
		boolean support = "support".equals(article.channel());
		return new PublicContentSitemapEntryDto(
			article.canonicalUrl(),
			article.updatedAt(),
			support ? "monthly" : "weekly",
			support ? 0.65 : 0.55
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
		requireValue(value, allowedValues, message);
	}

	private void requireValue(String value, Set<String> allowedValues, String message) {
		if (value == null || value.isBlank() || !allowedValues.contains(value)) {
			throw new IllegalArgumentException(message);
		}
	}

	private void requireSlug(String slug) {
		if (slug == null || slug.isBlank() || !SLUG_PATTERN.matcher(slug).matches()) {
			throw new IllegalArgumentException("공개 콘텐츠 slug 형식이 올바르지 않습니다.");
		}
	}
}
