package world.yeon.backend.sheet_export.read.repository;

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
class SheetExportReadRepositoryTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000791");

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired private SheetExportReadRepository repository;
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
		jdbcTemplate.update("delete from public.member_field_values");
		jdbcTemplate.update("delete from public.member_field_definitions");
		jdbcTemplate.update("delete from public.member_tab_definitions");
		jdbcTemplate.update("delete from public.members");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");
		insertUser();
		insertSpace("space_alpha", "알파");
		insertSpace("space_beta", "베타");
		insertMember("mem_alpha", "space_alpha", "홍길동", "hong@example.com", "010-1111-2222", "active", "medium", "2026-05-01T00:00:00+09:00");
		insertMember("mem_beta", "space_alpha", "김영희", null, null, "withdrawn", null, "2026-05-02T00:00:00+09:00");
		insertMember("mem_other", "space_beta", "다른이", null, null, "active", null, "2026-05-03T00:00:00+09:00");
		insertTab("mtb_overview", "space_alpha", "custom", null, "개요", 0);
		insertTab("mtb_custom", "space_alpha", "custom", null, "메모", 1);
		insertTab("mtb_other", "space_beta", "custom", null, "다른탭", 0);
		insertField("mfd_status", "space_alpha", "mtb_overview", "상태", "select", 0, null);
		insertField("mfd_note", "space_alpha", "mtb_custom", "메모", "text", 1, null);
		insertField("mfd_hidden", "space_alpha", "mtb_custom", "숨김", "text", 2, java.time.OffsetDateTime.now().toString());
		insertField("mfd_other", "space_beta", "mtb_other", "다른값", "text", 0, null);
		insertValue("mfv_status", "mem_alpha", "mfd_status", null, null, null, "[\"in_progress\"]");
		insertValue("mfv_note", "mem_alpha", "mfd_note", "메모값", null, null, null);
		insertValue("mfv_other", "mem_other", "mfd_other", "다른값", null, null, null);
	}

	@Test
	void exportRead기준멤버필드정의값을조회한다() {
		Long spaceId = repository.findSpaceInternalId("space_alpha");
		var members = repository.findMembers(spaceId);
		var fields = repository.findFieldDefinitions(spaceId);
		var values = repository.findValues(
			members.stream().map(SheetExportReadRepository.MemberRow::memberInternalId).toList(),
			fields.stream().map(SheetExportReadRepository.FieldDefinitionRow::fieldDefinitionInternalId).toList()
		);

		assertThat(members).extracting(SheetExportReadRepository.MemberRow::memberPublicId)
			.containsExactly("mem_alpha", "mem_beta");
		assertThat(fields).extracting(SheetExportReadRepository.FieldDefinitionRow::fieldDefinitionPublicId)
			.containsExactly("mfd_status", "mfd_note");
		assertThat(values).extracting(SheetExportReadRepository.ValueRow::fieldDefinitionInternalId).hasSize(2);
		assertThat(values.getFirst().valueJson().toString()).contains("in_progress");
	}

	private void createFixtureTables() {
		jdbcTemplate.execute("create table if not exists public.users (id uuid primary key, email varchar(320) not null unique, display_name varchar(80), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), role varchar(32) not null default 'user')");
		jdbcTemplate.execute("create table if not exists public.spaces (id bigint primary key generated always as identity, public_id text not null unique, name varchar(100) not null, description text, created_by_user_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.members (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, name varchar(120) not null, email varchar(320), phone varchar(30), status varchar(30), initial_risk_level varchar(10), created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.member_tab_definitions (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, created_by_user_id uuid references public.users(id) on delete set null, tab_type varchar(20) not null, system_key varchar(30), name varchar(80) not null, is_visible boolean not null default true, display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.member_field_definitions (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, created_by_user_id uuid references public.users(id) on delete set null, tab_id bigint not null references public.member_tab_definitions(id) on delete cascade, name varchar(80) not null, source_key varchar(50), field_type varchar(30) not null, options jsonb, is_required boolean not null default false, display_order integer not null default 0, deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.member_field_values (id bigint primary key generated always as identity, public_id text not null unique, member_id bigint not null references public.members(id) on delete cascade, field_definition_id bigint not null references public.member_field_definitions(id) on delete cascade, value_text text, value_number numeric, value_boolean boolean, value_json jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
	}

	private void insertUser() { jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", OWNER_ID, "sheet-export-read@example.com", "Owner"); }
	private void insertSpace(String publicId, String name) { jdbcTemplate.update("insert into public.spaces (public_id,name,description,created_by_user_id,created_at,updated_at) values (?,?,null,?,now(),now())", publicId, name, OWNER_ID); }
	private void insertMember(String publicId, String spacePublicId, String name, String email, String phone, String status, String risk, String createdAt) { jdbcTemplate.update("insert into public.members (public_id,space_id,name,email,phone,status,initial_risk_level,created_at,updated_at) select ?, id, ?, ?, ?, ?, ?, cast(? as timestamptz), cast(? as timestamptz) from public.spaces where public_id=?", publicId, name, email, phone, status, risk, createdAt, createdAt, spacePublicId); }
	private void insertTab(String publicId, String spacePublicId, String tabType, String systemKey, String name, int displayOrder) { jdbcTemplate.update("insert into public.member_tab_definitions (public_id,space_id,created_by_user_id,tab_type,system_key,name,is_visible,display_order,created_at,updated_at) select ?, id, ?, ?, ?, ?, true, ?, now(), now() from public.spaces where public_id=?", publicId, OWNER_ID, tabType, systemKey, name, displayOrder, spacePublicId); }
	private void insertField(String publicId, String spacePublicId, String tabPublicId, String name, String fieldType, int displayOrder, String deletedAt) { jdbcTemplate.update("insert into public.member_field_definitions (public_id,space_id,created_by_user_id,tab_id,name,source_key,field_type,options,is_required,display_order,deleted_at,created_at,updated_at) select ?, s.id, ?, t.id, ?, null, ?, null, false, ?, cast(? as timestamptz), now(), now() from public.spaces s join public.member_tab_definitions t on t.space_id=s.id and t.public_id=? where s.public_id=?", publicId, OWNER_ID, name, fieldType, displayOrder, deletedAt, tabPublicId, spacePublicId); }
	private void insertValue(String publicId, String memberPublicId, String fieldPublicId, String valueText, String valueNumber, Boolean valueBoolean, String valueJson) { jdbcTemplate.update("insert into public.member_field_values (public_id,member_id,field_definition_id,value_text,value_number,value_boolean,value_json,created_at,updated_at) select ?, m.id, f.id, ?, cast(? as numeric), ?, cast(? as jsonb), now(), now() from public.members m join public.member_field_definitions f on 1=1 where m.public_id=? and f.public_id=?", publicId, valueText, valueNumber, valueBoolean, valueJson, memberPublicId, fieldPublicId); }
}
