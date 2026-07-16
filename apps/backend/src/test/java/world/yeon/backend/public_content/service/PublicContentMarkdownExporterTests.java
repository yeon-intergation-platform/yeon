package world.yeon.backend.public_content.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipInputStream;
import org.junit.jupiter.api.Test;
import org.yaml.snakeyaml.Yaml;
import world.yeon.backend.public_content.repository.PublicContentAdminArticleRecord;

class PublicContentMarkdownExporterTests {
	private final PublicContentMarkdownExporter exporter =
		new PublicContentMarkdownExporter();

	@Test
	void 단일글은frontmatter와Markdown본문을보존한다() {
		var file = exporter.markdown(article("support", "nexa/guides/example", 7));
		var markdown = new String(file.content(), StandardCharsets.UTF_8);

		assertThat(file.filename())
			.isEqualTo("support-nexa-guides-nexa--guides--example.md");
		assertThat(file.contentType()).isEqualTo("text/markdown; charset=utf-8");
		assertThat(markdown)
			.contains("schema_version: \"1\"")
			.contains("content_version: \"7\"")
			.contains("source_path:\n  - \"docs/example.md\"")
			.endsWith("## 확인 순서\n\n본문입니다.\n");
	}

	@Test
	void 전체내보내기는채널과slug순서로zipEntry를만든다() throws Exception {
		var file = exporter.zip(
			List.of(
				article("support", "nexa/guides/z-last", 1),
				article("blog", "engineering/a-first", 2)
			),
			null
		);
		var entryNames = new ArrayList<String>();
		try (var zip = new ZipInputStream(new ByteArrayInputStream(file.content()))) {
			for (var entry = zip.getNextEntry(); entry != null; entry = zip.getNextEntry()) {
				entryNames.add(entry.getName());
			}
		}

		assertThat(file.filename()).isEqualTo("yeon-public-content-all.zip");
		assertThat(file.contentType()).isEqualTo("application/zip");
		assertThat(entryNames).containsExactly(
			"blog-nexa-guides-engineering--a-first.md",
			"support-nexa-guides-nexa--guides--z-last.md"
		);
	}

	@Test
	void 계층slug를평탄화해도zipEntry가충돌하지않는다() throws Exception {
		var file = exporter.zip(
			List.of(
				article("support", "a/b-c", 1),
				article("support", "a-b/c", 2)
			),
			"support"
		);
		var entryNames = new ArrayList<String>();
		try (var zip = new ZipInputStream(new ByteArrayInputStream(file.content()))) {
			for (var entry = zip.getNextEntry(); entry != null; entry = zip.getNextEntry()) {
				entryNames.add(entry.getName());
			}
		}

		assertThat(entryNames).containsExactly(
			"support-nexa-guides-a-b--c.md",
			"support-nexa-guides-a--b-c.md"
		);
	}

	@Test
	void 출처경로가없으면표준Yaml빈배열로내보낸다() {
		var article = article("blog", "engineering/without-source", 3);
		article = new PublicContentAdminArticleRecord(
			article.id(), article.channel(), article.serviceKey(), article.category(),
			article.slug(), article.title(), article.description(), article.summary(),
			article.canonicalUrl(), article.publishedAt(), article.updatedAt(),
			article.readingMinutes(), article.bodyFormat(), article.bodyMarkdown(),
			article.ctaLabel(), article.ctaHref(), article.status(), article.visibility(),
			article.noindex(), article.metaTitle(), article.metaDescription(),
			article.ogImageUrl(), article.authorKey(), article.sourceRepo(), List.of(),
			article.redirectTo(), article.version(), article.publishedRevisionId()
		);

		var markdown = exporter.toMarkdown(article);
		assertThat(markdown).contains("source_path: []\n");
		String frontmatter = markdown.substring(4, markdown.indexOf("\n---\n", 4));
		Map<String, Object> parsed = new Yaml().load(frontmatter);
		assertThat(parsed.get("source_path")).isEqualTo(List.of());
	}

	@Test
	void 인용부호역슬래시줄바꿈을표준Yaml값으로왕복보존한다() {
		var base = article("blog", "engineering/escaped", 4);
		var title = "인용 \"제목\"과\n줄바꿈";
		var description = "Windows 경로 C:\\docs\\content";
		var sourcePath = "docs/path\\with\\backslash.md";
		var escaped = new PublicContentAdminArticleRecord(
			base.id(), base.channel(), base.serviceKey(), base.category(), base.slug(),
			title, description, base.summary(), base.canonicalUrl(), base.publishedAt(),
			base.updatedAt(), base.readingMinutes(), base.bodyFormat(), base.bodyMarkdown(),
			base.ctaLabel(), base.ctaHref(), base.status(), base.visibility(), base.noindex(),
			base.metaTitle(), base.metaDescription(), base.ogImageUrl(), base.authorKey(),
			base.sourceRepo(), List.of(sourcePath), base.redirectTo(), base.version(),
			base.publishedRevisionId()
		);

		var markdown = exporter.toMarkdown(escaped);
		String frontmatter = markdown.substring(4, markdown.indexOf("\n---\n", 4));
		Map<String, Object> parsed = new Yaml().load(frontmatter);

		assertThat(parsed.get("title")).isEqualTo(title);
		assertThat(parsed.get("description")).isEqualTo(description);
		assertThat(parsed.get("source_path")).isEqualTo(List.of(sourcePath));
	}

	private PublicContentAdminArticleRecord article(
		String channel,
		String slug,
		long version
	) {
		return new PublicContentAdminArticleRecord(
			"article-" + version,
			channel,
			"nexa",
			"guides",
			slug,
			"예시 제목",
			"예시 설명",
			"예시 요약",
			"https://" + channel + ".yeon.world/" + slug,
			"2026-07-16T00:00:00Z",
			"2026-07-16T00:00:00Z",
			2,
			"markdown",
			"## 확인 순서\n\n본문입니다.",
			null,
			null,
			"published",
			"public",
			false,
			null,
			"예시 검색 설명",
			null,
			"yeon",
			"yeon",
			List.of("docs/example.md"),
			null,
			version,
			"revision-1"
		);
	}
}
