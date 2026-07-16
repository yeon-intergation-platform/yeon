package world.yeon.backend.public_content.service;

import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleDetailDto;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleListResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentRedirectResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleSummaryDto;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentSitemapEntryDto;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentSitemapResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentSnapshotResponse;
import world.yeon.backend.public_content.repository.PublicContentArticleRecord;
import world.yeon.backend.public_content.repository.PublicContentArticleStore;

@Service
public class PublicContentService {
	private static final Comparator<PublicContentArticleRecord> ARTICLE_ORDER =
		Comparator.comparing(PublicContentArticleRecord::publishedAt)
			.reversed()
			.thenComparing(PublicContentArticleRecord::slug);

	private final PublicContentArticleStore repository;

	public PublicContentService(PublicContentArticleStore repository) {
		this.repository = repository;
	}

	public PublicContentArticleListResponse listArticles(
		String channel,
		String serviceKey,
		String category
	) {
		validateListFilters(channel, serviceKey, category);

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
		requireChannel(channel);
		PublicContentPolicy.requireSlug(slug);

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

	public PublicContentSnapshotResponse getSnapshot(
		String channel,
		String serviceKey,
		String category
	) {
		validateListFilters(channel, serviceKey, category);
		return new PublicContentSnapshotResponse(
			repository.findAll().stream()
				.filter(article -> channel == null || article.channel().equals(channel))
				.filter(article -> serviceKey == null || article.serviceKey().equals(serviceKey))
				.filter(article -> category == null || article.category().equals(category))
				.sorted(ARTICLE_ORDER)
				.map(this::toDetail)
				.toList()
		);
	}

	public PublicContentRedirectResponse getArchivedRedirect(String channel, String slug) {
		requireChannel(channel);
		PublicContentPolicy.requireSlug(slug);
		return repository.findArchivedRedirect(channel, slug)
			.map(PublicContentRedirectResponse::new)
			.orElseThrow(() -> new PublicContentServiceException(
				404,
				"PUBLIC_CONTENT_REDIRECT_NOT_FOUND",
				"보관된 공개 콘텐츠의 redirect를 찾을 수 없습니다."
			));
	}

	public PublicContentSitemapResponse getSitemap(String channel) {
		requireChannel(channel);

		var articles = repository.findAll().stream()
			.filter(article -> article.channel().equals(channel))
			.sorted(ARTICLE_ORDER)
			.toList();
		var entries = new java.util.ArrayList<PublicContentSitemapEntryDto>();
		entries.add(channelHomeSitemapEntry(channel, articles));
		entries.addAll(articles.stream().map(this::articleSitemapEntry).toList());
		return new PublicContentSitemapResponse(List.copyOf(entries));
	}

	private PublicContentArticleSummaryDto toSummary(PublicContentArticleRecord article) {
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

	private PublicContentArticleDetailDto toDetail(PublicContentArticleRecord article) {
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
			article.ctaHref(),
			article.metaTitle(),
			article.metaDescription(),
			article.ogImageUrl()
		);
	}

	private PublicContentSitemapEntryDto channelHomeSitemapEntry(
		String channel,
		List<PublicContentArticleRecord> articles
	) {
		var lastModified = articles.stream()
			.map(PublicContentArticleRecord::updatedAt)
			.max(String::compareTo)
			.orElse("2026-06-17T00:00:00.000Z");

		return new PublicContentSitemapEntryDto(
			PublicContentPolicy.channelHost(channel),
			lastModified,
			"weekly",
			0.7
		);
	}

	private PublicContentSitemapEntryDto articleSitemapEntry(
		PublicContentArticleRecord article
	) {
		boolean support = "support".equals(article.channel());
		return new PublicContentSitemapEntryDto(
			article.canonicalUrl(),
			article.updatedAt(),
			support ? "monthly" : "weekly",
			support ? 0.65 : 0.55
		);
	}

	private void requireChannel(String channel) {
		if (channel == null || !PublicContentPolicy.CHANNELS.contains(channel)) {
			throw new IllegalArgumentException("지원하지 않는 공개 콘텐츠 채널입니다.");
		}
	}

	private void validateListFilters(String channel, String serviceKey, String category) {
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
	}
}
