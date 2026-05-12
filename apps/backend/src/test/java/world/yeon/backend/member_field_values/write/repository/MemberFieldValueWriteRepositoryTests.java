package world.yeon.backend.member_field_values.write.repository;

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
class MemberFieldValueWriteRepositoryTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000787");

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired private MemberFieldValueWriteRepository repository;
	@Autowired private JdbcTemplate jdbcTemplate;

	@DynamicPropertySource
	static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add("DATABASE_URL", () -> "postgresql://" + postgres.getUsername() + ":" + postgres.getPassword() + "@" + postgres.getHost() + ":" + postgres.getFirstMappedPort() + "/" + postgres.getDatabaseName());
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
		insertSpace();
		insertMember();
		insertTab();
		insertDefinition("mfd_note", "text", "메모", 0);
		insertDefinition("mfd_status", "select", "상태", 1);
	}

	@Test
	void upsert는값을생성하고갱신할수있다() {
		Long spaceId = repository.findSpaceInternalId("space_alpha");
		Long memberId = repository.findMemberInternalId("mem_alpha", spaceId);
		var definitions = repository.findDefinitions(spaceId, List.of("mfd_note", "mfd_status"));
		Long noteId = definitions.stream().filter(d -> d.definitionPublicId().equals("mfd_note")).findFirst().orElseThrow().definitionInternalId();
		Long statusId = definitions.stream().filter(d -> d.definitionPublicId().equals("mfd_status")).findFirst().orElseThrow().definitionInternalId();

		repository.upsertValue("mfv_inserted", memberId, noteId, "처음 메모", null, null, null);
		repository.upsertValue("mfv_status", memberId, statusId, null, null, null, "[\"in_progress\"]");
		repository.upsertValue("mfv_updated", memberId, noteId, "수정 메모", null, null, null);

		var rows = repository.findValues(memberId, spaceId, List.of(noteId, statusId));
		assertThat(rows).hasSize(2);
		assertThat(rows.getFirst().fieldDefinitionPublicId()).isEqualTo("mfd_note");
		assertThat(rows.getFirst().valueText()).isEqualTo("수정 메모");
		assertThat(rows.get(1).fieldDefinitionPublicId()).isEqualTo("mfd_status");
		assertThat(rows.get(1).valueJson().toString()).contains("in_progress");
	}

	private void createFixtureTables() {
		jdbcTemplate.execute("create table if not exists public.users (id uuid primary key, email varchar(320) not null unique, display_name varchar(80), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), role varchar(32) not null default 'user')");
		jdbcTemplate.execute("create table if not exists public.spaces (id bigint primary key generated always as identity, public_id text not null unique, name varchar(100) not null, description text, created_by_user_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.members (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, name varchar(120) not null, email varchar(320), phone varchar(30), status varchar(30), created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.member_tab_definitions (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, created_by_user_id uuid references public.users(id) on delete set null, tab_type varchar(20) not null, system_key varchar(30), name varchar(80) not null, is_visible boolean not null default true, display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.member_field_definitions (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, created_by_user_id uuid references public.users(id) on delete set null, tab_id bigint not null references public.member_tab_definitions(id) on delete cascade, name varchar(80) not null, source_key varchar(50), field_type varchar(30) not null, options jsonb, is_required boolean not null default false, display_order integer not null default 0, deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.member_field_values (id bigint primary key generated always as identity, public_id text not null unique, member_id bigint not null references public.members(id) on delete cascade, field_definition_id bigint not null references public.member_field_definitions(id) on delete cascade, value_text text, value_number numeric, value_boolean boolean, value_json jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), constraint member_field_values_member_field_unique unique(member_id, field_definition_id))");
	}

	private void insertUser() { jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", OWNER_ID, "member-field-values-write@example.com", "Owner"); }
	private void insertSpace() { jdbcTemplate.update("insert into public.spaces (public_id,name,description,created_by_user_id,created_at,updated_at) values ('space_alpha','알파',null,?,now(),now())", OWNER_ID); }
	private void insertMember() { jdbcTemplate.update("insert into public.members (public_id,space_id,name,email,phone,status,created_at,updated_at) select 'mem_alpha', id, '학생', null, null, 'active', now(), now() from public.spaces where public_id='space_alpha'"); }
	private void insertTab() { jdbcTemplate.update("insert into public.member_tab_definitions (public_id,space_id,created_by_user_id,tab_type,system_key,name,is_visible,display_order,created_at,updated_at) select 'mtb_custom', id, ?, 'custom', null, '커스텀', true, 0, now(), now() from public.spaces where public_id='space_alpha'", OWNER_ID); }
	private void insertDefinition(String publicId, String fieldType, String name, int displayOrder) { jdbcTemplate.update("insert into public.member_field_definitions (public_id,space_id,created_by_user_id,tab_id,name,source_key,field_type,options,is_required,display_order,deleted_at,created_at,updated_at) select ?, s.id, ?, t.id, ?, null, ?, null, false, ?, null, now(), now() from public.spaces s join public.member_tab_definitions t on t.space_id=s.id and t.public_id='mtb_custom' where s.public_id='space_alpha'", publicId, OWNER_ID, name, fieldType, displayOrder); }
}
