package world.yeon.backend.sheet_export.import_context.repository;

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
@ActiveProfiles("dev.local")
@Testcontainers
class SheetExportImportContextRepositoryTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000796");
	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17").withDatabaseName("yeon_backend_test").withUsername("yeon_test").withPassword("yeon_test");
	@Autowired private SheetExportImportContextRepository repository;
	@Autowired private JdbcTemplate jdbcTemplate;
	@DynamicPropertySource
	static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add("DATABASE_URL", () -> "postgresql://" + postgres.getUsername() + ":" + postgres.getPassword() + "@" + postgres.getHost() + ":" + postgres.getFirstMappedPort() + "/" + postgres.getDatabaseName());
	}
	@BeforeEach
	void setUpFixture() {
		jdbcTemplate.execute("create table if not exists public.users (id uuid primary key, email varchar(320) not null unique, display_name varchar(80), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), role varchar(32) not null default 'user')");
		jdbcTemplate.execute("create table if not exists public.spaces (id bigint primary key generated always as identity, public_id text not null unique, name varchar(100) not null, description text, created_by_user_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.members (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, name varchar(120) not null, email varchar(320), phone varchar(30), status varchar(30), initial_risk_level varchar(10), created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.member_tab_definitions (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, created_by_user_id uuid references public.users(id) on delete set null, tab_type varchar(20) not null, system_key varchar(30), name varchar(80) not null, is_visible boolean not null default true, display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.member_field_definitions (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, created_by_user_id uuid references public.users(id) on delete set null, tab_id bigint not null references public.member_tab_definitions(id) on delete cascade, name varchar(80) not null, source_key varchar(50), field_type varchar(30) not null, options jsonb, is_required boolean not null default false, display_order integer not null default 0, deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.member_field_values (id bigint primary key generated always as identity, public_id text not null unique, member_id bigint not null references public.members(id) on delete cascade, field_definition_id bigint not null references public.member_field_definitions(id) on delete cascade, value_text text, value_number numeric, value_boolean boolean, value_json jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.sheet_integrations (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, sheet_url text not null, sheet_id varchar(200) not null, data_type varchar(30) not null, column_mapping jsonb, last_synced_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.sheet_integration_member_snapshots (id bigint primary key generated always as identity, public_id text not null unique, integration_id bigint not null references public.sheet_integrations(id) on delete cascade, space_id bigint not null references public.spaces(id) on delete cascade, member_id text not null, base_payload jsonb not null, base_payload_hash text not null, exported_at timestamptz not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.update("delete from public.sheet_integration_member_snapshots");
		jdbcTemplate.update("delete from public.member_field_values");
		jdbcTemplate.update("delete from public.member_field_definitions");
		jdbcTemplate.update("delete from public.member_tab_definitions");
		jdbcTemplate.update("delete from public.members");
		jdbcTemplate.update("delete from public.sheet_integrations");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");
		jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", OWNER_ID, "ctx@example.com", "Owner");
		jdbcTemplate.update("insert into public.spaces (public_id,name,description,created_by_user_id,created_at,updated_at) values ('space_alpha','알파',null,?,now(),now())", OWNER_ID);
		jdbcTemplate.update("insert into public.members (public_id,space_id,name,email,phone,status,initial_risk_level,created_at,updated_at) select 'mem_1', id, '홍길동', null, null, 'active', null, now(), now() from public.spaces where public_id='space_alpha'");
		jdbcTemplate.update("insert into public.member_tab_definitions (public_id,space_id,created_by_user_id,tab_type,system_key,name,is_visible,display_order,created_at,updated_at) select 'mtb_1', id, ?, 'custom', null, '개요', true, 0, now(), now() from public.spaces where public_id='space_alpha'", OWNER_ID);
		jdbcTemplate.update("insert into public.member_field_definitions (public_id,space_id,created_by_user_id,tab_id,name,source_key,field_type,options,is_required,display_order,deleted_at,created_at,updated_at) select 'mfd_status', s.id, ?, t.id, '상태', null, 'select', null, false, 0, null, now(), now() from public.spaces s join public.member_tab_definitions t on t.space_id=s.id and t.public_id='mtb_1' where s.public_id='space_alpha'", OWNER_ID);
		jdbcTemplate.update("insert into public.member_field_values (public_id,member_id,field_definition_id,value_text,value_number,value_boolean,value_json,created_at,updated_at) select 'mfv_1', m.id, f.id, null, null, null, cast('[\"in_progress\"]' as jsonb), now(), now() from public.members m join public.member_field_definitions f on 1=1 where m.public_id='mem_1' and f.public_id='mfd_status'");
		jdbcTemplate.update("insert into public.sheet_integrations (public_id,space_id,sheet_url,sheet_id,data_type,column_mapping,last_synced_at,created_at,updated_at) select 'sht_1', id, 'https://docs.google.com/spreadsheets/d/sheet-1/edit', 'sheet-1', 'export', null, cast('2026-05-08T00:00:00Z' as timestamptz), now(), now() from public.spaces where public_id='space_alpha'");
		jdbcTemplate.update("insert into public.sheet_integration_member_snapshots (public_id,integration_id,space_id,member_id,base_payload,base_payload_hash,exported_at,created_at,updated_at) select 'shs_1', i.id, s.id, 'mem_1', cast('{\"core\":{\"name\":\"홍길동\",\"email\":null,\"phone\":null,\"status\":\"active\",\"initialRiskLevel\":null},\"customFields\":{\"상태\":\"in_progress\"}}' as jsonb), 'hash-1', cast('2026-05-08T00:00:00Z' as timestamptz), now(), now() from public.spaces s join public.sheet_integrations i on i.space_id=s.id and i.sheet_id='sheet-1' where s.public_id='space_alpha'");
	}
	@Test
	void importContext구성요소를조회한다() {
		var integration = repository.findIntegration("space_alpha", "sheet-1");
		var members = repository.findMembers(integration.spaceInternalId());
		var fields = repository.findFieldDefinitions(integration.spaceInternalId());
		var values = repository.findValues(members.stream().map(SheetExportImportContextRepository.MemberRow::memberInternalId).toList(), fields.stream().map(SheetExportImportContextRepository.FieldDefinitionRow::fieldDefinitionInternalId).toList());
		var snapshots = repository.findSnapshots(integration.integrationInternalId());
		assertThat(members).hasSize(1);
		assertThat(fields).hasSize(1);
		assertThat(values).hasSize(1);
		assertThat(snapshots).hasSize(1);
	}
}
