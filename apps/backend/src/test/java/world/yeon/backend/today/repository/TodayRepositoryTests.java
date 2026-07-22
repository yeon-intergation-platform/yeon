package world.yeon.backend.today.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
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
class TodayRepositoryTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000001101");
	private static final UUID ACTIVITY_ID = UUID.fromString("00000000-0000-0000-0000-000000001102");
	private static final LocalDate DATE = LocalDate.parse("2026-07-22");
	private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-07-22T12:00:00Z");

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired private TodayRepository repository;
	@Autowired private JdbcTemplate jdbcTemplate;

	@DynamicPropertySource
	static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add(
			"DATABASE_URL",
			() -> "postgresql://" + postgres.getUsername() + ":" + postgres.getPassword() + "@"
				+ postgres.getHost() + ":" + postgres.getFirstMappedPort() + "/" + postgres.getDatabaseName()
		);
	}

	@BeforeEach
	void setUpFixture() {
		jdbcTemplate.update("delete from public.today_activity_slots");
		jdbcTemplate.update("delete from public.today_activity_types");
		jdbcTemplate.update("delete from public.users where id = ?", OWNER_ID);
		jdbcTemplate.update(
			"insert into public.users (id, email, display_name, created_at, updated_at, role) values (?, ?, ?, now(), now(), 'user')",
			OWNER_ID,
			"today-record-owner@example.com",
			"Today 기록 사용자"
		);
		jdbcTemplate.update("""
			insert into public.today_activity_types (
			  id, owner_user_id, name, color_token, icon_key, sort_order, active, version, created_at, updated_at
			) values (?, ?, '휴식', 'yellow', 'coffee', 0, true, 0, ?, ?)
			""", ACTIVITY_ID, OWNER_ID, NOW, NOW);
	}

	@Test
	void 한시간에는같은활동도두번까지기록하고세번째는거부한다() {
		assertThat(repository.appendActivitySlot(OWNER_ID, DATE, 18, ACTIVITY_ID, "산책", NOW)).isTrue();
		assertThat(repository.appendActivitySlot(OWNER_ID, DATE, 18, ACTIVITY_ID, "커피", NOW)).isTrue();
		assertThat(repository.appendActivitySlot(OWNER_ID, DATE, 18, ACTIVITY_ID, "낮잠", NOW)).isFalse();

		assertThat(repository.listActivitySlots(OWNER_ID, DATE))
			.extracting(TodayRepository.ActivitySlotRow::entryIndex, TodayRepository.ActivitySlotRow::note)
			.containsExactly(
				org.assertj.core.groups.Tuple.tuple(0, "산책"),
				org.assertj.core.groups.Tuple.tuple(1, "커피")
			);
	}

	@Test
	void 첫기록을삭제하면두번째기록을첫순서로당긴다() {
		repository.appendActivitySlot(OWNER_ID, DATE, 18, ACTIVITY_ID, "산책", NOW);
		repository.appendActivitySlot(OWNER_ID, DATE, 18, ACTIVITY_ID, "커피", NOW);

		assertThat(repository.deleteActivitySlotEntry(OWNER_ID, DATE, 18, 0)).isTrue();

		assertThat(repository.listActivitySlots(OWNER_ID, DATE))
			.extracting(TodayRepository.ActivitySlotRow::entryIndex, TodayRepository.ActivitySlotRow::note)
			.containsExactly(org.assertj.core.groups.Tuple.tuple(0, "커피"));
	}
}
