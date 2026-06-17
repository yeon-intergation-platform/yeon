package world.yeon.backend.public_content.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

@ExtendWith(MockitoExtension.class)
class PublicContentJdbcRepositoryTests {
	@Mock private JdbcTemplate jdbc;

	@Test
	void findAll은publishedPublicIndexable글만읽는다() {
		var article = new PublicContentArticleRecord(
			"support",
			"nexa",
			"guides",
			"nexa/guides/add-nexa-discord-bot",
			"디스코드 서버에 NEXA AI 봇 추가하는 방법",
			"설명입니다.",
			"요약입니다.",
			"https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
			"2026-06-17T00:00:00Z",
			"2026-06-17T00:00:00Z",
			4,
			"markdown",
			"본문입니다.",
			null,
			null
		);
		when(jdbc.query(anyString(), any(RowMapper.class))).thenReturn(List.of(article));

		var repository = new PublicContentJdbcRepository(jdbc);
		var articles = repository.findAll();

		assertThat(articles).containsExactly(article);
		var sqlCaptor = ArgumentCaptor.forClass(String.class);
		verify(jdbc).query(sqlCaptor.capture(), any(RowMapper.class));
		assertThat(sqlCaptor.getValue())
			.contains("status = 'published'")
			.contains("visibility = 'public'")
			.contains("noindex = false")
			.contains("published_at is not null");
	}
}
