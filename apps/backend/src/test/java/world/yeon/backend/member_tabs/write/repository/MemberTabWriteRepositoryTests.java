package world.yeon.backend.member_tabs.write.repository;

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

import world.yeon.backend.member_tabs.read.model.MemberTabDefinitionEntity;

@SpringBootTest
@ActiveProfiles("jdbc")
@Testcontainers
class MemberTabWriteRepositoryTests {

	private static final UUID OWNER_ID =
		UUID.fromString("00000000-0000-0000-0000-000000000201");

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired
	private MemberTabWriteRepository repository;

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

		insertUser(OWNER_ID, "member-tabs-write-owner@example.com");
		insertSpace("space_alpha", OWNER_ID, "알파 스페이스");
		insertSpace("space_beta", OWNER_ID, "베타 스페이스");
		insertTab("mtb_overview", "space_alpha", OWNER_ID, "system", "overview", "개요", true, 0);
		insertTab("mtb_custom_1", "space_alpha", OWNER_ID, "custom", null, "상담 메모", true, 1);
		insertTab("mtb_custom_2", "space_alpha", OWNER_ID, "custom", null, "숨김 탭", false, 4);
	}

	@Test
	void space와publicId기준으로대상탭을조회하고maxDisplayOrder를계산한다() {
		Long spaceInternalId = repository.findSpaceInternalId("space_alpha");

		var found = repository.findByPublicIdAndSpaceId("mtb_custom_1", spaceInternalId);
		int maxDisplayOrder = repository.findMaxDisplayOrder(spaceInternalId);

		assertThat(spaceInternalId).isNotNull();
		assertThat(found).isPresent();
		assertThat(found.orElseThrow().getName()).isEqualTo("상담 메모");
		assertThat(maxDisplayOrder).isEqualTo(4);
	}

	@Test
	void custom탭을저장하고삭제하면관련필드가cascade삭제된다() {
		Long spaceInternalId = repository.findSpaceInternalId("space_alpha");
		MemberTabDefinitionEntity entity = new MemberTabDefinitionEntity();
		OffsetDateTime now = OffsetDateTime.now();
		entity.setPublicId("mtb_created");
		entity.setSpaceId(spaceInternalId);
		entity.setCreatedByUserId(OWNER_ID);
		entity.setTabType("custom");
		entity.setSystemKey(null);
		entity.setName("새 커스텀 탭");
		entity.setVisible(true);
		entity.setDisplayOrder(repository.findMaxDisplayOrder(spaceInternalId) + 1);
		entity.setCreatedAt(now);
		entity.setUpdatedAt(now);

		MemberTabDefinitionEntity saved = repository.save(entity);
		assertThat(saved.getId()).isNotNull();

		jdbcTemplate.update(
			"""
				insert into public.member_field_definitions (
				  public_id, space_id, created_by_user_id, tab_id, name, source_key, field_type, options, is_required, display_order, deleted_at, created_at, updated_at
				) values (?, ?, ?, ?, ?, ?, ?, cast(? as jsonb), ?, ?, ?, now(), now())
				""",
			"mfd_created",
			spaceInternalId,
			OWNER_ID,
			saved.getId(),
			"연결 필드",
			null,
			"text",
			null,
			false,
			0,
			null
		);

		repository.delete(saved);

		Integer remainingTabs = jdbcTemplate.queryForObject(
			"select count(*) from public.member_tab_definitions where public_id = ?",
			Integer.class,
			"mtb_created"
		);
		Integer remainingFields = jdbcTemplate.queryForObject(
			"select count(*) from public.member_field_definitions where public_id = ?",
			Integer.class,
			"mfd_created"
		);

		assertThat(remainingTabs).isZero();
		assertThat(remainingFields).isZero();
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
			"Member Tabs Write Owner"
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
