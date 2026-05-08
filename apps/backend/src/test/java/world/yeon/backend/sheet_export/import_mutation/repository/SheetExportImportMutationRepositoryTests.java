package world.yeon.backend.sheet_export.import_mutation.repository;

import static org.assertj.core.api.Assertions.assertThat;

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
class SheetExportImportMutationRepositoryTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000800");

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired private SheetExportImportMutationRepository repository;
	@Autowired private JdbcTemplate jdbcTemplate;

	@DynamicPropertySource
	static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add("BACKEND_JDBC_DATABASE_URL", postgres::getJdbcUrl);
		registry.add("BACKEND_JDBC_DATABASE_USERNAME", postgres::getUsername);
		registry.add("BACKEND_JDBC_DATABASE_PASSWORD", postgres::getPassword);
	}

	@BeforeEach
	void setUpFixture() {
		createFixtureTables();
		jdbcTemplate.update("delete from public.sheet_integrations");
		jdbcTemplate.update("delete from public.members");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");
		insertUser();
		insertSpace();
		insertMember();
		insertIntegration();
	}

	@Test
	void linkedExportSpace를찾고member를생성수정한다() {
		Long spaceId = repository.findLinkedExportSpaceInternalId("space_alpha", "sheet-1");
		assertThat(spaceId).isNotNull();

		String createdPublicId = repository.createMember(spaceId, "mem_created", "새 학생", null, null, "active", null);
		assertThat(createdPublicId).isEqualTo("mem_created");

		boolean updated = repository.updateMember(spaceId, "mem_existing", "수정 학생", "edited@example.com", null, true, "graduated", "high");
		assertThat(updated).isTrue();
		assertThat(jdbcTemplate.queryForObject("select name from public.members where public_id='mem_existing'", String.class)).isEqualTo("수정 학생");
		assertThat(jdbcTemplate.queryForObject("select status from public.members where public_id='mem_existing'", String.class)).isEqualTo("graduated");
	}

	private void createFixtureTables() {
		jdbcTemplate.execute("create table if not exists public.users (id uuid primary key, email varchar(320) not null unique, display_name varchar(80), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), role varchar(32) not null default 'user')");
		jdbcTemplate.execute("create table if not exists public.spaces (id bigint primary key generated always as identity, public_id text not null unique, name varchar(100) not null, description text, created_by_user_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.members (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, name varchar(100) not null, email varchar(255), phone varchar(20), status varchar(20) not null default 'active', initial_risk_level varchar(10), created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.sheet_integrations (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, provider varchar(50) not null, data_type varchar(50) not null, sheet_id text not null, sheet_url text, access_token text, refresh_token text, token_expires_at timestamptz, last_synced_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
	}

	private void insertUser() {
		jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", OWNER_ID, "import-mutation@example.com", "Owner");
	}

	private void insertSpace() {
		jdbcTemplate.update("insert into public.spaces (public_id,name,description,created_by_user_id,created_at,updated_at) values ('space_alpha','알파',null,?,now(),now())", OWNER_ID);
	}

	private void insertMember() {
		jdbcTemplate.update("insert into public.members (public_id,space_id,name,email,phone,status,initial_risk_level,created_at,updated_at) select 'mem_existing', id, '기존 학생', null, null, 'active', null, now(), now() from public.spaces where public_id='space_alpha'");
	}

	private void insertIntegration() {
		jdbcTemplate.update("insert into public.sheet_integrations (public_id,space_id,provider,data_type,sheet_id,sheet_url,created_at,updated_at) select 'sgi_export', id, 'google', 'export', 'sheet-1', 'https://docs.google.com/spreadsheets/d/sheet-1', now(), now() from public.spaces where public_id='space_alpha'");
	}
}
