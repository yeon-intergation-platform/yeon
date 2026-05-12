package world.yeon.backend.member_field_values.read.repository;

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
class MemberFieldValueReadRepositoryTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000701");

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired
	private MemberFieldValueReadRepository repository;

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
		jdbcTemplate.update("delete from public.member_field_values");
		jdbcTemplate.update("delete from public.member_field_definitions");
		jdbcTemplate.update("delete from public.members");
		jdbcTemplate.update("delete from public.member_tab_definitions");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");

		insertUser(OWNER_ID, "member-field-values-owner@example.com");
		insertSpace("space_alpha", OWNER_ID, "알파");
		insertSpace("space_beta", OWNER_ID, "베타");
		insertTab("mtb_alpha", "space_alpha", "상담 메모");
		insertTab("mtb_beta", "space_beta", "다른 탭");
		insertMember("mem_alpha", "space_alpha", "알파 수강생");
		insertMember("mem_beta", "space_beta", "베타 수강생");
		insertField("mfd_status", "mtb_alpha", "상태", "select", "[{\"value\":\"in_progress\",\"color\":\"#818cf8\"}]", false, 0, false);
		insertField("mfd_note", "mtb_alpha", "메모", "text", null, true, 1, false);
		insertField("mfd_deleted", "mtb_alpha", "삭제됨", "text", null, false, 2, true);
		insertField("mfd_beta", "mtb_beta", "베타필드", "text", null, false, 0, false);
		insertValue("mem_alpha", "mfd_status", null, null, null, "[\"in_progress\"]");
		insertValue("mem_alpha", "mfd_note", "메모값", null, null, null);
		insertValue("mem_beta", "mfd_beta", "다른값", null, null, null);
	}

	@Test
	void memberLookup과tabLookup을조회할수있다() {
		Long spaceId = repository.findSpaceInternalId("space_alpha");
		var tab = repository.findTabLookup("mtb_alpha");
		Long memberId = repository.findMemberInternalId("mem_alpha", spaceId);
		assertThat(spaceId).isNotNull();
		assertThat(tab).isNotNull();
		assertThat(memberId).isNotNull();
	}

	@Test
	void tab의fieldDefinitionIds를기준으로values를조회한다() {
		Long spaceId = repository.findSpaceInternalId("space_alpha");
		var tab = repository.findTabLookup("mtb_alpha");
		Long memberId = repository.findMemberInternalId("mem_alpha", spaceId);
		List<Long> fieldIds = repository.findFieldDefinitionIds(spaceId, tab.tabInternalId());
		var values = repository.findValues(memberId, spaceId, fieldIds);
		assertThat(values).extracting(MemberFieldValueReadRepository.ValueRow::fieldDefinitionPublicId)
			.containsExactly("mfd_status", "mfd_note");
		assertThat(values.getFirst().valueJson().toString()).contains("in_progress");
	}

	@Test
	void memberRoute용values를필터와메타데이터포함으로조회한다() {
		Long spaceId = repository.findSpaceInternalId("space_alpha");
		Long memberId = repository.findMemberInternalId("mem_alpha", spaceId);
		var values = repository.findDetailedValues(memberId, spaceId, List.of("mfd_status"));
		assertThat(values).hasSize(1);
		assertThat(values.getFirst().fieldDefinitionPublicId()).isEqualTo("mfd_status");
		assertThat(values.getFirst().fieldType()).isEqualTo("select");
		assertThat(values.getFirst().fieldName()).isEqualTo("상태");
		assertThat(values.getFirst().valueJson().toString()).contains("in_progress");
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
			create table if not exists public.members (
			  id bigint primary key generated always as identity,
			  public_id text not null unique,
			  space_id bigint not null references public.spaces(id) on delete cascade,
			  name varchar(100) not null,
			  email varchar(255),
			  phone varchar(20),
			  status varchar(20) not null default 'active',
			  initial_risk_level varchar(10),
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
		jdbcTemplate.execute("""
			create table if not exists public.member_field_values (
			  id bigint primary key generated always as identity,
			  public_id text not null unique,
			  member_id bigint not null references public.members(id) on delete cascade,
			  field_definition_id bigint not null references public.member_field_definitions(id) on delete cascade,
			  value_text text,
			  value_number numeric,
			  value_boolean boolean,
			  value_json jsonb,
			  created_at timestamptz not null default now(),
			  updated_at timestamptz not null default now()
			)
		""");
	}

	private void insertUser(UUID userId, String email) { jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", userId, email, "Owner"); }
	private void insertSpace(String publicId, UUID createdByUserId, String name) { jdbcTemplate.update("insert into public.spaces (public_id,name,description,created_by_user_id,created_at,updated_at) values (?,?,?, ?, now(), now())", publicId, name, null, createdByUserId); }
	private void insertTab(String publicId, String spacePublicId, String name) { jdbcTemplate.update("insert into public.member_tab_definitions (public_id, space_id, created_by_user_id, tab_type, system_key, name, is_visible, display_order, created_at, updated_at) select ?, id, ?, 'custom', null, ?, true, 0, now(), now() from public.spaces where public_id = ?", publicId, OWNER_ID, name, spacePublicId); }
	private void insertMember(String publicId, String spacePublicId, String name) { jdbcTemplate.update("insert into public.members (public_id, space_id, name, email, phone, status, initial_risk_level, created_at, updated_at) select ?, id, ?, null, null, 'active', null, now(), now() from public.spaces where public_id = ?", publicId, name, spacePublicId); }
	private void insertField(String publicId, String tabPublicId, String name, String fieldType, String optionsJson, boolean isRequired, int displayOrder, boolean deleted) { jdbcTemplate.update("insert into public.member_field_definitions (public_id, space_id, created_by_user_id, tab_id, name, source_key, field_type, options, is_required, display_order, deleted_at, created_at, updated_at) select ?, tab.space_id, ?, tab.id, ?, null, ?, cast(? as jsonb), ?, ?, ?, now(), now() from public.member_tab_definitions tab where tab.public_id = ?", publicId, OWNER_ID, name, fieldType, optionsJson, isRequired, displayOrder, deleted ? java.time.OffsetDateTime.now() : null, tabPublicId); }
	private void insertValue(String memberPublicId, String fieldPublicId, String valueText, String valueNumber, Boolean valueBoolean, String valueJson) { jdbcTemplate.update("insert into public.member_field_values (public_id, member_id, field_definition_id, value_text, value_number, value_boolean, value_json, created_at, updated_at) select ?, m.id, f.id, ?, cast(? as numeric), ?, cast(? as jsonb), now(), now() from public.members m join public.member_field_definitions f on 1=1 where m.public_id = ? and f.public_id = ?", "mfv_" + memberPublicId + '_' + fieldPublicId, valueText, valueNumber, valueBoolean, valueJson, memberPublicId, fieldPublicId); }
}
