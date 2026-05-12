package world.yeon.backend.student_board_history.repository;

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

@SpringBootTest
@ActiveProfiles("dev.local")
@Testcontainers
class StudentBoardHistoryRepositoryTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000933");
	@Container static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17").withDatabaseName("yeon_backend_test").withUsername("yeon_test").withPassword("yeon_test");
	@Autowired private StudentBoardHistoryRepository repository;
	@Autowired private JdbcTemplate jdbcTemplate;

	@DynamicPropertySource static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add("BACKEND_JDBC_DATABASE_URL", postgres::getJdbcUrl);
		registry.add("BACKEND_JDBC_DATABASE_USERNAME", postgres::getUsername);
		registry.add("BACKEND_JDBC_DATABASE_PASSWORD", postgres::getPassword);
	}

	@BeforeEach void setUpFixture() {
		jdbcTemplate.execute("create table if not exists public.users (id uuid primary key, email varchar(320) not null unique, display_name varchar(80), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), role varchar(32) not null default 'user')");
		jdbcTemplate.execute("create table if not exists public.spaces (id bigint primary key generated always as identity, public_id text not null unique, name varchar(100) not null, description text, start_date date, end_date date, created_by_user_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.members (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, name varchar(100) not null, email varchar(255), phone varchar(20), status varchar(20) not null default 'active', initial_risk_level varchar(10), created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.space_member_board_history (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, member_id bigint not null references public.members(id) on delete cascade, session_id bigint, attendance_status varchar(20) not null default 'unknown', assignment_status varchar(20) not null default 'unknown', assignment_link varchar(1000), source varchar(30) not null, updated_by_user_id uuid, happened_at timestamptz not null default now(), created_at timestamptz not null default now())");
		jdbcTemplate.update("delete from public.space_member_board_history");
		jdbcTemplate.update("delete from public.members");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");
		jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", OWNER_ID, "owner@example.com", "Owner");
		jdbcTemplate.update("insert into public.spaces (public_id,name,start_date,end_date,created_by_user_id,created_at,updated_at) values ('space_alpha','알파','2026-05-01','2026-05-31',?,now(),now())", OWNER_ID);
		jdbcTemplate.update("insert into public.members (public_id,space_id,name,created_at,updated_at) values ('mem_1',(select id from public.spaces where public_id='space_alpha'),'홍길동',now(),now())");
		jdbcTemplate.update("insert into public.space_member_board_history (public_id,space_id,member_id,attendance_status,assignment_status,assignment_link,source,happened_at,created_at) values ('smbh_1',(select id from public.spaces where public_id='space_alpha'),(select id from public.members where public_id='mem_1'),'present','done',null,'manual',?,?)", OffsetDateTime.parse("2026-05-08T01:00:00Z"), OffsetDateTime.parse("2026-05-08T01:00:00Z"));
	}

	@Test void context와history를조회한다() {
		var context = repository.findOwnedMemberContext("space_alpha", "mem_1", OWNER_ID);
		assertThat(context).isNotNull();
		var rows = repository.findHistoryRows(context.spaceInternalId(), context.memberInternalId(), OffsetDateTime.parse("2026-05-01T00:00:00Z"), null);
		assertThat(rows).hasSize(1);
		assertThat(rows.getFirst().id()).isEqualTo("smbh_1");
	}
}
