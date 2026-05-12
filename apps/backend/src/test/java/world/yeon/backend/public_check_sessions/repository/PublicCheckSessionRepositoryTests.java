package world.yeon.backend.public_check_sessions.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Timestamp;
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
class PublicCheckSessionRepositoryTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000943");
	@Container static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17").withDatabaseName("yeon_backend_test").withUsername("yeon_test").withPassword("yeon_test");
	@Autowired private PublicCheckSessionRepository repository;
	@Autowired private JdbcTemplate jdbcTemplate;

	@DynamicPropertySource static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add("BACKEND_JDBC_DATABASE_URL", postgres::getJdbcUrl);
		registry.add("BACKEND_JDBC_DATABASE_USERNAME", postgres::getUsername);
		registry.add("BACKEND_JDBC_DATABASE_PASSWORD", postgres::getPassword);
	}

	@BeforeEach void setUpFixture() {
		jdbcTemplate.execute("create table if not exists public.users (id uuid primary key, email varchar(320) not null unique, display_name varchar(80), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), role varchar(32) not null default 'user')");
		jdbcTemplate.execute("create table if not exists public.spaces (id bigint primary key generated always as identity, public_id text not null unique, name varchar(100) not null, description text, created_by_user_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.public_check_sessions (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, title varchar(120) not null, public_token text not null unique, status varchar(20) not null, check_mode varchar(40) not null, enabled_methods text[] not null, verification_method varchar(40) not null default 'name_phone_last4', opens_at timestamptz, closes_at timestamptz, location_label varchar(120), latitude double precision, longitude double precision, radius_meters integer, created_by_user_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.update("delete from public.public_check_sessions");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");
		jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", OWNER_ID, "owner@example.com", "Owner");
		jdbcTemplate.update("insert into public.spaces (public_id,name,created_by_user_id,created_at,updated_at) values ('space_alpha','알파',?,now(),now())", OWNER_ID);
		jdbcTemplate.update("insert into public.public_check_sessions (public_id,space_id,title,public_token,status,check_mode,enabled_methods,verification_method,created_by_user_id,created_at,updated_at) values ('pcs_1',(select id from public.spaces where public_id='space_alpha'),'체크인','token123','active','attendance_and_assignment',ARRAY['qr']::text[],'name_phone_last4',?,now(),now())", OWNER_ID);
	}

	@Test void ownedSession을수정한다() {
		Long spaceId = repository.findOwnedSpaceInternalId("space_alpha", OWNER_ID);
		assertThat(spaceId).isNotNull();
		var updated = repository.updateOwnedSession(spaceId, "pcs_1", "closed", OffsetDateTime.parse("2026-05-08T09:00:00Z"), OffsetDateTime.parse("2026-05-08T08:00:00Z"));
		assertThat(updated).isNotNull();
		assertThat(updated.status()).isEqualTo("closed");
		assertThat(updated.closesAt()).isEqualTo(OffsetDateTime.parse("2026-05-08T09:00:00Z"));
	}

	@Test void ownedSession을생성한다() {
		Long spaceId = repository.findOwnedSpaceInternalId("space_alpha", OWNER_ID);
		var created = repository.insertSession(spaceId, "pcs_2", "새 체크인", "token999", "active", "attendance_and_assignment", java.util.List.of("qr"), null, null, null, null, null, null, OWNER_ID, OffsetDateTime.parse("2026-05-08T08:00:00Z"));
		assertThat(created).isNotNull();
		assertThat(created.id()).isEqualTo("pcs_2");
	}
}
