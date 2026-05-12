package world.yeon.backend.member_tabs.reset.repository;

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
@ActiveProfiles("dev.local")
@Testcontainers
class MemberTabResetRepositoryTests {

	private record SystemTabDef(String systemKey, String name, int displayOrder) {}

	private static final UUID OWNER_ID =
		UUID.fromString("00000000-0000-0000-0000-000000000501");

	private static final List<SystemTabDef> DEFAULT_SYSTEM_TABS = List.of(
		new SystemTabDef("overview", "개요", 0),
		new SystemTabDef("student_board", "출석·과제", 1),
		new SystemTabDef("counseling", "상담기록", 2),
		new SystemTabDef("memos", "메모", 3),
		new SystemTabDef("report", "리포트", 4)
	);

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired
	private MemberTabResetRepository repository;

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
		jdbcTemplate.update("delete from public.member_field_definitions");
		jdbcTemplate.update("delete from public.member_tab_definitions");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");

		insertUser(OWNER_ID, "member-tabs-reset-owner@example.com");
		insertSpace("space_alpha", OWNER_ID, "알파 스페이스");
		insertSpace("space_beta", OWNER_ID, "베타 스페이스");

		insertSystemTab("mtb_overview", "space_alpha", "overview", "개요(변경됨)", false, 8);
		insertSystemTab("mtb_student_board", "space_alpha", "student_board", "과제", false, 9);
		insertSystemTab("mtb_counseling", "space_alpha", "counseling", "상담", false, 10);
		insertSystemTab("mtb_memos", "space_alpha", "memos", "메모장", false, 11);
		insertSystemTab("mtb_report", "space_alpha", "report", "보고서", false, 12);
		insertCustomTab("mtb_custom_notes", "space_alpha", "상담 메모", true, 20);
		insertCustomTab("mtb_custom_hidden", "space_alpha", "숨김 메모", false, 21);
		insertField("mfd_custom_hidden", "mtb_custom_hidden", "연결 필드");

		insertSystemTab("mtb_beta_overview", "space_beta", "overview", "베타 개요", true, 0);
		insertCustomTab("mtb_beta_custom", "space_beta", "베타 커스텀", true, 1);
	}

	@Test
	void publicSpaceId로내부SpaceId를조회할수있다() {
		Long internalId = repository.findSpaceInternalId("space_alpha");

		assertThat(internalId).isNotNull();
	}

	@Test
	void custom탭을삭제하고시스템탭을기본상태로복원한다() {
		Long spaceInternalId = repository.findSpaceInternalId("space_alpha");

		repository.deleteCustomTabs(spaceInternalId);
		for (SystemTabDef def : DEFAULT_SYSTEM_TABS) {
			repository.restoreSystemTab(spaceInternalId, def.systemKey(), def.name(), def.displayOrder());
		}

		Integer remainingCustomTabs = jdbcTemplate.queryForObject(
			"""
				select count(*)
				from public.member_tab_definitions
				where space_id = ?
				  and tab_type <> 'system'
				""",
			Integer.class,
			spaceInternalId
		);
		Integer remainingFields = jdbcTemplate.queryForObject(
			"select count(*) from public.member_field_definitions where public_id = ?",
			Integer.class,
			"mfd_custom_hidden"
		);
		List<String> restoredSystemTabs = jdbcTemplate.query(
			"""
				select system_key || ':' || name || ':' || display_order || ':' || is_visible
				from public.member_tab_definitions
				where space_id = ?
				  and tab_type = 'system'
				order by display_order asc
				""",
			(rs, rowNum) -> rs.getString(1),
			spaceInternalId
		);
		Integer betaCustomTabs = jdbcTemplate.queryForObject(
			"""
				select count(*)
				from public.member_tab_definitions
				where public_id = 'mtb_beta_custom'
				""",
			Integer.class
		);

		assertThat(remainingCustomTabs).isZero();
		assertThat(remainingFields).isZero();
		assertThat(restoredSystemTabs).containsExactly(
			"overview:개요:0:true",
			"student_board:출석·과제:1:true",
			"counseling:상담기록:2:true",
			"memos:메모:3:true",
			"report:리포트:4:true"
		);
		assertThat(betaCustomTabs).isEqualTo(1);
	}

	@Test
	void 없는시스템탭row는새로만들지않고기존row만복원한다() {
		Long spaceInternalId = repository.findSpaceInternalId("space_alpha");
		jdbcTemplate.update(
			"delete from public.member_tab_definitions where space_id = ? and system_key = 'report'",
			spaceInternalId
		);

		for (SystemTabDef def : DEFAULT_SYSTEM_TABS) {
			repository.restoreSystemTab(spaceInternalId, def.systemKey(), def.name(), def.displayOrder());
		}

		Integer reportTabCount = jdbcTemplate.queryForObject(
			"""
				select count(*)
				from public.member_tab_definitions
				where space_id = ?
				  and system_key = 'report'
				""",
			Integer.class,
			spaceInternalId
		);

		assertThat(reportTabCount).isZero();
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
		jdbcTemplate.execute(
			"""
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
			"Member Tabs Reset Owner"
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

	private void insertSystemTab(
		String publicId,
		String spacePublicId,
		String systemKey,
		String name,
		boolean isVisible,
		int displayOrder
	) {
		insertTab(publicId, spacePublicId, "system", systemKey, name, isVisible, displayOrder);
	}

	private void insertCustomTab(
		String publicId,
		String spacePublicId,
		String name,
		boolean isVisible,
		int displayOrder
	) {
		insertTab(publicId, spacePublicId, "custom", null, name, isVisible, displayOrder);
	}

	private void insertTab(
		String publicId,
		String spacePublicId,
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
			OWNER_ID,
			tabType,
			systemKey,
			name,
			isVisible,
			displayOrder,
			spacePublicId
		);
	}

	private void insertField(String publicId, String tabPublicId, String name) {
		jdbcTemplate.update(
			"""
				insert into public.member_field_definitions (
				  public_id, space_id, created_by_user_id, tab_id, name, source_key, field_type, options, is_required, display_order, deleted_at, created_at, updated_at
				)
				select ?, tab.space_id, ?, tab.id, ?, null, 'text', null, false, 0, null, now(), now()
				from public.member_tab_definitions tab
				where tab.public_id = ?
				""",
			publicId,
			OWNER_ID,
			name,
			tabPublicId
		);
	}
}
