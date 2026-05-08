package world.yeon.backend.spaces.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
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
class SpaceRepositoryTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000943");

	@Container static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17").withDatabaseName("yeon_backend_test").withUsername("yeon_test").withPassword("yeon_test");

	@Autowired private SpaceRepository repository;
	@Autowired private JdbcTemplate jdbcTemplate;

	@DynamicPropertySource static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add("BACKEND_JDBC_DATABASE_URL", postgres::getJdbcUrl);
		registry.add("BACKEND_JDBC_DATABASE_USERNAME", postgres::getUsername);
		registry.add("BACKEND_JDBC_DATABASE_PASSWORD", postgres::getPassword);
	}

	@BeforeEach void setUpFixture() {
		createFixtureTables();
		jdbcTemplate.update("delete from public.member_field_definitions");
		jdbcTemplate.update("delete from public.member_tab_definitions");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");
		jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", OWNER_ID, "space-owner@example.com", "Owner");
		jdbcTemplate.update("insert into public.spaces (public_id,name,description,start_date,end_date,created_by_user_id,created_at,updated_at) values ('spc_alpha','알파',null,'2026-05-01','2026-05-31',?,now(),now())", OWNER_ID);
	}

	@Test void 목록조회와단건조회와수정삭제를처리한다() {
		assertThat(repository.listOwnedSpaces(OWNER_ID)).hasSize(1);
		assertThat(repository.findByPublicId("spc_alpha")).isNotNull();
		var updated = repository.updateOwnedSpace(OWNER_ID, "spc_alpha", "알파 변경", "2026-05-01", "2026-06-30", OffsetDateTime.parse("2026-05-08T07:00:00Z"));
		assertThat(updated.name()).isEqualTo("알파 변경");
		assertThat(repository.deleteOwnedSpace(OWNER_ID, "spc_alpha")).isTrue();
		assertThat(repository.findByPublicId("spc_alpha")).isNull();
	}

	@Test void 생성시기본탭과개요필드를함께삽입한다() {
		var created = repository.insertSpaceWithDefaults(
			"spc_beta",
			"베타",
			null,
			null,
			null,
			OWNER_ID,
			OffsetDateTime.parse("2026-05-08T07:00:00Z"),
			List.of("mtb_1", "mtb_2", "mtb_3", "mtb_4", "mtb_5"),
			List.of("mfd_1", "mfd_2", "mfd_3", "mfd_4", "mfd_5", "mfd_6", "mfd_7", "mfd_8")
		);

		assertThat(created.publicId()).isEqualTo("spc_beta");
		Integer tabCount = jdbcTemplate.queryForObject("select count(*) from public.member_tab_definitions where space_id = ?", Integer.class, created.internalId());
		Integer fieldCount = jdbcTemplate.queryForObject("select count(*) from public.member_field_definitions where space_id = ?", Integer.class, created.internalId());
		assertThat(tabCount).isEqualTo(5);
		assertThat(fieldCount).isEqualTo(8);
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
			  start_date date,
			  end_date date,
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
}
