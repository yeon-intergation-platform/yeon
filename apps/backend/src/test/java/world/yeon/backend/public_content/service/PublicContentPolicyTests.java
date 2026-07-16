package world.yeon.backend.public_content.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleWriteRequest;

class PublicContentPolicyTests {
	@Test
	void 관리자입력에서canonical과읽기시간을서버가파생한다() {
		var draft = PublicContentPolicy.toDraft(request("## 시작\n\n본문입니다."));

		assertThat(draft.canonicalUrl())
			.isEqualTo("https://blog.yeon.world/engineering/markdown-cms-test");
		assertThat(draft.readingMinutes()).isEqualTo(1);
		assertThat(draft.bodyFormat()).isEqualTo("markdown");
	}

	@Test
	void rawHtml과본문H1은저장전에거부한다() {
		assertThatThrownBy(() -> PublicContentPolicy.toDraft(request("<script>alert(1)</script>")))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("raw HTML");
		assertThatThrownBy(() -> PublicContentPolicy.toDraft(request("# 본문 제목")))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("H1");
		assertThatThrownBy(() -> PublicContentPolicy.toDraft(request("   # 들여쓴 제목")))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("H1");
		assertThatThrownBy(() -> PublicContentPolicy.toDraft(request("본문 제목\n===")))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("H1");
		assertThatThrownBy(() -> PublicContentPolicy.toDraft(request("> # 인용문 제목")))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("H1");
		assertThatThrownBy(() -> PublicContentPolicy.toDraft(request("- 항목\n    # 중첩 목록 제목")))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("H1");
		assertThatThrownBy(() -> PublicContentPolicy.toDraft(request("1. 항목\n   > # 중첩 인용 제목")))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("H1");
	}

	@Test
	void 코드블록안의H1문법은본문으로허용한다() {
		assertThat(PublicContentPolicy.toDraft(request("```md\n# 코드 예시\n```")))
			.extracting("bodyMarkdown")
			.isEqualTo("```md\n# 코드 예시\n```");
		assertThat(PublicContentPolicy.toDraft(request("코드:\n\n    # 들여쓰기 코드 예시")))
			.extracting("bodyMarkdown")
			.isEqualTo("코드:\n\n    # 들여쓰기 코드 예시");
	}

	@Test
	void 채널에맞지않는분류와한쪽만있는CTA는거부한다() {
		var baseCategoryRequest = request("본문");
		var invalidCategory = new PublicContentAdminArticleWriteRequest(
			"support",
			baseCategoryRequest.serviceKey(),
			"engineering",
			baseCategoryRequest.slug(),
			baseCategoryRequest.title(),
			baseCategoryRequest.description(),
			baseCategoryRequest.summary(),
			baseCategoryRequest.bodyFormat(),
			baseCategoryRequest.bodyMarkdown(),
			baseCategoryRequest.ctaLabel(),
			baseCategoryRequest.ctaHref(),
			baseCategoryRequest.visibility(),
			baseCategoryRequest.noindex(),
			baseCategoryRequest.metaTitle(),
			baseCategoryRequest.metaDescription(),
			baseCategoryRequest.ogImageUrl(),
			baseCategoryRequest.authorKey(),
			baseCategoryRequest.sourceRepo(),
			baseCategoryRequest.sourcePaths(),
			baseCategoryRequest.redirectTo(),
			baseCategoryRequest.version()
		);
		assertThatThrownBy(() -> PublicContentPolicy.toDraft(invalidCategory))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("분류");

		var baseCtaRequest = request("본문");
		var ctaWithoutHref = new PublicContentAdminArticleWriteRequest(
			baseCtaRequest.channel(),
			baseCtaRequest.serviceKey(),
			baseCtaRequest.category(),
			baseCtaRequest.slug(),
			baseCtaRequest.title(),
			baseCtaRequest.description(),
			baseCtaRequest.summary(),
			baseCtaRequest.bodyFormat(),
			baseCtaRequest.bodyMarkdown(),
			"다음 단계",
			null,
			baseCtaRequest.visibility(),
			baseCtaRequest.noindex(),
			baseCtaRequest.metaTitle(),
			baseCtaRequest.metaDescription(),
			baseCtaRequest.ogImageUrl(),
			baseCtaRequest.authorKey(),
			baseCtaRequest.sourceRepo(),
			baseCtaRequest.sourcePaths(),
			baseCtaRequest.redirectTo(),
			baseCtaRequest.version()
		);
		assertThatThrownBy(() -> PublicContentPolicy.toDraft(ctaWithoutHref))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("함께 입력");
	}

	private PublicContentAdminArticleWriteRequest request(String markdown) {
		return new PublicContentAdminArticleWriteRequest(
			"blog",
			"yeon",
			"engineering",
			"engineering/markdown-cms-test",
			"Markdown CMS 테스트",
			"관리자 Markdown CMS 검증 설명입니다.",
			"관리자 입력 검증을 확인합니다.",
			"markdown",
			markdown,
			null,
			null,
			"public",
			false,
			null,
			"검색 설명입니다.",
			null,
			"yeon",
			"yeon",
			List.of("docs/example.md"),
			null,
			null
		);
	}
}
