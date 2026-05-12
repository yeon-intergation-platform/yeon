package world.yeon.backend.counseling_record_transcription.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import world.yeon.backend.counseling_record_audio.service.CounselingRecordAudioStorage;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailItemResponse;
import world.yeon.backend.counseling_record_details.service.CounselingRecordDetailService;
import world.yeon.backend.counseling_record_transcription.repository.CounselingRecordTranscriptionRepository;

@Service
public class CounselingRecordTranscriptionService {
	private static final String AUDIO_UPLOAD = "audio_upload";
	private static final String TEXT_MEMO = "text_memo";
	private static final String DEMO_PLACEHOLDER = "demo_placeholder";
	private static final int MAX_DIRECT_TRANSCRIPTION_BYTES = 24 * 1024 * 1024;
	private static final String TRANSCRIPTION_PROMPT = "한국어 교육 상담 녹취를 정확히 전사하세요. 멘토, 수강생 발화를 최대한 원문 그대로 보존하고 과정명, 과제, 프로젝트, 제출, 멘토링 일정 같은 표현을 왜곡하지 마세요.";

	private final CounselingRecordTranscriptionRepository repository;
	private final CounselingRecordAudioStorage storage;
	private final CounselingRecordDetailService detailService;
	private final ObjectMapper objectMapper;
	private final Environment environment;
	private final HttpClient httpClient = HttpClient.newHttpClient();

	public CounselingRecordTranscriptionService(
		CounselingRecordTranscriptionRepository repository,
		CounselingRecordAudioStorage storage,
		CounselingRecordDetailService detailService,
		ObjectMapper objectMapper,
		Environment environment
	) {
		this.repository = repository;
		this.storage = storage;
		this.detailService = detailService;
		this.objectMapper = objectMapper;
		this.environment = environment;
	}

	public CounselingRecordDetailItemResponse retryTranscription(UUID userId, String recordPublicId, String clientRequestId) {
		CounselingRecordTranscriptionRepository.RecordRow record = requireRetryableRecord(userId, recordPublicId);

		if ("processing".equals(record.status())) {
			return detailService.getDetail(userId, recordPublicId);
		}

		repository.markQueued(record, "partial_transcript_ready".equals(record.processingStage()));
		queueTranscription(userId, record.publicId(), clientRequestId);
		return detailService.getDetail(userId, recordPublicId);
	}

	public void queueTranscription(UUID userId, String recordPublicId, String clientRequestId) {
		CompletableFuture.runAsync(() -> runTranscription(userId, recordPublicId, clientRequestId));
	}

	private CounselingRecordTranscriptionRepository.RecordRow requireRetryableRecord(UUID userId, String recordPublicId) {
		CounselingRecordTranscriptionRepository.RecordRow record = repository.findOwnedRecord(userId, recordPublicId);
		if (record == null) {
			throw new CounselingRecordTranscriptionServiceException(404, "COUNSELING_RECORD_NOT_FOUND", "상담 기록을 찾지 못했습니다.");
		}

		String source = resolveRecordSource(record.recordSource(), record.audioStoragePath());
		if (TEXT_MEMO.equals(source)) {
			throw new CounselingRecordTranscriptionServiceException(400, "TEXT_MEMO_TRANSCRIPTION_UNSUPPORTED", "텍스트 메모는 재전사할 수 없습니다. 원문 내용을 직접 수정해 주세요.");
		}
		if (DEMO_PLACEHOLDER.equals(source)) {
			throw new CounselingRecordTranscriptionServiceException(400, "DEMO_PLACEHOLDER_TRANSCRIPTION_UNSUPPORTED", "데모 placeholder 기록은 재전사할 수 없습니다. 새 음성 기록을 업로드해 주세요.");
		}
		if (record.audioStoragePath() == null || record.audioStoragePath().isBlank()) {
			throw new CounselingRecordTranscriptionServiceException(400, "AUDIO_STORAGE_MISSING", "재전사할 원본 음성을 찾지 못했습니다.");
		}
		return record;
	}

	private void runTranscription(UUID userId, String recordPublicId, String clientRequestId) {
		CounselingRecordTranscriptionRepository.RecordRow record = repository.findOwnedRecord(userId, recordPublicId);
		if (record == null) return;
		try {
			repository.updateProcessing(
				record.internalId(),
				"downloading",
				10,
				"오디오 파일을 전사 작업용으로 준비하고 있습니다.",
				(record.transcriptionAttemptCount() == null ? 0 : record.transcriptionAttemptCount()) + 1
			);

			CounselingRecordAudioStorage.AudioObject audio = storage.read(record.audioStoragePath(), null);
			byte[] bytes = audio.bytes();
			if (bytes.length > MAX_DIRECT_TRANSCRIPTION_BYTES) {
				throw new CounselingRecordTranscriptionServiceException(413, "AUDIO_TOO_LARGE_FOR_DIRECT_TRANSCRIPTION", "긴 음성 파일 분할 전사는 Spring 이관 후속 단계에서 처리됩니다. 더 짧은 파일로 다시 시도해 주세요.");
			}

			repository.updateProcessing(record.internalId(), "transcribing", 20, "음성을 전사하고 있습니다.", null);
			TranscriptionResult transcription = callOpenAiTranscription(record, bytes, clientRequestId);
			repository.updateProcessing(record.internalId(), "resolving_speakers", 85, "전사 결과를 정리하고 있습니다.", null);
			repository.persistTranscript(
				record.internalId(),
				transcription.transcriptText(),
				transcription.language(),
				transcription.model(),
				transcription.durationMs() == null ? record.audioDurationMs() : transcription.durationMs(),
				transcription.segments()
			);
		} catch (Exception error) {
			String message = error instanceof CounselingRecordTranscriptionServiceException serviceError
				? serviceError.getMessage()
				: "음성 전사 처리 중 알 수 없는 오류가 발생했습니다.";
			repository.markError(record.internalId(), message);
		}
	}

	private TranscriptionResult callOpenAiTranscription(
		CounselingRecordTranscriptionRepository.RecordRow record,
		byte[] bytes,
		String clientRequestId
	) throws IOException, InterruptedException {
		String model = resolveModel();
		String boundary = "----yeon-transcription-" + UUID.randomUUID();
		byte[] body = buildMultipartBody(boundary, record, bytes, model);
		HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create("https://api.openai.com/v1/audio/transcriptions"))
			.header("authorization", "Bearer " + requireOpenAiApiKey())
			.header("content-type", "multipart/form-data; boundary=" + boundary)
			.POST(HttpRequest.BodyPublishers.ofByteArray(body));
		if (clientRequestId != null && !clientRequestId.isBlank()) {
			builder.header("x-client-request-id", clientRequestId);
		}
		HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
		if (response.statusCode() < 200 || response.statusCode() >= 300) {
			throw new CounselingRecordTranscriptionServiceException(502, "OPENAI_TRANSCRIPTION_FAILED", "OpenAI 전사 API 호출 실패: " + response.body());
		}
		JsonNode root = objectMapper.readTree(response.body());
		String text = root.path("text").asText("").trim();
		if (text.isBlank()) {
			throw new CounselingRecordTranscriptionServiceException(500, "OPENAI_TRANSCRIPTION_EMPTY", "전사 결과가 비어 있습니다.");
		}
		String language = root.path("language").isTextual() ? root.path("language").asText() : null;
		Integer durationMs = root.path("duration").isNumber() ? Math.round((float) root.path("duration").asDouble() * 1000) : null;
		return new TranscriptionResult(text, language, model, durationMs, buildSegments(root, text));
	}

	private byte[] buildMultipartBody(String boundary, CounselingRecordTranscriptionRepository.RecordRow record, byte[] bytes, String model) throws IOException {
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		writeField(out, boundary, "model", model);
		writeField(out, boundary, "prompt", TRANSCRIPTION_PROMPT);
		writeField(out, boundary, "response_format", "verbose_json");
		writeFile(out, boundary, "file", record.audioOriginalName(), record.audioMimeType(), bytes);
		out.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
		return out.toByteArray();
	}

	private void writeField(ByteArrayOutputStream out, String boundary, String name, String value) throws IOException {
		out.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
		out.write(("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n").getBytes(StandardCharsets.UTF_8));
		out.write(value.getBytes(StandardCharsets.UTF_8));
		out.write("\r\n".getBytes(StandardCharsets.UTF_8));
	}

	private void writeFile(ByteArrayOutputStream out, String boundary, String name, String fileName, String mimeType, byte[] bytes) throws IOException {
		String safeFileName = fileName == null || fileName.isBlank() ? "audio" : fileName.replace("\"", "");
		String contentType = mimeType == null || mimeType.isBlank() ? "application/octet-stream" : mimeType;
		out.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
		out.write(("Content-Disposition: form-data; name=\"" + name + "\"; filename=\"" + safeFileName + "\"\r\n").getBytes(StandardCharsets.UTF_8));
		out.write(("Content-Type: " + contentType + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
		out.write(bytes);
		out.write("\r\n".getBytes(StandardCharsets.UTF_8));
	}

	private List<CounselingRecordTranscriptionRepository.TranscriptSegment> buildSegments(JsonNode root, String fallbackText) {
		JsonNode source = root.path("segments");
		List<CounselingRecordTranscriptionRepository.TranscriptSegment> segments = new ArrayList<>();
		if (source.isArray()) {
			int index = 0;
			for (JsonNode item : source) {
				String text = item.path("text").asText("").trim();
				if (text.isBlank()) continue;
				segments.add(new CounselingRecordTranscriptionRepository.TranscriptSegment(
					index++,
					secondsToMs(item.path("start")),
					secondsToMs(item.path("end")),
					resolveSpeakerLabel(item),
					"unknown",
					text
				));
			}
		}
		if (segments.isEmpty()) {
			segments.add(new CounselingRecordTranscriptionRepository.TranscriptSegment(0, null, null, "원문", "unknown", fallbackText));
		}
		return segments;
	}

	private Integer secondsToMs(JsonNode value) {
		return value.isNumber() ? Math.round((float) value.asDouble() * 1000) : null;
	}

	private String resolveSpeakerLabel(JsonNode item) {
		String speaker = item.path("speaker").asText(null);
		if (speaker == null || speaker.isBlank()) speaker = item.path("speaker_label").asText(null);
		if (speaker == null || speaker.isBlank()) return "원문";
		return speaker.length() > 40 ? speaker.substring(0, 40) : speaker;
	}

	private String resolveModel() {
		String configured = trimToNull(environment.getProperty("OPENAI_TRANSCRIPTION_MODEL"));
		if (configured == null) configured = trimToNull(System.getenv("OPENAI_TRANSCRIPTION_MODEL"));
		return configured == null ? "gpt-4o-transcribe" : configured;
	}

	private String requireOpenAiApiKey() {
		String apiKey = trimToNull(environment.getProperty("OPENAI_API_KEY"));
		if (apiKey == null) apiKey = trimToNull(System.getenv("OPENAI_API_KEY"));
		if (apiKey == null) {
			throw new CounselingRecordTranscriptionServiceException(500, "OPENAI_API_KEY_MISSING", "OPENAI_API_KEY가 설정되지 않았습니다.");
		}
		return apiKey;
	}

	private String resolveRecordSource(String raw, String audioStoragePath) {
		if (AUDIO_UPLOAD.equals(raw) || TEXT_MEMO.equals(raw) || DEMO_PLACEHOLDER.equals(raw)) return raw;
		if (audioStoragePath != null && audioStoragePath.startsWith("local://demo/")) return DEMO_PLACEHOLDER;
		if (audioStoragePath != null && audioStoragePath.startsWith("text_memo://")) return TEXT_MEMO;
		return AUDIO_UPLOAD;
	}

	private String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private record TranscriptionResult(
		String transcriptText,
		String language,
		String model,
		Integer durationMs,
		List<CounselingRecordTranscriptionRepository.TranscriptSegment> segments
	) {}
}
