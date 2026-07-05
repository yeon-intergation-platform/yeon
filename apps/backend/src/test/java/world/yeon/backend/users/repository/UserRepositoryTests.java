package world.yeon.backend.users.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
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

@SpringBootTest
@ActiveProfiles("dev.local")
@Testcontainers
class UserRepositoryTests {
	@Container static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17").withDatabaseName("yeon_backend_test").withUsername("yeon_test").withPassword("yeon_test");
	@Autowired private UserRepository repository;
	@Autowired private JdbcTemplate jdbcTemplate;

	@DynamicPropertySource static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add("DATABASE_URL", () -> "postgresql://" + postgres.getUsername() + ":" + postgres.getPassword() + "@" + postgres.getHost() + ":" + postgres.getFirstMappedPort() + "/" + postgres.getDatabaseName());
	}

	@BeforeEach void setUpFixture() {
		jdbcTemplate.execute("create table if not exists public.users (id uuid primary key, email varchar(320) not null unique, display_name varchar(80), role varchar(32) not null default 'user', last_login_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), email_verified_at timestamptz)");
		jdbcTemplate.execute("create table if not exists public.auth_sessions (id uuid primary key, user_id uuid, session_token_hash varchar(64), expires_at timestamptz, created_at timestamptz default now(), last_accessed_at timestamptz default now())");
		jdbcTemplate.execute("create table if not exists public.user_identities (id uuid primary key, user_id uuid, provider varchar(32), provider_user_id varchar(255), email varchar(320), display_name varchar(80), avatar_url varchar(2048))");
		jdbcTemplate.execute("create table if not exists public.card_decks (id bigserial primary key, public_id text, owner_user_id uuid, title varchar(120))");
		jdbcTemplate.execute("create table if not exists public.typing_decks (id bigserial primary key, public_id text, owner_user_id uuid, title varchar(120))");
		jdbcTemplate.update("delete from public.auth_sessions");
		jdbcTemplate.update("delete from public.user_identities");
		jdbcTemplate.update("delete from public.card_decks");
		jdbcTemplate.update("delete from public.typing_decks");
		jdbcTemplate.update("delete from public.users");
		jdbcTemplate.update("insert into public.users (id,email,display_name,role,last_login_at,created_at,updated_at) values (?,?,?,'admin',now() - interval '2 hours',now() - interval '1 day',now() - interval '1 day')", UUID.fromString("550e8400-e29b-41d4-a716-446655440000"), "alpha@yeon.world", "알파");
		jdbcTemplate.update("insert into public.auth_sessions (id,user_id,session_token_hash,expires_at) values (?,?,?,now() + interval '1 day')", UUID.fromString("550e8400-e29b-41d4-a716-446655440010"), UUID.fromString("550e8400-e29b-41d4-a716-446655440000"), "hash");
		jdbcTemplate.update("insert into public.user_identities (id,user_id,provider,provider_user_id,email) values (?,?,?,?,?)", UUID.fromString("550e8400-e29b-41d4-a716-446655440011"), UUID.fromString("550e8400-e29b-41d4-a716-446655440000"), "google", "google-1", "alpha@yeon.world");
		jdbcTemplate.update("insert into public.card_decks (public_id,owner_user_id,title) values (?,?,?)", "dck_admin", UUID.fromString("550e8400-e29b-41d4-a716-446655440000"), "관리자 덱");
		jdbcTemplate.update("insert into public.typing_decks (public_id,owner_user_id,title,language_tag,visibility,source) values (?,?,?,?,?,?)", "tdk_admin", UUID.fromString("550e8400-e29b-41d4-a716-446655440000"), "관리자 타자 덱", "ko", "private", "user");
	}

	@Test void 목록과생성을처리한다() {
		assertThat(repository.listUsers()).hasSize(1);
		var admin = repository.findById(UUID.fromString("550e8400-e29b-41d4-a716-446655440000"));
		assertThat(admin.role()).isEqualTo("admin");
		assertThat(admin.sessionCount()).isEqualTo(1);
		assertThat(admin.identityProviders()).containsExactly("google");
		assertThat(admin.cardDeckCount()).isEqualTo(1);
		assertThat(admin.typingDeckCount()).isEqualTo(1);
		assertThat(repository.findByEmail("alpha@yeon.world").displayName()).isEqualTo("알파");
		var created = repository.insertUser("550e8400-e29b-41d4-a716-446655440001", "beta@yeon.world", null, OffsetDateTime.parse("2026-05-08T07:00:00Z"));
		assertThat(created.email()).isEqualTo("beta@yeon.world");
		assertThat(created.role()).isEqualTo("user");
		assertThat(repository.listUsers()).hasSize(2);
	}

	@Test void 역할수정과세션삭제와사용자삭제를처리한다() {
		UUID userId = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");

		assertThat(repository.updateRole(userId, "user", OffsetDateTime.parse("2026-05-08T07:00:00Z")).role()).isEqualTo("user");
		assertThat(repository.deleteSessionsByUserId(userId)).isEqualTo(1);
		assertThat(repository.findById(userId).sessionCount()).isZero();
		assertThat(repository.deleteUser(userId)).isEqualTo(1);
		assertThat(repository.findById(userId)).isNull();
	}
}
