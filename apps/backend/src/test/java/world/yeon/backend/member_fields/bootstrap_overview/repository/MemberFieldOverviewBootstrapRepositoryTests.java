package world.yeon.backend.member_fields.bootstrap_overview.repository;

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

import world.yeon.backend.member_fields.bootstrap_overview.support.DefaultOverviewFields;

@SpringBootTest
@ActiveProfiles("dev.local")
@Testcontainers
class MemberFieldOverviewBootstrapRepositoryTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000781");

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired
	private MemberFieldOverviewBootstrapRepository repository;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@DynamicPropertySource
	static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add("DATABASE_URL", () -> "postgresql://" + postgres.getUsername() + ":" + postgres.getPassword() + "@" + postgres.getHost() + ":" + postgres.getFirstMappedPort() + "/" + postgres.getDatabaseName());
	}

	@BeforeEach
	void setUpFixture() {
		createFixtureTables();
		jdbcTemplate.update("delete from public.member_field_definitions");
		jdbcTemplate.update("delete from public.member_tab_definitions");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");

		insertUser(OWNER_ID, "member-fields-bootstrap-owner@example.com");
		insertSpace("space_alpha", "알파");
		insertSpace("space_beta", "베타");
		insertSystemTab("mtb_overview_alpha", "space_alpha", "overview", "개요");
		insertCustomTab("mtb_custom_alpha", "space_alpha", "커스텀");
		insertSystemTab("mtb_overview_beta", "space_beta", "overview", "베타 개요");
	}

	@Test
	void overview기본필드를삽입한다() {
		Long spaceId = repository.findSpaceInternalId("space_alpha");
		var tab = repository.findTabLookup("mtb_overview_alpha");

		repository.lockTabRow(tab.tabInternalId());
		var before = repository.findExistingSourceKeys(spaceId, tab.tabInternalId());
		assertThat(before).isEmpty();
		for (var field : DefaultOverviewFields.DEFAULTS) {
			repository.insertOverviewField(spaceId, tab.tabInternalId(), OWNER_ID, field);
		}

		List<String> inserted = repository.findExistingSourceKeys(spaceId, tab.tabInternalId());
		assertThat(inserted).containsExactly(
			"member_name",
			"member_email",
			"member_phone",
			"member_status",
			"member_created_at",
			"member_counseling_count",
			"member_memo_count",
			"member_ai_risk_signals"
		);
	}

	private void createFixtureTables() {
		jdbcTemplate.execute("""
			create table if not exists public.users (
			  id uuid primary key,
			  email varchar(320) not null unique,
			  display_name varchar(80),
			  created_at timestamptz not null default now(),
			  updated_at timestamptz not null default now(),
			  role varchar(32) not null default 'user'
			)
		""");
		jdbcTemplate.execute("""
			create table if not exists public.spaces (
			  id bigint primary key generated always as identity,
			  public_id text not null unique,
			  name varchar(100) not null,
			  description text,
			  created_by_user_id uuid,
			  created_at timestamptz not null default now(),
			  updated_at timestamptz not null default now()
			)
		""");
		jdbcTemplate.execute("""
			create table if not exists public.member_tab_definitions (
			  id bigint primary key generated always as identity,
			  public_id text not null unique,
			  space_id bigint not null references public.spaces(id) on delete cascade,
			  created_by_user_id uuid references public.users(id) on delete set null,
			  tab_type varchar(20) not null,
			  system_key varchar(30),
			  name varchar(80) not null,
			  is_visible boolean not null default true,
			  display_order integer not null default 0,
			  created_at timestamptz not null default now(),
			  updated_at timestamptz not null default now()
			)
		""");
		jdbcTemplate.execute("""
			create table if not exists public.member_field_definitions (
			  id bigint primary key generated always as identity,
			  public_id text not null unique,
			  space_id bigint not null references public.spaces(id) on delete cascade,
			  created_by_user_id uuid references public.users(id) on delete set null,
			  tab_id bigint not null references public.member_tab_definitions(id) on delete cascade,
			  name varchar(80) not null,
			  source_key varchar(50),
			  field_type varchar(30) not null,
			  options jsonb,
			  is_required boolean not null default false,
			  display_order integer not null default 0,
			  deleted_at timestamptz,
			  created_at timestamptz not null default now(),
			  updated_at timestamptz not null default now()
			)
		""");
	}

	private void insertUser(UUID userId, String email) {
		jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", userId, email, "Owner");
	}
	private void insertSpace(String publicId, String name) {
		jdbcTemplate.update("insert into public.spaces (public_id,name,description,created_by_user_id,created_at,updated_at) values (?, ?, null, ?, now(), now())", publicId, name, OWNER_ID);
	}
	private void insertSystemTab(String publicId, String spacePublicId, String systemKey, String name) {
		jdbcTemplate.update("insert into public.member_tab_definitions (public_id,space_id,created_by_user_id,tab_type,system_key,name,is_visible,display_order,created_at,updated_at) select ?, id, ?, 'system', ?, ?, true, 0, now(), now() from public.spaces where public_id = ?", publicId, OWNER_ID, systemKey, name, spacePublicId);
	}
	private void insertCustomTab(String publicId, String spacePublicId, String name) {
		jdbcTemplate.update("insert into public.member_tab_definitions (public_id,space_id,created_by_user_id,tab_type,system_key,name,is_visible,display_order,created_at,updated_at) select ?, id, ?, 'custom', null, ?, true, 1, now(), now() from public.spaces where public_id = ?", publicId, OWNER_ID, name, spacePublicId);
	}
}
