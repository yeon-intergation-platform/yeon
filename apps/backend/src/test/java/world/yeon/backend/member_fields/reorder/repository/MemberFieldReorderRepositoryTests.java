package world.yeon.backend.member_fields.reorder.repository;

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
class MemberFieldReorderRepositoryTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000786");
	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");
	@Autowired private MemberFieldReorderRepository repository;
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
		jdbcTemplate.update("delete from public.member_field_definitions");
		jdbcTemplate.update("delete from public.member_tab_definitions");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");
		insertUser();
		insertSpace("space_alpha");
		insertSpace("space_beta");
		insertTab("mtb_alpha", "space_alpha");
		insertTab("mtb_beta", "space_beta");
		insertField("mfd_a", "space_alpha", "mtb_alpha", 0);
		insertField("mfd_b", "space_alpha", "mtb_alpha", 1);
		insertField("mfd_c", "space_alpha", "mtb_alpha", 2);
		insertField("mfd_beta", "space_beta", "mtb_beta", 0);
	}
	@Test
	void publicSpaceId로내부SpaceId를조회할수있다() {
		assertThat(repository.findSpaceInternalId("space_alpha")).isNotNull();
	}
	@Test
	void reorder대상필드들의displayOrder를bulk반영한다() {
		Long spaceInternalId = repository.findSpaceInternalId("space_alpha");
		repository.updateDisplayOrder("mfd_c", spaceInternalId, 0);
		repository.updateDisplayOrder("mfd_a", spaceInternalId, 1);
		repository.updateDisplayOrder("mfd_b", spaceInternalId, 2);
		List<String> reordered = jdbcTemplate.query("select public_id from public.member_field_definitions where space_id = ? order by display_order asc, public_id asc", (rs, rowNum) -> rs.getString("public_id"), spaceInternalId);
		assertThat(reordered).containsExactly("mfd_c", "mfd_a", "mfd_b");
	}
	private void createFixtureTables() {
		jdbcTemplate.execute("create table if not exists public.users (id uuid primary key, email varchar(320) not null unique, display_name varchar(80), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), role varchar(32) not null default 'user')");
		jdbcTemplate.execute("create table if not exists public.spaces (id bigint primary key generated always as identity, public_id text not null unique, name varchar(100) not null, description text, created_by_user_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.member_tab_definitions (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, created_by_user_id uuid references public.users(id) on delete set null, tab_type varchar(20) not null, system_key varchar(30), name varchar(80) not null, is_visible boolean not null default true, display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.member_field_definitions (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, created_by_user_id uuid references public.users(id) on delete set null, tab_id bigint not null references public.member_tab_definitions(id) on delete cascade, name varchar(80) not null, source_key varchar(50), field_type varchar(30) not null, options jsonb, is_required boolean not null default false, display_order integer not null default 0, deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
	}
	private void insertUser() { jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", OWNER_ID, "member-fields-reorder-owner@example.com", "Owner"); }
	private void insertSpace(String publicId) { jdbcTemplate.update("insert into public.spaces (public_id,name,description,created_by_user_id,created_at,updated_at) values (?, ?, null, ?, now(), now())", publicId, publicId, OWNER_ID); }
	private void insertTab(String publicId, String spacePublicId) { jdbcTemplate.update("insert into public.member_tab_definitions (public_id,space_id,created_by_user_id,tab_type,system_key,name,is_visible,display_order,created_at,updated_at) select ?, id, ?, 'custom', null, ?, true, 0, now(), now() from public.spaces where public_id = ?", publicId, OWNER_ID, publicId, spacePublicId); }
	private void insertField(String publicId, String spacePublicId, String tabPublicId, int displayOrder) { jdbcTemplate.update("insert into public.member_field_definitions (public_id,space_id,created_by_user_id,tab_id,name,source_key,field_type,options,is_required,display_order,deleted_at,created_at,updated_at) select ?, s.id, ?, t.id, ?, null, 'text', null, false, ?, null, now(), now() from public.spaces s join public.member_tab_definitions t on t.space_id=s.id and t.public_id=? where s.public_id=?", publicId, OWNER_ID, publicId, displayOrder, tabPublicId, spacePublicId); }
}
