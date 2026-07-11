package world.yeon.backend.card_decks.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.Authenticator;
import java.net.CookieHandler;
import java.net.ProxySelector;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.Flow;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.LongSupplier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SSLSession;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class ZaiCardLearningAiGatewayTests {
	private static final String API_KEY = "test-api-key";
	private final ObjectMapper objectMapper = new ObjectMapper();

	@AfterEach
	void clearInterruptedFlag() {
		Thread.interrupted();
	}

	@Test
	void gradeParsesJsonOnlyResponseAndMetadata() throws Exception {
		FakeHttpClient client = new FakeHttpClient().respond(200, """
			{
			  "model":"glm-test",
			  "choices":[{"message":{"content":"{\\"score\\":92,\\"verdict\\":\\"pass\\",\\"missedPoints\\":[\\"용어 하나\\"],\\"feedback\\":\\"핵심을 잘 설명했습니다.\\"}"}}],
			  "usage":{"prompt_tokens":120,"completion_tokens":34,"total_tokens":154}
			}
			""");
		CardLearningAiGateway gateway = gateway(client, configuredEnvironment(), millis -> {}, tickingClock());

		CardLearningAiGateway.GradeResult result = gateway.grade("질문", "기준 정답", "사용자 답안");

		assertThat(result.score()).isEqualTo(92);
		assertThat(result.verdict()).isEqualTo("pass");
		assertThat(result.missedPoints()).containsExactly("용어 하나");
		assertThat(result.feedback()).isEqualTo("핵심을 잘 설명했습니다.");
		assertThat(result.model()).isEqualTo("grade-test");
		assertThat(result.usage()).isEqualTo(new CardLearningAiGateway.AiUsage(120, 34, 154));
		assertThat(result.latencyMs()).isEqualTo(125);
		assertThat(client.requests()).hasSize(1);

		HttpRequest request = client.requests().getFirst();
		assertThat(request.uri()).isEqualTo(URI.create("https://example.test/chat/completions"));
		assertThat(request.timeout()).contains(Duration.ofSeconds(20));
		assertThat(request.headers().firstValue("authorization")).contains("Bearer " + API_KEY);
		JsonNode requestBody = objectMapper.readTree(bodyText(request));
		assertThat(requestBody.path("response_format").path("type").asText()).isEqualTo("json_object");
		assertThat(requestBody.path("model").asText()).isEqualTo("grade-test");
		assertThat(requestBody.path("max_tokens").asInt()).isEqualTo(512);
		assertThat(requestBody.path("messages").get(1).path("content").asText()).contains("[질문]", "기준 정답", "사용자 답안");
	}

	@Test
	void generateDeckMapsQuestionAnswerToCardSides() throws Exception {
		FakeHttpClient client = new FakeHttpClient().respond(200, """
			{
			  "choices":[{"message":{"content":"{\\"title\\":\\"운영체제\\",\\"description\\":\\"핵심 개념\\",\\"items\\":[{\\"question\\":\\"프로세스란?\\",\\"answer\\":\\"실행 중인 프로그램\\"}]}"}}],
			  "usage":{"prompt_tokens":80,"completion_tokens":25}
			}
			""");
		CardLearningAiGateway gateway = gateway(client, configuredEnvironment(), millis -> {}, tickingClock());

		CardLearningAiGateway.GeneratedDeck result = gateway.generateDeck("프로세스는 실행 중인 프로그램이다.", "시험형 질문", 3);

		assertThat(result.title()).isEqualTo("운영체제");
		assertThat(result.description()).isEqualTo("핵심 개념");
		assertThat(result.items()).containsExactly(new CardLearningAiGateway.GeneratedCard("프로세스란?", "실행 중인 프로그램"));
		assertThat(result.model()).isEqualTo("generation-test");
		assertThat(result.usage().totalTokens()).isEqualTo(105);
		JsonNode requestBody = objectMapper.readTree(bodyText(client.requests().getFirst()));
		assertThat(requestBody.path("max_tokens").asInt()).isEqualTo(1_280);
	}

	@Test
	void rejectsUnsafeInputBeforeCallingProvider() {
		FakeHttpClient client = new FakeHttpClient();
		CardLearningAiGateway gateway = gateway(client, configuredEnvironment(), millis -> {}, tickingClock());

		assertThatThrownBy(() -> gateway.grade(" ", "정답", "답안"))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> {
				assertThat(error.status()).isEqualTo(400);
				assertThat(error.code()).isEqualTo(CardLearningAiException.INVALID_INPUT);
			});
		assertThatThrownBy(() -> gateway.generateDeck("원문", null, 31))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> assertThat(error.status()).isEqualTo(400));
		assertThatThrownBy(() -> gateway.grade("가".repeat(20_001), "정답", "답안"))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> assertThat(error.code())
				.isEqualTo(CardLearningAiException.INVALID_INPUT));
		assertThatThrownBy(() -> gateway.generateDeck("원".repeat(20_001), null, 1))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> assertThat(error.code())
				.isEqualTo(CardLearningAiException.INVALID_INPUT));
		assertThatThrownBy(() -> gateway.generateDeck("원문", "지".repeat(1_001), 1))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> assertThat(error.code())
				.isEqualTo(CardLearningAiException.INVALID_INPUT));
		assertThat(client.requests()).isEmpty();
	}

	@Test
	void operationSpecificModelsFallBackToSharedModel() {
		FakeHttpClient client = new FakeHttpClient()
			.respond(200, successfulGradeResponse())
			.respond(200, """
				{"choices":[{"message":{"content":"{\\"title\\":\\"제목\\",\\"items\\":[{\\"question\\":\\"질문\\",\\"answer\\":\\"답\\"}]}"}}]}
				""");
		MockEnvironment environment = new MockEnvironment()
			.withProperty("ZAI_API_KEY", API_KEY)
			.withProperty("ZAI_BASE_URL", "https://example.test/chat/completions")
			.withProperty("ZAI_MODEL", "shared-model");
		CardLearningAiGateway gateway = gateway(client, environment, millis -> {}, tickingClock());

		assertThat(gateway.grade("질문", "정답", "답안").model()).isEqualTo("shared-model");
		assertThat(gateway.generateDeck("원문", null, 1).model()).isEqualTo("shared-model");
	}

	@Test
	void missingApiKeyFailsWithoutCallingProvider() {
		FakeHttpClient client = new FakeHttpClient();
		CardLearningAiGateway gateway = gateway(client, new MockEnvironment(), millis -> {}, tickingClock());

		assertThatThrownBy(() -> gateway.grade("질문", "정답", "답안"))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> {
				assertThat(error.status()).isEqualTo(503);
				assertThat(error.code()).isEqualTo(CardLearningAiException.NOT_CONFIGURED);
			});
		assertThat(client.requests()).isEmpty();
	}

	@Test
	void invalidProviderJsonUsesStableErrorWithoutLeakingResponse() {
		FakeHttpClient client = new FakeHttpClient().respond(200, "not-json-with-sensitive-content");
		CardLearningAiGateway gateway = gateway(client, configuredEnvironment(), millis -> {}, tickingClock());

		assertThatThrownBy(() -> gateway.grade("질문", "정답", "답안"))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> {
				assertThat(error.status()).isEqualTo(502);
				assertThat(error.code()).isEqualTo(CardLearningAiException.INVALID_RESPONSE);
				assertThat(error.getMessage()).doesNotContain("sensitive-content");
			});
	}

	@Test
	void jsonNullContentIsRejectedAsInvalidProviderResponse() {
		FakeHttpClient client = new FakeHttpClient().respond(200, """
			{"choices":[{"message":{"content":"null"}}]}
			""");
		CardLearningAiGateway gateway = gateway(client, configuredEnvironment(), millis -> {}, tickingClock());

		assertThatThrownBy(() -> gateway.grade("질문", "정답", "답안"))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> {
				assertThat(error.status()).isEqualTo(502);
				assertThat(error.code()).isEqualTo(CardLearningAiException.INVALID_RESPONSE);
			});
	}

	@Test
	void timeoutUsesGatewayTimeoutError() {
		FakeHttpClient client = new FakeHttpClient().fail(new java.net.http.HttpTimeoutException("provider timeout"));
		CardLearningAiGateway gateway = gateway(client, configuredEnvironment(), millis -> {}, tickingClock());

		assertThatThrownBy(() -> gateway.grade("질문", "정답", "답안"))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> {
				assertThat(error.status()).isEqualTo(504);
				assertThat(error.code()).isEqualTo(CardLearningAiException.REQUEST_TIMEOUT);
			});
	}

	@Test
	void interruptionRestoresThreadFlag() {
		FakeHttpClient client = new FakeHttpClient().interrupt();
		CardLearningAiGateway gateway = gateway(client, configuredEnvironment(), millis -> {}, tickingClock());

		assertThatThrownBy(() -> gateway.grade("질문", "정답", "답안"))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> {
				assertThat(error.status()).isEqualTo(503);
				assertThat(error.code()).isEqualTo(CardLearningAiException.REQUEST_INTERRUPTED);
			});
		assertThat(Thread.currentThread().isInterrupted()).isTrue();
	}

	@Test
	void rateLimitRetriesTwiceThenSucceeds() {
		FakeHttpClient client = new FakeHttpClient()
			.respond(429, "{}")
			.respond(429, "{}")
			.respond(200, successfulGradeResponse());
		List<Long> delays = new ArrayList<>();
		CardLearningAiGateway gateway = gateway(client, configuredEnvironment(), delays::add, tickingClock());

		assertThat(gateway.grade("질문", "정답", "답안").score()).isEqualTo(80);
		assertThat(client.requests()).hasSize(3);
		assertThat(delays).containsExactly(250L, 500L);
	}

	@Test
	void rateLimitStopsAfterTwoRetries() {
		FakeHttpClient client = new FakeHttpClient()
			.respond(429, "{}")
			.respond(429, "{}")
			.respond(429, "{}");
		List<Long> delays = new ArrayList<>();
		CardLearningAiGateway gateway = gateway(client, configuredEnvironment(), delays::add, tickingClock());

		assertThatThrownBy(() -> gateway.grade("질문", "정답", "답안"))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> {
				assertThat(error.status()).isEqualTo(503);
				assertThat(error.code()).isEqualTo(CardLearningAiException.RATE_LIMITED);
			});
		assertThat(client.requests()).hasSize(3);
		assertThat(delays).containsExactly(250L, 500L);
	}

	@Test
	void serverErrorRetriesOnlyOnce() {
		FakeHttpClient client = new FakeHttpClient().respond(503, "{}").respond(503, "{}");
		List<Long> delays = new ArrayList<>();
		CardLearningAiGateway gateway = gateway(client, configuredEnvironment(), delays::add, tickingClock());

		assertThatThrownBy(() -> gateway.grade("질문", "정답", "답안"))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> {
				assertThat(error.status()).isEqualTo(502);
				assertThat(error.code()).isEqualTo(CardLearningAiException.UPSTREAM_UNAVAILABLE);
			});
		assertThat(client.requests()).hasSize(2);
		assertThat(delays).containsExactly(250L);
	}

	@Test
	void mixedRetryableErrorsRespectOverallAttemptCap() {
		FakeHttpClient client = new FakeHttpClient()
			.respond(429, "{}")
			.respond(503, "{}")
			.respond(429, "{}")
			.respond(200, successfulGradeResponse());
		CardLearningAiGateway gateway = gateway(client, configuredEnvironment(), millis -> {}, tickingClock());

		assertThatThrownBy(() -> gateway.grade("질문", "정답", "답안"))
			.isInstanceOfSatisfying(CardLearningAiException.class, error ->
				assertThat(error.code()).isEqualTo(CardLearningAiException.RATE_LIMITED));
		assertThat(client.requests()).hasSize(3);
	}

	@Test
	void authenticationFailureIsNotRetried() {
		FakeHttpClient client = new FakeHttpClient().respond(401, "{}");
		CardLearningAiGateway gateway = gateway(client, configuredEnvironment(), millis -> {
			throw new AssertionError("인증 오류는 재시도하면 안 됩니다.");
		}, tickingClock());

		assertThatThrownBy(() -> gateway.grade("질문", "정답", "답안"))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> {
				assertThat(error.status()).isEqualTo(502);
				assertThat(error.code()).isEqualTo(CardLearningAiException.AUTHENTICATION_FAILED);
			});
		assertThat(client.requests()).hasSize(1);
	}

	@Test
	void retrySleepInterruptionRestoresThreadFlag() {
		FakeHttpClient client = new FakeHttpClient().respond(429, "{}");
		CardLearningAiGateway gateway = gateway(client, configuredEnvironment(), millis -> {
			throw new InterruptedException("stop retry");
		}, tickingClock());

		assertThatThrownBy(() -> gateway.grade("질문", "정답", "답안"))
			.isInstanceOfSatisfying(CardLearningAiException.class, error -> assertThat(error.code())
				.isEqualTo(CardLearningAiException.REQUEST_INTERRUPTED));
		assertThat(Thread.currentThread().isInterrupted()).isTrue();
		assertThat(client.requests()).hasSize(1);
	}

	private ZaiCardLearningAiGateway gateway(
		FakeHttpClient client,
		MockEnvironment environment,
		ZaiCardLearningAiGateway.Sleeper sleeper,
		LongSupplier clock
	) {
		return new ZaiCardLearningAiGateway(client, objectMapper, environment, sleeper, clock);
	}

	private MockEnvironment configuredEnvironment() {
		return new MockEnvironment()
			.withProperty("ZAI_API_KEY", API_KEY)
			.withProperty("ZAI_BASE_URL", "https://example.test/chat/completions")
			.withProperty("ZAI_GRADING_MODEL", "grade-test")
			.withProperty("ZAI_DECK_GENERATION_MODEL", "generation-test");
	}

	private LongSupplier tickingClock() {
		long[] values = {1_000_000_000L, 1_125_000_000L};
		AtomicInteger index = new AtomicInteger();
		return () -> values[Math.min(index.getAndIncrement(), values.length - 1)];
	}

	private String successfulGradeResponse() {
		return """
			{"choices":[{"message":{"content":"{\\"score\\":80,\\"verdict\\":\\"pass\\",\\"missedPoints\\":[],\\"feedback\\":\\"통과\\"}"}}]}
			""";
	}

	private String bodyText(HttpRequest request) throws Exception {
		HttpRequest.BodyPublisher publisher = request.bodyPublisher().orElseThrow();
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		CompletableFuture<Void> completed = new CompletableFuture<>();
		publisher.subscribe(new Flow.Subscriber<>() {
			@Override
			public void onSubscribe(Flow.Subscription subscription) {
				subscription.request(Long.MAX_VALUE);
			}

			@Override
			public void onNext(ByteBuffer item) {
				byte[] bytes = new byte[item.remaining()];
				item.get(bytes);
				output.writeBytes(bytes);
			}

			@Override
			public void onError(Throwable throwable) {
				completed.completeExceptionally(throwable);
			}

			@Override
			public void onComplete() {
				completed.complete(null);
			}
		});
		completed.get();
		return output.toString(StandardCharsets.UTF_8);
	}

	private static final class FakeHttpClient extends HttpClient {
		private final Deque<Object> exchanges = new ArrayDeque<>();
		private final List<HttpRequest> requests = new ArrayList<>();

		FakeHttpClient respond(int status, String body) {
			exchanges.addLast(new ResponseSpec(status, body));
			return this;
		}

		FakeHttpClient fail(IOException error) {
			exchanges.addLast(error);
			return this;
		}

		FakeHttpClient interrupt() {
			exchanges.addLast(new InterruptedException("interrupted"));
			return this;
		}

		List<HttpRequest> requests() {
			return List.copyOf(requests);
		}

		@Override
		@SuppressWarnings("unchecked")
		public <T> HttpResponse<T> send(HttpRequest request, HttpResponse.BodyHandler<T> responseBodyHandler)
			throws IOException, InterruptedException {
			requests.add(request);
			Object exchange = exchanges.removeFirst();
			if (exchange instanceof IOException error) {
				throw error;
			}
			if (exchange instanceof InterruptedException error) {
				throw error;
			}
			ResponseSpec response = (ResponseSpec) exchange;
			return (HttpResponse<T>) new FakeHttpResponse(response.status(), response.body(), request);
		}

		@Override
		public Optional<CookieHandler> cookieHandler() {
			return Optional.empty();
		}

		@Override
		public Optional<Duration> connectTimeout() {
			return Optional.empty();
		}

		@Override
		public Redirect followRedirects() {
			return Redirect.NEVER;
		}

		@Override
		public Optional<ProxySelector> proxy() {
			return Optional.empty();
		}

		@Override
		public SSLContext sslContext() {
			return null;
		}

		@Override
		public SSLParameters sslParameters() {
			return new SSLParameters();
		}

		@Override
		public Optional<Authenticator> authenticator() {
			return Optional.empty();
		}

		@Override
		public Version version() {
			return Version.HTTP_2;
		}

		@Override
		public Optional<Executor> executor() {
			return Optional.empty();
		}

		@Override
		public <T> CompletableFuture<HttpResponse<T>> sendAsync(
			HttpRequest request,
			HttpResponse.BodyHandler<T> responseBodyHandler
		) {
			throw new UnsupportedOperationException();
		}

		@Override
		public <T> CompletableFuture<HttpResponse<T>> sendAsync(
			HttpRequest request,
			HttpResponse.BodyHandler<T> responseBodyHandler,
			HttpResponse.PushPromiseHandler<T> pushPromiseHandler
		) {
			throw new UnsupportedOperationException();
		}
	}

	private record ResponseSpec(int status, String body) {}

	private record FakeHttpResponse(int statusCode, String body, HttpRequest request) implements HttpResponse<String> {
		@Override
		public Optional<HttpResponse<String>> previousResponse() {
			return Optional.empty();
		}

		@Override
		public HttpHeaders headers() {
			return HttpHeaders.of(Map.of(), (name, value) -> true);
		}

		@Override
		public Optional<SSLSession> sslSession() {
			return Optional.empty();
		}

		@Override
		public URI uri() {
			return request.uri();
		}

		@Override
		public HttpClient.Version version() {
			return HttpClient.Version.HTTP_2;
		}
	}
}
