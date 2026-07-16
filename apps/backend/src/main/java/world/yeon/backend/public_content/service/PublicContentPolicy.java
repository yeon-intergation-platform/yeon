package world.yeon.backend.public_content.service;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.commonmark.node.AbstractVisitor;
import org.commonmark.node.Heading;
import org.commonmark.parser.Parser;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleWriteRequest;
import world.yeon.backend.public_content.repository.PublicContentArticleDraft;

final class PublicContentPolicy {
	static final Set<String> CHANNELS = Set.of("support", "news", "blog");
	static final Set<String> SERVICE_KEYS = Set.of(
		"nexa",
		"typing",
		"card",
		"community",
		"account",
		"yeon"
	);
	static final Set<String> CATEGORIES = Set.of(
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
	static final Set<String> STATUSES = Set.of("draft", "review", "published", "archived");
	static final Set<String> VISIBILITIES = Set.of("public", "unlisted", "internal");

	private static final Map<String, Set<String>> CHANNEL_CATEGORIES = Map.of(
		"support", Set.of(
			"getting-started", "guides", "tutorials", "troubleshooting", "faq", "policy"
		),
		"news", Set.of("notice", "updates", "news"),
		"blog", Set.of("engineering", "product", "devlog", "essay")
	);
	private static final Map<String, String> CHANNEL_HOSTS = Map.of(
		"support", "https://support.yeon.world",
		"news", "https://news.yeon.world",
		"blog", "https://blog.yeon.world"
	);
	private static final Pattern SLUG_PATTERN = Pattern.compile(
		"^[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*$"
	);
	private static final Pattern RAW_HTML_PATTERN = Pattern.compile(
		"<\\s*/?\\s*[A-Za-z!][^>]*>",
		Pattern.MULTILINE
	);
	private static final Parser MARKDOWN_PARSER = Parser.builder().build();

	private PublicContentPolicy() {}

	static void requireOptionalValue(
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

	static void requireSlug(String slug) {
		if (slug == null || slug.isBlank() || !SLUG_PATTERN.matcher(slug).matches()) {
			throw new IllegalArgumentException("공개 콘텐츠 slug 형식이 올바르지 않습니다.");
		}
	}

	static String channelHost(String channel) {
		return CHANNEL_HOSTS.get(channel);
	}

	static PublicContentArticleDraft toDraft(PublicContentAdminArticleWriteRequest request) {
		if (request == null) {
			throw new IllegalArgumentException("공개 콘텐츠 글 데이터를 입력해 주세요.");
		}

		String channel = required(request.channel(), 20, "채널");
		String serviceKey = required(request.serviceKey(), 40, "서비스");
		String category = required(request.category(), 40, "분류");
		String slug = required(request.slug(), 240, "slug");
		String title = required(request.title(), 160, "제목");
		String description = required(request.description(), 240, "설명");
		String summary = required(request.summary(), 320, "요약");
		String bodyFormat = required(request.bodyFormat(), 40, "본문 형식");
		String bodyMarkdown = required(request.bodyMarkdown(), 120_000, "Markdown 본문");
		String visibility = required(request.visibility(), 20, "공개 범위");
		String authorKey = required(request.authorKey(), 80, "작성자 key");

		if (!CHANNELS.contains(channel)) {
			throw new IllegalArgumentException("지원하지 않는 공개 콘텐츠 채널입니다.");
		}
		if (!SERVICE_KEYS.contains(serviceKey)) {
			throw new IllegalArgumentException("지원하지 않는 공개 콘텐츠 서비스입니다.");
		}
		if (!CHANNEL_CATEGORIES.get(channel).contains(category)) {
			throw new IllegalArgumentException("선택한 채널에서 사용할 수 없는 분류입니다.");
		}
		requireSlug(slug);
		if (!"markdown".equals(bodyFormat)) {
			throw new IllegalArgumentException("관리자 작성 본문은 Markdown 형식만 지원합니다.");
		}
		if (!VISIBILITIES.contains(visibility)) {
			throw new IllegalArgumentException("지원하지 않는 공개 콘텐츠 공개 범위입니다.");
		}
		if (RAW_HTML_PATTERN.matcher(bodyMarkdown).find()) {
			throw new IllegalArgumentException("Markdown 본문에 raw HTML을 사용할 수 없습니다.");
		}
		if (containsLevelOneHeading(bodyMarkdown)) {
			throw new IllegalArgumentException("본문의 H1은 사용할 수 없습니다. 글 제목 필드를 사용해 주세요.");
		}

		String ctaLabel = optional(request.ctaLabel(), 80, "CTA 문구");
		String ctaHref = optional(request.ctaHref(), 2048, "CTA 주소");
		if ((ctaLabel == null) != (ctaHref == null)) {
			throw new IllegalArgumentException("CTA 문구와 주소는 함께 입력해 주세요.");
		}
		requireWebUrlOrPath(ctaHref, true, "CTA 주소");

		String ogImageUrl = optional(request.ogImageUrl(), 2048, "OG 이미지 주소");
		String redirectTo = optional(request.redirectTo(), 2048, "redirect 주소");
		requireWebUrlOrPath(ogImageUrl, false, "OG 이미지 주소");
		requireWebUrlOrPath(redirectTo, false, "redirect 주소");
		String canonicalUrl = channelHost(channel) + "/" + slug;
		if (canonicalUrl.equals(redirectTo)) {
			throw new IllegalArgumentException("redirect 주소는 현재 글 주소와 달라야 합니다.");
		}

		List<String> sourcePaths = request.sourcePaths() == null
			? List.of()
			: request.sourcePaths().stream()
				.map(path -> required(path, 2048, "출처 경로"))
				.toList();
		if (sourcePaths.size() > 100) {
			throw new IllegalArgumentException("출처 경로는 최대 100개까지 입력할 수 있습니다.");
		}

		return new PublicContentArticleDraft(
			channel,
			serviceKey,
			category,
			slug,
			title,
			description,
			summary,
			canonicalUrl,
			calculateReadingMinutes(bodyMarkdown),
			bodyFormat,
			bodyMarkdown,
			ctaLabel,
			ctaHref,
			visibility,
			request.noindex(),
			optional(request.metaTitle(), 180, "SEO 제목"),
			optional(request.metaDescription(), 260, "SEO 설명"),
			ogImageUrl,
			authorKey,
			optional(request.sourceRepo(), 160, "출처 저장소"),
			sourcePaths,
			redirectTo
		);
	}

	private static boolean containsLevelOneHeading(String markdown) {
		var visitor = new LevelOneHeadingVisitor();
		MARKDOWN_PARSER.parse(markdown).accept(visitor);
		return visitor.found;
	}

	private static final class LevelOneHeadingVisitor extends AbstractVisitor {
		private boolean found;

		@Override
		public void visit(Heading heading) {
			if (heading.getLevel() == 1) {
				found = true;
				return;
			}
			visitChildren(heading);
		}
	}

	private static int calculateReadingMinutes(String markdown) {
		String plainText = markdown
			.replaceAll("```[\\s\\S]*?```", " ")
			.replaceAll("[#>*_`~\\[\\]()-]", " ")
			.trim();
		if (plainText.isEmpty()) {
			return 1;
		}
		int tokenCount = plainText.split("\\s+").length;
		return Math.max(1, (int) Math.ceil(tokenCount / 250.0));
	}

	private static String required(String raw, int maxLength, String fieldName) {
		String value = raw == null ? "" : raw.trim();
		if (value.isEmpty()) {
			throw new IllegalArgumentException(fieldName + "을(를) 입력해 주세요.");
		}
		if (value.length() > maxLength) {
			throw new IllegalArgumentException(fieldName + " 길이가 허용 범위를 넘었습니다.");
		}
		return value;
	}

	private static String optional(String raw, int maxLength, String fieldName) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		return required(raw, maxLength, fieldName);
	}

	private static void requireWebUrlOrPath(
		String value,
		boolean allowRootRelative,
		String fieldName
	) {
		if (value == null) {
			return;
		}
		if (allowRootRelative && value.startsWith("/") && !value.startsWith("//")) {
			return;
		}
		try {
			URI uri = URI.create(value);
			if (("http".equals(uri.getScheme()) || "https".equals(uri.getScheme())) && uri.getHost() != null) {
				return;
			}
		} catch (IllegalArgumentException ignored) {
			// 공통 오류 메시지로 변환한다.
		}
		throw new IllegalArgumentException(fieldName + " 형식이 올바르지 않습니다.");
	}
}
