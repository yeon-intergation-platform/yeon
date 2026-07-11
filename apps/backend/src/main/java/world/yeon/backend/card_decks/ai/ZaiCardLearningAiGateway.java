package world.yeon.backend.card_decks.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.function.LongSupplier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public final class ZaiCardLearningAiGateway implements CardLearningAiGateway {
	static final String DEFAULT_BASE_URL = "https://api.z.ai/api/paas/v4/chat/completions";
	static final String DEFAULT_MODEL = "glm-4.5-flash";
	static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(20);
	static final int MAX_CARD_TEXT_LENGTH = 20_000;
	static final int MAX_SOURCE_TEXT_LENGTH = 20_000;
	static final int MAX_INSTRUCTION_LENGTH = 1_000;
	static final int MIN_GENERATED_ITEMS = 1;
	static final int MAX_GENERATED_ITEMS = 30;

	private static final int MAX_RATE_LIMIT_RETRIES = 2;
	private static final int MAX_SERVER_ERROR_RETRIES = 1;
	private static final int MAX_TOTAL_ATTEMPTS = 3;
	private static final int GRADE_MAX_OUTPUT_TOKENS = 512;
	private static final int DECK_BASE_OUTPUT_TOKENS = 512;
	private static final int DECK_OUTPUT_TOKENS_PER_ITEM = 256;
	private static final int DECK_MAX_OUTPUT_TOKENS = 8_192;
	private static final long BASE_RETRY_DELAY_MILLIS = 250;
	private static final String GRADE_SYSTEM_PROMPT = """
		너는 학습 답안 채점자다. 정답의 핵심 내용을 사용자 답안이 담았는지 평가한다.
		표현, 어순, 조사 차이는 감점하지 말고 핵심 개념 포함 여부만 본다.
		반드시 JSON 객체만 출력한다.
		형식: {"score":0~100 정수,"verdict":"pass 또는 fail","missedPoints":["놓친 핵심"],"feedback":"한 줄 한국어 피드백"}
		""";
	private static final String GENERATE_SYSTEM_PROMPT = """
		너는 학습용 질문-답변 카드 덱 생성자다. 제공된 원문에 근거해서만 카드를 만든다.
		각 질문은 하나의 명확한 지식을 묻고, 답은 원문만으로 검증 가능해야 한다.
		반드시 JSON 객체만 출력한다.
		형식: {"title":"덱 제목","description":"선택 설명","items":[{"question":"질문","answer":"정답"}]}
		""";

	private final HttpClient httpClient;
	private final ObjectMapper objectMapper;
	private final Environment environment;
	private final Sleeper sleeper;
	private final LongSupplier nanoTime;

	@Autowired
	public ZaiCardLearningAiGateway(HttpClient httpClient, ObjectMapper objectMapper, Environment environment) {
		this(httpClient, objectMapper, environment, Thread::sleep, System::nanoTime);
	}

	ZaiCardLearningAiGateway(
		HttpClient httpClient,
		ObjectMapper objectMapper,
		Environment environment,
		Sleeper sleeper,
		LongSupplier nanoTime
	) {
		this.httpClient = Objects.requireNonNull(httpClient);
		this.objectMapper = Objects.requireNonNull(objectMapper);
		this.environment = Objects.requireNonNull(environment);
		this.sleeper = Objects.requireNonNull(sleeper);
		this.nanoTime = Objects.requireNonNull(nanoTime);
	}

	@Override
	public GradeResult grade(String question, String referenceAnswer, String userAnswer) {
		String normalizedQuestion = requireText(question, MAX_CARD_TEXT_LENGTH, "질문");
		String normalizedReferenceAnswer = requireText(referenceAnswer, MAX_CARD_TEXT_LENGTH, "정답");
		String normalizedUserAnswer = requireText(userAnswer, MAX_CARD_TEXT_LENGTH, "사용자 답안");
		String prompt = "[질문]\n" + normalizedQuestion
			+ "\n\n[정답]\n" + normalizedReferenceAnswer
			+ "\n\n[사용자 답안]\n" + normalizedUserAnswer;
		Completion completion = complete(
			GRADE_SYSTEM_PROMPT,
			prompt,
			0.2,
			"ZAI_GRADING_MODEL",
			GRADE_MAX_OUTPUT_TOKENS
		);
		return parseGrade(completion);
	}

	@Override
	public GeneratedDeck generateDeck(String sourceText, String instruction, int itemCount) {
		String normalizedSource = requireText(sourceText, MAX_SOURCE_TEXT_LENGTH, "원문");
		String normalizedInstruction = optionalText(instruction, MAX_INSTRUCTION_LENGTH, "생성 지침");
		if (itemCount < MIN_GENERATED_ITEMS || itemCount > MAX_GENERATED_ITEMS) {
			throw invalidInput("카드 수는 " + MIN_GENERATED_ITEMS + "개 이상 " + MAX_GENERATED_ITEMS + "개 이하여야 합니다.");
		}
		String prompt = "[생성 카드 수]\n" + itemCount
			+ "\n\n[추가 지침]\n" + (normalizedInstruction == null ? "없음" : normalizedInstruction)
			+ "\n\n[원문]\n" + normalizedSource;
		int maxOutputTokens = Math.min(
			DECK_MAX_OUTPUT_TOKENS,
			DECK_BASE_OUTPUT_TOKENS + itemCount * DECK_OUTPUT_TOKENS_PER_ITEM
		);
		Completion completion = complete(
			GENERATE_SYSTEM_PROMPT,
			prompt,
			0.3,
			"ZAI_DECK_GENERATION_MODEL",
			maxOutputTokens
		);
		return parseGeneratedDeck(completion, itemCount);
	}

	private Completion complete(
		String systemPrompt,
		String userPrompt,
		double temperature,
		String modelProperty,
		int maxOutputTokens
	) {
		String apiKey = requiredApiKey();
		String model = selectedModel(modelProperty);

		ObjectNode payload = objectMapper.createObjectNode();
		payload.put("model", model);
		payload.put("temperature", temperature);
		payload.put("max_tokens", maxOutputTokens);
		payload.set("response_format", objectMapper.createObjectNode().put("type", "json_object"));
		ArrayNode messages = payload.putArray("messages");
		messages.add(message("system", systemPrompt));
		messages.add(message("user", userPrompt));

		HttpRequest request;
		try {
			request = HttpRequest.newBuilder(URI.create(baseUrl()))
				.timeout(REQUEST_TIMEOUT)
				.header("content-type", "application/json")
				.header("authorization", "Bearer " + apiKey)
				.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
				.build();
		} catch (JsonProcessingException | IllegalArgumentException error) {
			throw new CardLearningAiException(500, CardLearningAiException.NOT_CONFIGURED,
				"AI 서비스 설정이 올바르지 않습니다.", error);
		}

		long startedAt = nanoTime.getAsLong();
		HttpResponse<String> response = sendWithRetry(request);
		long latencyMs = Math.max(0, TimeUnit.NANOSECONDS.toMillis(nanoTime.getAsLong() - startedAt));
		return parseCompletion(response.body(), model, latencyMs);
	}

	private ObjectNode message(String role, String content) {
		return objectMapper.createObjectNode().put("role", role).put("content", content);
	}

	private HttpResponse<String> sendWithRetry(HttpRequest request) {
		int rateLimitRetries = 0;
		int serverErrorRetries = 0;
		int attempts = 0;
		while (true) {
			attempts++;
			HttpResponse<String> response = send(request);
			int status = response.statusCode();
			if (status >= 200 && status < 300) {
				return response;
			}
			if (status == 429 && rateLimitRetries < MAX_RATE_LIMIT_RETRIES && attempts < MAX_TOTAL_ATTEMPTS) {
				rateLimitRetries++;
				sleepBeforeRetry(BASE_RETRY_DELAY_MILLIS * rateLimitRetries);
				continue;
			}
			if (
				status >= 500
					&& status < 600
					&& serverErrorRetries < MAX_SERVER_ERROR_RETRIES
					&& attempts < MAX_TOTAL_ATTEMPTS
			) {
				serverErrorRetries++;
				sleepBeforeRetry(BASE_RETRY_DELAY_MILLIS);
				continue;
			}
			throw statusException(status);
		}
	}

	private HttpResponse<String> send(HttpRequest request) {
		try {
			return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
		} catch (HttpTimeoutException error) {
			throw new CardLearningAiException(504, CardLearningAiException.REQUEST_TIMEOUT,
				"AI 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.", error);
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new CardLearningAiException(503, CardLearningAiException.REQUEST_INTERRUPTED,
				"AI 요청이 중단되었습니다. 잠시 후 다시 시도해 주세요.", error);
		} catch (IOException error) {
			throw new CardLearningAiException(502, CardLearningAiException.UPSTREAM_UNAVAILABLE,
				"AI 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.", error);
		}
	}

	private void sleepBeforeRetry(long millis) {
		try {
			sleeper.sleep(millis);
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new CardLearningAiException(503, CardLearningAiException.REQUEST_INTERRUPTED,
				"AI 요청이 중단되었습니다. 잠시 후 다시 시도해 주세요.", error);
		}
	}

	private CardLearningAiException statusException(int status) {
		if (status == 401 || status == 403) {
			return new CardLearningAiException(502, CardLearningAiException.AUTHENTICATION_FAILED,
				"AI 서비스 인증에 실패했습니다.");
		}
		if (status == 429) {
			return new CardLearningAiException(503, CardLearningAiException.RATE_LIMITED,
				"AI 요청이 많습니다. 잠시 후 다시 시도해 주세요.");
		}
		if (status >= 500) {
			return new CardLearningAiException(502, CardLearningAiException.UPSTREAM_UNAVAILABLE,
				"AI 서비스가 응답하지 않습니다. 잠시 후 다시 시도해 주세요.");
		}
		return new CardLearningAiException(502, CardLearningAiException.UPSTREAM_REJECTED,
			"AI 서비스가 요청을 처리하지 못했습니다.");
	}

	private Completion parseCompletion(String body, String model, long latencyMs) {
		if (body == null || body.isBlank()) {
			throw invalidResponse(null);
		}
		try {
			JsonNode root = objectMapper.readTree(body);
			if (root == null || !root.isObject()) {
				throw invalidResponse(null);
			}
			String content = textOrNull(root.path("choices").path(0).path("message").path("content"));
			if (content == null) {
				throw invalidResponse(null);
			}
			JsonNode contentNode = objectMapper.readTree(content);
			if (contentNode == null || !contentNode.isObject()) {
				throw invalidResponse(null);
			}
			JsonNode usage = root.path("usage");
			return new Completion(
				contentNode,
				model,
				nullableInt(usage.path("prompt_tokens")),
				nullableInt(usage.path("completion_tokens")),
				latencyMs
			);
		} catch (CardLearningAiException error) {
			throw error;
		} catch (JsonProcessingException | NullPointerException error) {
			throw invalidResponse(error);
		}
	}

	private GradeResult parseGrade(Completion completion) {
		JsonNode result = completion.content();
		if (!result.isObject() || !result.path("score").canConvertToInt()) {
			throw invalidResponse(null);
		}
		int score = result.path("score").asInt();
		if (score < 0 || score > 100) {
			throw invalidResponse(null);
		}
		String verdict = textOrNull(result.path("verdict"));
		if (verdict == null) {
			verdict = score >= 70 ? "pass" : "fail";
		} else {
			verdict = verdict.toLowerCase(Locale.ROOT);
			if (!verdict.equals("pass") && !verdict.equals("fail")) {
				throw invalidResponse(null);
			}
		}
		String feedback = requireResponseText(result.path("feedback"));
		List<String> missedPoints = readTextArray(result.path("missedPoints"), MAX_GENERATED_ITEMS);
		return new GradeResult(score, verdict, missedPoints, feedback, completion.model(),
			completion.inputTokens(), completion.outputTokens(), completion.latencyMs());
	}

	private GeneratedDeck parseGeneratedDeck(Completion completion, int requestedItemCount) {
		JsonNode result = completion.content();
		String title = requireResponseText(result.path("title"));
		String description = optionalResponseText(result.path("description"));
		JsonNode itemsNode = result.path("items");
		if (!itemsNode.isArray() || itemsNode.isEmpty() || itemsNode.size() > requestedItemCount) {
			throw invalidResponse(null);
		}
		List<GeneratedCard> items = new ArrayList<>(itemsNode.size());
		for (JsonNode item : itemsNode) {
			String frontText = requireResponseText(item.path("question"));
			String backText = requireResponseText(item.path("answer"));
			if (frontText.length() > MAX_CARD_TEXT_LENGTH || backText.length() > MAX_CARD_TEXT_LENGTH) {
				throw invalidResponse(null);
			}
			items.add(new GeneratedCard(frontText, backText));
		}
		return new GeneratedDeck(title, description, items, completion.model(), completion.inputTokens(),
			completion.outputTokens(), completion.latencyMs());
	}

	private List<String> readTextArray(JsonNode node, int maxItems) {
		if (node.isMissingNode() || node.isNull()) {
			return List.of();
		}
		if (!node.isArray() || node.size() > maxItems) {
			throw invalidResponse(null);
		}
		List<String> values = new ArrayList<>(node.size());
		for (JsonNode item : node) {
			values.add(requireResponseText(item));
		}
		return List.copyOf(values);
	}

	private String requireResponseText(JsonNode node) {
		String value = textOrNull(node);
		if (value == null || value.length() > MAX_CARD_TEXT_LENGTH) {
			throw invalidResponse(null);
		}
		return value;
	}

	private String optionalResponseText(JsonNode node) {
		if (node.isMissingNode() || node.isNull()) {
			return null;
		}
		return requireResponseText(node);
	}

	private String requireText(String value, int maxLength, String label) {
		String normalized = optionalText(value, maxLength, label);
		if (normalized == null) {
			throw invalidInput(label + "을(를) 입력해 주세요.");
		}
		return normalized;
	}

	private String optionalText(String value, int maxLength, String label) {
		if (value == null || value.isBlank()) {
			return null;
		}
		String normalized = value.trim();
		if (normalized.length() > maxLength) {
			throw invalidInput(label + "은(는) " + maxLength + "자 이하여야 합니다.");
		}
		return normalized;
	}

	private String requiredApiKey() {
		String apiKey = optionalProperty("ZAI_API_KEY");
		if (apiKey == null) {
			throw new CardLearningAiException(503, CardLearningAiException.NOT_CONFIGURED,
				"AI 서비스가 설정되지 않았습니다.");
		}
		return apiKey;
	}

	private String baseUrl() {
		String configured = optionalProperty("ZAI_BASE_URL");
		return configured == null ? DEFAULT_BASE_URL : configured;
	}

	private String selectedModel(String specificProperty) {
		String specific = optionalProperty(specificProperty);
		if (specific != null) {
			return specific;
		}
		String shared = optionalProperty("ZAI_MODEL");
		return shared == null ? DEFAULT_MODEL : shared;
	}

	private String optionalProperty(String name) {
		String value = environment.getProperty(name);
		if (value == null || value.isBlank()) {
			value = environment.getProperty(name.toLowerCase(Locale.ROOT).replace('_', '.'));
		}
		return value == null || value.isBlank() ? null : value.trim();
	}

	private String textOrNull(JsonNode node) {
		if (!node.isTextual()) {
			return null;
		}
		String value = node.asText().trim();
		return value.isEmpty() ? null : value;
	}

	private Integer nullableInt(JsonNode node) {
		return node.canConvertToInt() && node.asInt() >= 0 ? node.asInt() : null;
	}

	private CardLearningAiException invalidInput(String message) {
		return new CardLearningAiException(400, CardLearningAiException.INVALID_INPUT, message);
	}

	private CardLearningAiException invalidResponse(Throwable cause) {
		return new CardLearningAiException(502, CardLearningAiException.INVALID_RESPONSE,
			"AI 응답 형식이 올바르지 않습니다.", cause);
	}

	@FunctionalInterface
	interface Sleeper {
		void sleep(long millis) throws InterruptedException;
	}

	private record Completion(
		JsonNode content,
		String model,
		Integer inputTokens,
		Integer outputTokens,
		long latencyMs
	) {}
}
