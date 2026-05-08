package world.yeon.backend.life_os.repository;

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
@ActiveProfiles("jdbc")
@Testcontainers
class LifeOsRepositoryTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000942");
	@Container static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17").withDatabaseName("yeon_backend_test").withUsername("yeon_test").withPassword("yeon_test");
	@Autowired private LifeOsRepository repository;
	@Autowired private JdbcTemplate jdbcTemplate;

	@DynamicPropertySource static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add("BACKEND_JDBC_DATABASE_URL", postgres::getJdbcUrl);
		registry.add("BACKEND_JDBC_DATABASE_USERNAME", postgres::getUsername);
		registry.add("BACKEND_JDBC_DATABASE_PASSWORD", postgres::getPassword);
	}

	@BeforeEach void setUpFixture() {
		jdbcTemplate.execute("create table if not exists public.users (id uuid primary key, email varchar(320) not null unique, display_name varchar(80), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), role varchar(32) not null default 'user')");
		jdbcTemplate.execute("create table if not exists public.life_os_days (id bigint primary key generated always as identity, public_id text not null unique, owner_user_id uuid not null references public.users(id) on delete cascade, local_date varchar(10) not null, timezone varchar(80) not null default 'Asia/Seoul', mindset text not null default '', backlog_text text not null default '', entries jsonb not null default '[]'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create unique index if not exists life_os_days_owner_local_date_unique on public.life_os_days(owner_user_id, local_date)");
		jdbcTemplate.update("delete from public.life_os_days");
		jdbcTemplate.update("delete from public.users");
		jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", OWNER_ID, "owner@example.com", "Owner");
	}

	@Test void 목록조회업서트를처리한다() {
		var created = repository.upsertDay(OWNER_ID, "lod_1", "2026-05-08", "Asia/Seoul", "mind", "backlog", "[{\"hour\":0,\"goalText\":\"코딩\",\"actionText\":\"코딩\"}]", OffsetDateTime.parse("2026-05-08T07:00:00Z"));
		assertThat(created.localDate()).isEqualTo("2026-05-08");
		assertThat(repository.listDays(OWNER_ID)).hasSize(1);
		assertThat(repository.findDay(OWNER_ID, "2026-05-08").entries()).hasSize(1);
		assertThat(repository.findDaysBetween(OWNER_ID, "2026-05-01", "2026-05-31")).hasSize(1);
	}
}
