package world.yeon.backend.member_tabs.reorder.repository;

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

@SpringBootTest
@ActiveProfiles("jdbc")
@Testcontainers
class MemberTabReorderRepositoryTests {

	private static final UUID OWNER_ID =
		UUID.fromString("00000000-0000-0000-0000-000000000401");

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired
	private MemberTabReorderRepository repository;

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
		createFixtureTables();
		jdbcTemplate.update("delete from public.member_tab_definitions");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");

		insertUser(OWNER_ID, "member-tabs-reorder-owner@example.com");
		insertSpace("space_alpha", OWNER_ID, "알파 스페이스");
		insertSpace("space_beta", OWNER_ID, "베타 스페이스");
		insertTab("mtb_overview", "space_alpha", OWNER_ID, "system", "overview", "개요", true, 0);
		insertTab("mtb_custom_notes", "space_alpha", OWNER_ID, "custom", null, "메모", true, 1);
		insertTab("mtb_custom_hidden", "space_alpha", OWNER_ID, "custom", null, "숨김", false, 2);
		insertTab("mtb_beta_overview", "space_beta", OWNER_ID, "system", "overview", "베타 개요", true, 0);
	}

	@Test
	void publicSpaceId로내부SpaceId를조회할수있다() {
		Long internalId = repository.findSpaceInternalId("space_alpha");

		assertThat(internalId).isNotNull();
	}

	@Test
	void reorder대상탭들의displayOrder를bulk반영한다() {
		Long spaceInternalId = repository.findSpaceInternalId("space_alpha");

		repository.updateDisplayOrder("mtb_custom_hidden", spaceInternalId, 0);
		repository.updateDisplayOrder("mtb_overview", spaceInternalId, 1);
		repository.updateDisplayOrder("mtb_custom_notes", spaceInternalId, 2);

		List<String> reordered = jdbcTemplate.query(
			"""
				select public_id
				from public.member_tab_definitions
				where space_id = ?
				order by display_order asc, public_id asc
				""",
			(rs, rowNum) -> rs.getString("public_id"),
			spaceInternalId
		);

		assertThat(reordered)
			.containsExactly("mtb_custom_hidden", "mtb_overview", "mtb_custom_notes");
	}

	private void createFixtureTables() {
		jdbcTemplate.execute(
			"""
				create table if not exists public.users (
				  id uuid primary key,
				  email varchar(320) not null unique,
				  display_name varchar(80),
				  created_at timestamptz not null default now(),
				  updated_at timestamptz not null default now(),
				  role varchar(32) not null default 'user'
				)
				"""
		);
		jdbcTemplate.execute(
			"""
				create table if not exists public.spaces (
				  id bigint primary key generated always as identity,
				  public_id text not null unique,
				  name varchar(100) not null,
				  description text,
				  created_by_user_id uuid,
				  created_at timestamptz not null default now(),
				  updated_at timestamptz not null default now()
				)
				"""
		);
		jdbcTemplate.execute(
			"""
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
				"""
		);
	}

	private void insertUser(UUID userId, String email) {
		jdbcTemplate.update(
			"""
				insert into public.users (
				  id, email, display_name, created_at, updated_at, role
				) values (?, ?, ?, now(), now(), 'user')
				""",
			userId,
			email,
			"Member Tabs Reorder Owner"
		);
	}

	private void insertSpace(String publicId, UUID createdByUserId, String name) {
		jdbcTemplate.update(
			"""
				insert into public.spaces (
				  public_id, name, description, created_by_user_id, created_at, updated_at
				) values (?, ?, ?, ?, now(), now())
				""",
			publicId,
			name,
			null,
			createdByUserId
		);
	}

	private void insertTab(
		String publicId,
		String spacePublicId,
		UUID createdByUserId,
		String tabType,
		String systemKey,
		String name,
		boolean isVisible,
		int displayOrder
	) {
		jdbcTemplate.update(
			"""
				insert into public.member_tab_definitions (
				  public_id, space_id, created_by_user_id, tab_type, system_key, name, is_visible, display_order, created_at, updated_at
				)
				select ?, id, ?, ?, ?, ?, ?, ?, now(), now()
				from public.spaces
				where public_id = ?
				""",
			publicId,
			createdByUserId,
			tabType,
			systemKey,
			name,
			isVisible,
			displayOrder,
			spacePublicId
		);
	}
}
