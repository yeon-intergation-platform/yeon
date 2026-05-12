package world.yeon.backend.sheet_integrations.repository;

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
class SheetIntegrationRepositoryTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000903");
	private static final String COLUMN_MAPPING_JSON = """
		{"nameColumn":0}
		""".strip();

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired private SheetIntegrationRepository repository;
	@Autowired private JdbcTemplate jdbcTemplate;

	@DynamicPropertySource
	static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add("DATABASE_URL", () -> "postgresql://" + postgres.getUsername() + ":" + postgres.getPassword() + "@" + postgres.getHost() + ":" + postgres.getFirstMappedPort() + "/" + postgres.getDatabaseName());
	}

	@BeforeEach
	void setUpFixture() {
		jdbcTemplate.execute("create table if not exists public.users (id uuid primary key, email varchar(320) not null unique, display_name varchar(80), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), role varchar(32) not null default 'user')");
		jdbcTemplate.execute("create table if not exists public.spaces (id bigint primary key generated always as identity, public_id text not null unique, name varchar(100) not null, description text, created_by_user_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.members (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, name varchar(100) not null, email varchar(255), phone varchar(20), status varchar(20) not null default 'active', initial_risk_level varchar(10), created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.sheet_integrations (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, sheet_url text not null, sheet_id varchar(200) not null, data_type varchar(30) not null, column_mapping jsonb, last_synced_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.activity_logs (id bigint primary key generated always as identity, public_id text not null unique, member_id bigint not null references public.members(id) on delete cascade, space_id bigint not null references public.spaces(id) on delete cascade, type varchar(30) not null, status varchar(30), recorded_at timestamptz not null, source varchar(30) not null default 'manual', metadata jsonb, created_at timestamptz not null default now())");
		jdbcTemplate.update("delete from public.activity_logs");
		jdbcTemplate.update("delete from public.sheet_integrations");
		jdbcTemplate.update("delete from public.members");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");
		jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", OWNER_ID, "integration@example.com", "Owner");
		jdbcTemplate.update("insert into public.spaces (public_id,name,description,created_by_user_id,created_at,updated_at) values ('space_alpha','알파',null,?,now(),now())", OWNER_ID);
		jdbcTemplate.update("insert into public.members (public_id,space_id,name,created_at,updated_at) values ('mem_1',(select id from public.spaces where public_id='space_alpha'),'홍길동',now(),now())");
	}

	@Test
	void integration조회생성activityLog삽입을처리한다() {
		Long spaceId = repository.findSpaceInternalId("space_alpha");
		assertThat(spaceId).isNotNull();
		var created = repository.insertIntegration(spaceId, "sht_1", "https://docs.google.com/spreadsheets/d/sheet-1/edit", "sheet-1", "attendance", COLUMN_MAPPING_JSON, OffsetDateTime.parse("2026-05-08T07:00:00Z"));
		assertThat(repository.findIntegrations("space_alpha")).hasSize(1);
		assertThat(repository.findIntegration("space_alpha", "sht_1").sheetId()).isEqualTo("sheet-1");
		Long memberId = repository.findMemberInternalIdByName(spaceId, "홍길동");
		assertThat(memberId).isNotNull();
		repository.insertActivityLog("log_1", memberId, spaceId, "attendance", "출석", OffsetDateTime.parse("2026-05-08T00:00:00Z"), "google_sheet");
		assertThat(repository.existsActivityLog(memberId, OffsetDateTime.parse("2026-05-08T00:00:00Z"), "attendance")).isTrue();
		repository.updateLastSyncedAt(created.integrationInternalId(), OffsetDateTime.parse("2026-05-08T08:00:00Z"));
		assertThat(repository.findIntegration("space_alpha", "sht_1").lastSyncedAt()).isEqualTo(OffsetDateTime.parse("2026-05-08T08:00:00Z"));
	}
}
