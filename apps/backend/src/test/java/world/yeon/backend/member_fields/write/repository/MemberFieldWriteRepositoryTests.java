package world.yeon.backend.member_fields.write.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.member_fields.read.model.MemberFieldDefinitionEntity;

@SpringBootTest
@ActiveProfiles("dev.local")
@Testcontainers
class MemberFieldWriteRepositoryTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000784");

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired private MemberFieldWriteRepository repository;
	@Autowired private JdbcTemplate jdbcTemplate;
	private final ObjectMapper objectMapper = new ObjectMapper();

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
		insertUser();
		insertSpace();
		insertTab("mtb_custom");
		insertField("mfd_existing", 0);
	}

	@Test
	void save는필드를생성하고조회할수있다() throws Exception {
		Long spaceId = repository.findSpaceInternalId("space_alpha");
		Long tabId = repository.findTabLookup("mtb_custom").tabInternalId();
		MemberFieldDefinitionEntity entity = new MemberFieldDefinitionEntity();
		entity.setPublicId("mfd_new");
		entity.setSpaceId(spaceId);
		entity.setCreatedByUserId(OWNER_ID);
		entity.setTabId(tabId);
		entity.setName("새 필드");
		entity.setFieldType("select");
		entity.setOptions(objectMapper.readTree("[{\"value\":\"in_progress\",\"color\":\"#818cf8\"}]") );
		entity.setRequired(true);
		entity.setDisplayOrder(1);
		entity.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));
		entity.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
		repository.save(entity);
		var saved = repository.findFieldByPublicIdInSpace("mfd_new", spaceId);
		assertThat(saved).isNotNull();
		assertThat(saved.getName()).isEqualTo("새 필드");
		assertThat(saved.getOptions().toString()).contains("in_progress");
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
	private void insertUser() { jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", OWNER_ID, "member-fields-write-owner@example.com", "Owner"); }
	private void insertSpace() { jdbcTemplate.update("insert into public.spaces (public_id,name,description,created_by_user_id,created_at,updated_at) values ('space_alpha','알파',null,?,now(),now())", OWNER_ID); }
	private void insertTab(String publicId) { jdbcTemplate.update("insert into public.member_tab_definitions (public_id,space_id,created_by_user_id,tab_type,system_key,name,is_visible,display_order,created_at,updated_at) select ?, id, ?, 'custom', null, '커스텀', true, 0, now(), now() from public.spaces where public_id='space_alpha'", publicId, OWNER_ID); }
	private void insertField(String publicId, int displayOrder) { jdbcTemplate.update("insert into public.member_field_definitions (public_id,space_id,created_by_user_id,tab_id,name,source_key,field_type,options,is_required,display_order,deleted_at,created_at,updated_at) select ?, s.id, ?, t.id, '기존 필드', null, 'text', null, false, ?, null, now(), now() from public.spaces s join public.member_tab_definitions t on t.space_id=s.id and t.public_id='mtb_custom' where s.public_id='space_alpha'", publicId, OWNER_ID, displayOrder); }
}
