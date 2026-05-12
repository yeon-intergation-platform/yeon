package world.yeon.backend.sheet_export.snapshot.repository;

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
class SheetExportSnapshotRepositoryTests {

	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000794");

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired private SheetExportSnapshotRepository repository;
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
		jdbcTemplate.update("delete from public.sheet_integration_member_snapshots");
		jdbcTemplate.update("delete from public.sheet_integrations");
		jdbcTemplate.update("delete from public.spaces");
		jdbcTemplate.update("delete from public.users");
		insertUser();
		insertSpace("space_alpha");
		insertSpace("space_beta");
		insertIntegration("space_alpha", "sheet-1", "2026-05-08T00:00:00Z");
		insertIntegration("space_beta", "sheet-2", null);
		insertSnapshot("shs_1", "space_alpha", "sheet-1", "mem_1", "{\"core\":{\"name\":\"홍길동\",\"email\":null,\"phone\":null,\"status\":\"active\",\"initialRiskLevel\":null},\"customFields\":{\"메모\":\"값\"}}", "hash-1", "2026-05-08T00:00:00Z");
	}

	@Test
	void integration과snapshot을조회한다() {
		var integration = repository.findIntegration("space_alpha", "sheet-1");
		var snapshots = repository.findSnapshots(integration.integrationInternalId());

		assertThat(integration).isNotNull();
		assertThat(integration.lastSyncedAt()).isEqualTo(OffsetDateTime.parse("2026-05-08T00:00:00Z"));
		assertThat(snapshots).hasSize(1);
		assertThat(snapshots.getFirst().memberId()).isEqualTo("mem_1");
		assertThat(snapshots.getFirst().basePayloadHash()).isEqualTo("hash-1");
	}

	@Test
	void integrationLastSyncedAt을갱신한다() {
		var integration = repository.findIntegration("space_alpha", "sheet-1");
		repository.updateIntegrationLastSyncedAt(integration.integrationInternalId(), OffsetDateTime.parse("2026-05-08T02:00:00Z"));

		var updated = repository.findIntegration("space_alpha", "sheet-1");
		assertThat(updated.lastSyncedAt()).isEqualTo(OffsetDateTime.parse("2026-05-08T02:00:00Z"));
	}

	@Test
	void snapshot전체교체를수행한다() {
		var integration = repository.findIntegration("space_alpha", "sheet-1");
		repository.replaceSnapshots(
			integration.integrationInternalId(),
			integration.spaceInternalId(),
			OffsetDateTime.parse("2026-05-08T01:00:00Z"),
			java.util.List.of(new SheetExportSnapshotRepository.SnapshotReplaceRow(
				"shs_2",
				"mem_2",
				"{\"core\":{\"name\":\"김영희\",\"email\":null,\"phone\":null,\"status\":\"active\",\"initialRiskLevel\":null},\"customFields\":{}}",
				"hash-2"
			))
		);

		var snapshots = repository.findSnapshots(integration.integrationInternalId());
		assertThat(snapshots).hasSize(1);
		assertThat(snapshots.getFirst().memberId()).isEqualTo("mem_2");
		assertThat(snapshots.getFirst().basePayloadHash()).isEqualTo("hash-2");
	}

	private void createFixtureTables() {
		jdbcTemplate.execute("create table if not exists public.users (id uuid primary key, email varchar(320) not null unique, display_name varchar(80), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), role varchar(32) not null default 'user')");
		jdbcTemplate.execute("create table if not exists public.spaces (id bigint primary key generated always as identity, public_id text not null unique, name varchar(100) not null, description text, created_by_user_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.sheet_integrations (id bigint primary key generated always as identity, public_id text not null unique, space_id bigint not null references public.spaces(id) on delete cascade, sheet_url text not null, sheet_id varchar(200) not null, data_type varchar(30) not null, column_mapping jsonb, last_synced_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
		jdbcTemplate.execute("create table if not exists public.sheet_integration_member_snapshots (id bigint primary key generated always as identity, public_id text not null unique, integration_id bigint not null references public.sheet_integrations(id) on delete cascade, space_id bigint not null references public.spaces(id) on delete cascade, member_id text not null, base_payload jsonb not null, base_payload_hash text not null, exported_at timestamptz not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now())");
	}

	private void insertUser() {
		jdbcTemplate.update("insert into public.users (id,email,display_name,created_at,updated_at,role) values (?,?,?,now(),now(),'user')", OWNER_ID, "sheet-export-snapshot@example.com", "Owner");
	}

	private void insertSpace(String publicId) {
		jdbcTemplate.update("insert into public.spaces (public_id,name,description,created_by_user_id,created_at,updated_at) values (?,?,null,?,now(),now())", publicId, publicId, OWNER_ID);
	}

	private void insertIntegration(String spacePublicId, String sheetId, String lastSyncedAt) {
		jdbcTemplate.update("insert into public.sheet_integrations (public_id,space_id,sheet_url,sheet_id,data_type,column_mapping,last_synced_at,created_at,updated_at) select ?, id, ?, ?, 'export', null, cast(? as timestamptz), now(), now() from public.spaces where public_id=?", "sht_" + sheetId, "https://docs.google.com/spreadsheets/d/" + sheetId + "/edit", sheetId, lastSyncedAt, spacePublicId);
	}

	private void insertSnapshot(String publicId, String spacePublicId, String sheetId, String memberId, String basePayload, String basePayloadHash, String exportedAt) {
		jdbcTemplate.update("insert into public.sheet_integration_member_snapshots (public_id,integration_id,space_id,member_id,base_payload,base_payload_hash,exported_at,created_at,updated_at) select ?, i.id, s.id, ?, cast(? as jsonb), ?, cast(? as timestamptz), now(), now() from public.spaces s join public.sheet_integrations i on i.space_id=s.id and i.sheet_id=? where s.public_id=?", publicId, memberId, basePayload, basePayloadHash, exportedAt, sheetId, spacePublicId);
	}
}
