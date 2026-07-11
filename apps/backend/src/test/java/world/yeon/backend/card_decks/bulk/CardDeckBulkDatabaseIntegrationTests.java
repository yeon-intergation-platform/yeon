package world.yeon.backend.card_decks.bulk;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockReset;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import world.yeon.backend.card_decks.bulk.dto.CreateCardDeckBulkItemRequest;
import world.yeon.backend.card_decks.bulk.dto.CreateCardDeckBulkRequest;
import world.yeon.backend.card_decks.bulk.dto.CreateCardDeckBulkResponse;
import world.yeon.backend.card_decks.bulk.repository.CardDeckBulkRepository;
import world.yeon.backend.card_decks.bulk.service.CardDeckBulkService;

@SpringBootTest
@ActiveProfiles("dev.local")
@Testcontainers
class CardDeckBulkDatabaseIntegrationTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-0000000009b1");
	private static final UUID IDEMPOTENCY_KEY = UUID.fromString("00000000-0000-0000-0000-0000000009b2");

	@Container
	static PostgreSQLContainer postgres = new PostgreSQLContainer(DockerImageName.parse("postgres:17"))
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired private CardDeckBulkService service;
	@Autowired private JdbcTemplate jdbcTemplate;
	@MockitoSpyBean(reset = MockReset.BEFORE) private CardDeckBulkRepository repository;

	@DynamicPropertySource
	static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add(
			"DATABASE_URL",
			() -> "postgresql://" + postgres.getUsername() + ":" + postgres.getPassword()
				+ "@" + postgres.getHost() + ":" + postgres.getFirstMappedPort()
				+ "/" + postgres.getDatabaseName()
		);
	}

	@BeforeEach
	void setUpFixture() {
		jdbcTemplate.update("delete from yeon_backend.card_recall_attempts where owner_user_id = ?", USER_ID);
		jdbcTemplate.update("delete from yeon_backend.card_deck_bulk_requests where owner_user_id = ?", USER_ID);
		jdbcTemplate.update("delete from yeon_backend.card_ai_request_usage where user_id = ?", USER_ID);
		jdbcTemplate.update(
			"delete from public.card_deck_items where deck_id in (select id from public.card_decks where owner_user_id = ?)",
			USER_ID
		);
		jdbcTemplate.update("delete from public.card_decks where owner_user_id = ?", USER_ID);
		jdbcTemplate.update("delete from public.experience_log where user_id = ?", USER_ID);
		jdbcTemplate.update("delete from public.user_experience where user_id = ?", USER_ID);
		jdbcTemplate.update("delete from public.users where id = ?", USER_ID);
		jdbcTemplate.update(
			"insert into public.users (id, email, display_name) values (?, ?, ?)",
			USER_ID,
			"card-bulk-db@example.com",
			"Card Bulk DB"
		);
	}

	@Test
	void flyway가V21카드스키마를실제데이터베이스에적용한다() {
		Boolean migrationSucceeded = jdbcTemplate.queryForObject(
			"select success from yeon_backend.flyway_schema_history where version = '21'",
			Boolean.class
		);
		String reservedTokensColumnType = jdbcTemplate.queryForObject(
			"""
			select data_type
			from information_schema.columns
			where table_schema = 'yeon_backend'
			  and table_name = 'card_ai_request_executions'
			  and column_name = 'reserved_tokens'
			""",
			String.class
		);

		assertThat(migrationSucceeded).isTrue();
		assertThat(regclass("yeon_backend.card_ai_request_usage"))
			.isEqualTo("yeon_backend.card_ai_request_usage");
		assertThat(regclass("yeon_backend.card_ai_request_executions"))
			.isEqualTo("yeon_backend.card_ai_request_executions");
		assertThat(regclass("yeon_backend.card_deck_bulk_requests"))
			.isEqualTo("yeon_backend.card_deck_bulk_requests");
		assertThat(regclass("yeon_backend.card_recall_attempts"))
			.isEqualTo("yeon_backend.card_recall_attempts");
		assertThat(reservedTokensColumnType).isEqualTo("integer");
	}

	@Test
	void 카드중간삽입이실패하면덱과앞선카드와멱등결과를모두롤백한다() {
		AtomicInteger insertCount = new AtomicInteger();
		doAnswer(invocation -> {
			if (insertCount.incrementAndGet() == 2) {
				throw new IllegalStateException("테스트용 두 번째 카드 삽입 실패");
			}
			return invocation.callRealMethod();
		}).when(repository).insertItem(anyString(), anyLong(), anyString(), anyString(), any(), any());

		assertThatThrownBy(() -> service.create(USER_ID, request()))
			.hasRootCauseInstanceOf(IllegalStateException.class)
			.hasRootCauseMessage("테스트용 두 번째 카드 삽입 실패");

		assertThat(count("select count(*) from public.card_decks where owner_user_id = ?", USER_ID)).isZero();
		assertThat(count(
			"select count(*) from public.card_deck_items where deck_id in (select id from public.card_decks where owner_user_id = ?)",
			USER_ID
		)).isZero();
		assertThat(count(
			"select count(*) from yeon_backend.card_deck_bulk_requests where owner_user_id = ?",
			USER_ID
		)).isZero();
		assertThat(count("select count(*) from public.experience_log where user_id = ?", USER_ID)).isZero();
		assertThat(count("select count(*) from public.user_experience where user_id = ?", USER_ID)).isZero();
	}

	@Test
	void 동일멱등키동시요청은advisory잠금으로직렬화되어한덱만생성한다() throws Exception {
		CountDownLatch bothRequestsReachedLock = new CountDownLatch(2);
		doAnswer(invocation -> {
			bothRequestsReachedLock.countDown();
			if (!bothRequestsReachedLock.await(10, TimeUnit.SECONDS)) {
				throw new AssertionError("두 동시 요청이 advisory lock 진입점에 도달하지 못했습니다.");
			}
			return invocation.callRealMethod();
		}).when(repository).acquireCreationLock(USER_ID, IDEMPOTENCY_KEY);

		CreateCardDeckBulkResponse first;
		CreateCardDeckBulkResponse second;
		try (var executor = Executors.newFixedThreadPool(2)) {
			Future<CreateCardDeckBulkResponse> firstRequest = executor.submit(() -> service.create(USER_ID, request()));
			Future<CreateCardDeckBulkResponse> secondRequest = executor.submit(() -> service.create(USER_ID, request()));
			first = firstRequest.get(20, TimeUnit.SECONDS);
			second = secondRequest.get(20, TimeUnit.SECONDS);
		}

		assertThat(second).isEqualTo(first);
		assertThat(count("select count(*) from public.card_decks where owner_user_id = ?", USER_ID)).isEqualTo(1);
		assertThat(count(
			"select count(*) from public.card_deck_items where deck_id in (select id from public.card_decks where owner_user_id = ?)",
			USER_ID
		)).isEqualTo(2);
		assertThat(count(
			"select count(*) from yeon_backend.card_deck_bulk_requests where owner_user_id = ? and idempotency_key = ?",
			USER_ID,
			IDEMPOTENCY_KEY
		)).isEqualTo(1);
		assertThat(jdbcTemplate.queryForObject(
			"select request_fingerprint from yeon_backend.card_deck_bulk_requests where owner_user_id = ? and idempotency_key = ?",
			String.class,
			USER_ID,
			IDEMPOTENCY_KEY
		)).hasSize(64);
		assertThat(jdbcTemplate.queryForObject(
			"select response_payload -> 'deck' ->> 'id' from yeon_backend.card_deck_bulk_requests where owner_user_id = ? and idempotency_key = ?",
			String.class,
			USER_ID,
			IDEMPOTENCY_KEY
		)).isEqualTo(first.deck().id());
		assertThat(count(
			"select jsonb_array_length(response_payload -> 'items') from yeon_backend.card_deck_bulk_requests where owner_user_id = ? and idempotency_key = ?",
			USER_ID,
			IDEMPOTENCY_KEY
		)).isEqualTo(2);
		assertThat(count("select count(*) from public.experience_log where user_id = ?", USER_ID)).isEqualTo(1);
		assertThat(count("select count(*) from public.user_experience where user_id = ?", USER_ID)).isEqualTo(1);
		verify(repository, times(2)).acquireCreationLock(USER_ID, IDEMPOTENCY_KEY);
	}

	@Test
	void 삭제한덱의bulk멱등원장은함께삭제되어같은키가삭제된결과를재생하지않는다() {
		CreateCardDeckBulkResponse original = service.create(USER_ID, request());

		jdbcTemplate.update("delete from public.card_decks where public_id = ?", original.deck().id());

		assertThat(count(
			"select count(*) from yeon_backend.card_deck_bulk_requests where owner_user_id = ? and idempotency_key = ?",
			USER_ID,
			IDEMPOTENCY_KEY
		)).isZero();

		CreateCardDeckBulkResponse recreated = service.create(USER_ID, request());

		assertThat(recreated.deck().id()).isNotEqualTo(original.deck().id());
		assertThat(count("select count(*) from public.card_decks where owner_user_id = ?", USER_ID)).isEqualTo(1);
	}

	private String regclass(String name) {
		return jdbcTemplate.queryForObject("select to_regclass(?)::text", String.class, name);
	}

	private long count(String sql, Object... arguments) {
		Long value = jdbcTemplate.queryForObject(sql, Long.class, arguments);
		return value == null ? 0 : value;
	}

	private CreateCardDeckBulkRequest request() {
		return new CreateCardDeckBulkRequest(
			IDEMPOTENCY_KEY,
			"한국사",
			"근현대사",
			List.of(
				new CreateCardDeckBulkItemRequest("질문 1", "답 1", null),
				new CreateCardDeckBulkItemRequest("질문 2", "답 2", null)
			)
		);
	}
}
