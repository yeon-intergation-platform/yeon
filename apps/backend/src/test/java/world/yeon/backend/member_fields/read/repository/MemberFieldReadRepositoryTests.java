package world.yeon.backend.member_fields.read.repository;

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

import world.yeon.backend.member_fields.read.model.MemberFieldDefinitionEntity;

@SpringBootTest
@ActiveProfiles("dev.local")
@Testcontainers
class MemberFieldReadRepositoryTests {

	private static final UUID OWNER_ID =
		UUID.fromString("00000000-0000-0000-0000-000000000601");

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired
	private MemberFieldReadRepository repository;

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

		insertUser(OWNER_ID, "member-fields-owner@example.com");
		insertSpace("space_alpha", OWNER_ID, "알파 스페이스");
		insertSpace("space_beta", OWNER_ID, "베타 스페이스");
		insertTab("mtb_overview", "space_alpha", "system", "overview", "개요", true, 0);
		insertTab("mtb_custom_notes", "space_alpha", "custom", null, "상담 메모", true, 1);
		insertTab("mtb_beta_tab", "space_beta", "custom", null, "베타 메모", true, 0);
		insertField("mfd_status", "mtb_custom_notes", "상태", null, "select", "[{\"label\":\"진행중\",\"value\":\"in_progress\"}]", false, 0, false);
		insertField("mfd_memo", "mtb_custom_notes", "메모", null, "text", null, true, 1, false);
		insertField("mfd_deleted", "mtb_custom_notes", "삭제됨", null, "text", null, false, 2, true);
		insertField("mfd_beta", "mtb_beta_tab", "베타 필드", null, "text", null, false, 0, false);
	}

	@Test
	void publicSpaceId로내부SpaceId를조회할수있다() {
		Long internalId = repository.findSpaceInternalId("space_alpha");

		assertThat(internalId).isNotNull();
	}

	@Test
	void publicTabId로탭lookup을조회할수있다() {
		MemberFieldReadRepository.TabLookup lookup = repository.findTabLookup("mtb_custom_notes");

		assertThat(lookup).isNotNull();
		assertThat(lookup.tabInternalId()).isNotNull();
		assertThat(lookup.spaceInternalId()).isNotNull();
	}

	@Test
	void space와tab기준으로삭제되지않은필드목록을displayOrder오름차순으로조회한다() {
		Long spaceInternalId = repository.findSpaceInternalId("space_alpha");
		MemberFieldReadRepository.TabLookup lookup = repository.findTabLookup("mtb_custom_notes");

		List<MemberFieldDefinitionEntity> fields = repository.findFields(spaceInternalId, lookup.tabInternalId());

		assertThat(fields).extracting(MemberFieldDefinitionEntity::getPublicId)
			.containsExactly("mfd_status", "mfd_memo");
		assertThat(fields).extracting(MemberFieldDefinitionEntity::getDisplayOrder)
			.containsExactly(0, 1);
		assertThat(fields.getFirst().getOptions()).isNotNull();
		assertThat(fields.getFirst().getOptions().toString()).contains("in_progress");
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
			"Member Fields Owner"
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

	private void insertField(
		String publicId,
		String tabPublicId,
		String name,
		String sourceKey,
		String fieldType,
		String optionsJson,
		boolean isRequired,
		int displayOrder,
		boolean deleted
	) {
		jdbcTemplate.update(
			"""
				insert into public.member_field_definitions (
				  public_id, space_id, created_by_user_id, tab_id, name, source_key, field_type, options, is_required, display_order, deleted_at, created_at, updated_at
				)
				select ?, tab.space_id, ?, tab.id, ?, ?, ?, cast(? as jsonb), ?, ?, ?, now(), now()
				from public.member_tab_definitions tab
				where tab.public_id = ?
				""",
			publicId,
			OWNER_ID,
			name,
			sourceKey,
			fieldType,
			optionsJson,
			isRequired,
			displayOrder,
			deleted ? java.time.OffsetDateTime.now() : null,
			tabPublicId
		);
	}
}
