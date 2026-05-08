package world.yeon.backend.space_templates.read.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import world.yeon.backend.space_templates.read.model.SpaceTemplateEntity;

@SpringBootTest
@ActiveProfiles("jdbc")
@Testcontainers
class SpaceTemplateReadRepositoryTests {

	private static final UUID OWNER_ID =
		UUID.fromString("00000000-0000-0000-0000-000000000001");
	private static final UUID OTHER_USER_ID =
		UUID.fromString("00000000-0000-0000-0000-000000000002");

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired
	private SpaceTemplateReadRepository repository;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@DynamicPropertySource
	static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add("BACKEND_JDBC_DATABASE_URL", postgres::getJdbcUrl);
		registry.add("BACKEND_JDBC_DATABASE_USERNAME", postgres::getUsername);
		registry.add("BACKEND_JDBC_DATABASE_PASSWORD", postgres::getPassword);
	}

	@BeforeEach
	void setUpFixture() {
		jdbcTemplate.update("delete from yeon_backend.space_templates");
		jdbcTemplate.update("delete from yeon_backend.users");

		insertUser(OWNER_ID, "owner@example.com");
		insertUser(OTHER_USER_ID, "other@example.com");

		insertTemplate("tmpl-user-owned", OWNER_ID, false, "나의 템플릿");
		insertTemplate("tmpl-other-owned", OTHER_USER_ID, false, "다른 사람 템플릿");
		insertTemplate("tmpl-system", null, true, "시스템 템플릿");
	}

	@Test
	void 목록조회는현재동작과같이사용자정의템플릿만반환한다() {
		List<SpaceTemplateEntity> templates =
			repository.findByIsSystemFalseAndCreatedByUserIdOrderByCreatedAtAsc(OWNER_ID);

		assertThat(templates).extracting(SpaceTemplateEntity::getPublicId)
			.containsExactly("tmpl-user-owned");
	}

	@Test
	void 상세조회는본인템플릿과시스템템플릿만접근할수있다() {
		assertThat(repository.findAccessibleTemplate("tmpl-user-owned", OWNER_ID))
			.isPresent();
		assertThat(repository.findAccessibleTemplate("tmpl-system", OWNER_ID))
			.isPresent();
		assertThat(repository.findAccessibleTemplate("tmpl-other-owned", OWNER_ID))
			.isEmpty();
	}

	private void insertTemplate(
		String publicId,
		UUID createdByUserId,
		boolean isSystem,
		String name
	) {
		jdbcTemplate.update(
			"""
				insert into yeon_backend.space_templates (
				  public_id, created_by_user_id, name, description, is_system, tabs_config, created_at, updated_at
				) values (?, ?, ?, ?, ?, cast(? as jsonb), now(), now())
				""",
			publicId,
			createdByUserId,
			name,
			null,
			isSystem,
			"[{\"name\":\"개요\",\"tabType\":\"system\",\"systemKey\":\"overview\",\"displayOrder\":0,\"fields\":[]}]"
		);
	}

	private void insertUser(UUID userId, String email) {
		jdbcTemplate.update(
			"""
				insert into yeon_backend.users (
				  id, email, role, card_study_mode, last_login_at, created_at, updated_at
				) values (?, ?, 'user', 'flashcard', now(), now(), now())
				""",
			userId,
			email
		);
	}
}
