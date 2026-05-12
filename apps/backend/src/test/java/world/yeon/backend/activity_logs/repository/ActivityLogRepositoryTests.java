package world.yeon.backend.activity_logs.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
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
class ActivityLogRepositoryTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000923");
	@Container static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17").withDatabaseName("yeon_backend_test").withUsername("yeon_test").withPassword("yeon_test");
	@Autowired private ActivityLogRepository repository;
	@Autowired private JdbcTemplate jdbcTemplate;

	@DynamicPropertySource static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add("DATABASE_URL", () -> "postgresql://" + postgres.getUsername() + ":" + postgres.getPassword() + "@" + postgres.getHost() + ":" + postgres.getFirstMappedPort() + "/" + postgres.getDatabaseName());
	}

	@BeforeEach void setUpFixture() {
		jdbcTemplate.execute("create table if not exists public.users (id uuid primary key, email varchar(320) not null unique, display_name varchar(80), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), role varchar(32) not null default 'user')");
		jdbcTemplate.execute("create table if not exists public.spaces (id bigint primary key generated always as identity, public_id text not null unique, name varchar(100) not null, description text, created_by_user_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.members (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, name varchar(100) not null, email varchar(255), phone varchar(20), status varchar(20) not null default 'active', initial_risk_level varchar(10), created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.activity_logs (id bigint primary key generated always as identity, public_id text not null unique, member_id bigint not null references public.members(id) on delete cascade, space_id bigint not null references public.spaces(id) on delete cascade, type varchar(30) not null, status varchar(30), recorded_at timestamptz not null, source varchar(30) not null default 'manual', metadata jsonb, created_at timestamptz not null default now())");
		jdbcTemplate.update("delete from public.activity_logs");
		jdbcTemplate.update("delete from public.members");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");
		jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", OWNER_ID, "owner@example.com", "Owner");
		jdbcTemplate.update("insert into public.spaces (public_id,name,created_by_user_id,created_at,updated_at) values ('space_alpha','알파',?,now(),now())", OWNER_ID);
		jdbcTemplate.update("insert into public.members (public_id,space_id,name,created_at,updated_at) values ('mem_1',(select id from public.spaces where public_id='space_alpha'),'홍길동',now(),now())");
	}

	@Test void listCountInsert를처리한다() throws Exception {
		var owned = repository.findOwnedMemberInSpace("space_alpha", "mem_1", OWNER_ID);
		assertThat(owned).isNotNull();
		var created = repository.insertMemoLog(owned.spaceInternalId(), owned.memberInternalId(), "alg_1", OffsetDateTime.parse("2026-05-08T07:00:00Z"), "coaching-note", "manual", null, new ObjectMapper().writeValueAsString(java.util.Map.of("noteText", "메모", "authorLabel", "멘토")));
		assertThat(created.id()).isEqualTo("alg_1");
		assertThat(repository.countActivityLogs(owned.spaceInternalId(), owned.memberInternalId(), "coaching-note")).isEqualTo(1);
		assertThat(repository.findActivityLogs(owned.spaceInternalId(), owned.memberInternalId(), "coaching-note", 100)).hasSize(1);
	}
}
