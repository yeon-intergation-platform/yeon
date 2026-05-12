package world.yeon.backend.counseling_record_create.service;

import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import world.yeon.backend.counseling_record_audio.service.CounselingRecordAudioStorage;
import world.yeon.backend.counseling_record_create.repository.CounselingRecordCreateRepository;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordDetailItemResponse;
import world.yeon.backend.counseling_record_details.service.CounselingRecordDetailService;
import world.yeon.backend.counseling_record_transcription.service.CounselingRecordTranscriptionService;

@Service
public class CounselingRecordCreateService {
	private static final Set<String> ACCEPTED_AUDIO_MIME_TYPES = Set.of(
		"audio/webm", "audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3", "audio/mp4", "audio/m4a", "audio/x-m4a", "audio/ogg"
	);
	private static final long MAX_AUDIO_UPLOAD_BYTES = 128L * 1024L * 1024L;
	private static final String DEFAULT_COUNSELING_TYPE = "대면 상담";
	private static final String AUDIO_UPLOAD_ERROR_MESSAGE = "webm, wav, mp3, m4a, ogg 형식의 128MB 이하 음성 파일만 업로드할 수 있습니다.";

	private final CounselingRecordCreateRepository repository;
	private final CounselingRecordAudioStorage storage;
	private final CounselingRecordDetailService detailService;
	private final CounselingRecordTranscriptionService transcriptionService;

	public CounselingRecordCreateService(
		CounselingRecordCreateRepository repository,
		CounselingRecordAudioStorage storage,
		CounselingRecordDetailService detailService,
		CounselingRecordTranscriptionService transcriptionService
	) {
		this.repository = repository;
		this.storage = storage;
		this.detailService = detailService;
		this.transcriptionService = transcriptionService;
	}

	public CounselingRecordDetailItemResponse create(CreateRequest request) {
		if ("text_memo".equals(request.recordType())) {
			return createTextMemo(request);
		}
		return createAudioRecord(request);
	}

	private CounselingRecordDetailItemResponse createAudioRecord(CreateRequest request) {
		MultipartFile audio = request.audio();
		if (audio == null || audio.isEmpty()) {
			throw new CounselingRecordCreateServiceException(400, "AUDIO_FILE_REQUIRED", "업로드할 음성 파일이 필요합니다.");
		}
		validateAudio(audio);

		ResolvedRelation relation = resolveRelation(request);
		String recordPublicId = publicId("crd");
		String sessionTitle = sanitizeRequired(request.sessionTitle(), 160, "상담 제목");
		String counselingType = sanitizeOptional(request.counselingType(), 40, DEFAULT_COUNSELING_TYPE);
		String originalName = sanitizeOptional(audio.getOriginalFilename(), 180, "recording");
		String mimeType = sanitizeOptional(audio.getContentType(), 80, "audio/webm");
		byte[] bytes = readBytes(audio);
		String sha256 = sha256Base64(bytes);
		String storagePath = recordPublicId + "/" + System.currentTimeMillis() + "-" + safeFileName(originalName, mimeType);

		storage.upload(storagePath, bytes, mimeType, sha256);
		try {
			repository.insertAudioRecord(new CounselingRecordCreateRepository.AudioRecordInsert(
				recordPublicId,
				request.userId(),
				relation.memberInternalId(),
				relation.spaceInternalId(),
				relation.studentName(),
				sessionTitle,
				counselingType,
				resolveCounselorName(request),
				originalName,
				mimeType,
				bytes.length,
				request.audioDurationMs(),
				storagePath,
				sha256
			));
		} catch (RuntimeException error) {
			storage.delete(storagePath);
			throw error;
		}
		transcriptionService.queueTranscription(request.userId(), recordPublicId, request.clientRequestId());
		return detailService.getDetail(request.userId(), recordPublicId);
	}

	private CounselingRecordDetailItemResponse createTextMemo(CreateRequest request) {
		String sessionTitle = sanitizeRequired(request.sessionTitle(), 160, "메모 제목");
		String content = sanitizeRequired(request.content(), 10_000, "메모 내용");
		ResolvedRelation relation = resolveRelation(request);
		String recordPublicId = publicId("crd");
		repository.insertTextMemoRecord(new CounselingRecordCreateRepository.TextMemoRecordInsert(
			recordPublicId,
			publicId("cts"),
			request.userId(),
			relation.memberInternalId(),
			relation.spaceInternalId(),
			relation.studentName(),
			sessionTitle,
			sanitizeOptional(request.counselingType(), 40, "텍스트 메모"),
			resolveCounselorName(request),
			content
		));
		return detailService.getDetail(request.userId(), recordPublicId);
	}

	private ResolvedRelation resolveRelation(CreateRequest request) {
		String explicitStudentName = sanitizeOptional(request.studentName(), 80, "");
		String memberId = trimToNull(request.memberId());
		if (memberId == null) return new ResolvedRelation(null, null, explicitStudentName);
		CounselingRecordCreateRepository.MemberRow member = repository.findOwnedMember(request.userId(), memberId);
		if (member == null) {
			throw new CounselingRecordCreateServiceException(404, "MEMBER_NOT_FOUND", "연결할 수강생을 찾지 못했습니다.");
		}
		return new ResolvedRelation(member.internalId(), member.spaceInternalId(), explicitStudentName.isBlank() ? member.name() : explicitStudentName);
	}

	private void validateAudio(MultipartFile audio) {
		String mimeType = audio.getContentType();
		if (audio.getSize() <= 0 || audio.getSize() > MAX_AUDIO_UPLOAD_BYTES || mimeType == null || !ACCEPTED_AUDIO_MIME_TYPES.contains(mimeType)) {
			throw new CounselingRecordCreateServiceException(400, "AUDIO_FILE_UNSUPPORTED", AUDIO_UPLOAD_ERROR_MESSAGE);
		}
	}

	private byte[] readBytes(MultipartFile file) {
		try { return file.getBytes(); }
		catch (Exception error) { throw new CounselingRecordCreateServiceException(400, "AUDIO_FILE_READ_FAILED", "업로드된 음성 파일을 읽지 못했습니다."); }
	}

	private String sha256Base64(byte[] bytes) {
		try { return Base64.getEncoder().encodeToString(MessageDigest.getInstance("SHA-256").digest(bytes)); }
		catch (Exception error) { throw new IllegalStateException("SHA-256 계산에 실패했습니다.", error); }
	}

	private String safeFileName(String originalName, String mimeType) {
		String fileName = Path.of(originalName).getFileName().toString().replaceAll("[^0-9A-Za-z가-힣._-]", "-");
		if (fileName.isBlank()) fileName = "recording" + guessExtension(mimeType);
		return fileName;
	}

	private String guessExtension(String mimeType) {
		return switch (mimeType) {
			case "audio/wav", "audio/x-wav" -> ".wav";
			case "audio/mpeg", "audio/mp3" -> ".mp3";
			case "audio/mp4", "audio/m4a", "audio/x-m4a" -> ".m4a";
			case "audio/ogg" -> ".ogg";
			default -> ".webm";
		};
	}

	private String publicId(String prefix) {
		return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
	}

	private String resolveCounselorName(CreateRequest request) {
		String displayName = trimToNull(request.userDisplayName());
		if (displayName != null) return displayName.length() > 80 ? displayName.substring(0, 80) : displayName;
		String email = trimToNull(request.userEmail());
		return email == null ? null : (email.length() > 80 ? email.substring(0, 80) : email);
	}

	private String sanitizeRequired(String value, int maxLength, String label) {
		String normalized = trimToNull(value);
		if (normalized == null) throw new CounselingRecordCreateServiceException(400, "REQUIRED_FIELD_MISSING", label + "을(를) 입력해 주세요.");
		return normalized.length() > maxLength ? normalized.substring(0, maxLength) : normalized;
	}

	private String sanitizeOptional(String value, int maxLength, String fallback) {
		String normalized = trimToNull(value);
		if (normalized == null) return fallback;
		return normalized.length() > maxLength ? normalized.substring(0, maxLength) : normalized;
	}

	private String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim().replaceAll("\\s+", " ");
		return trimmed.isEmpty() ? null : trimmed;
	}

	public record CreateRequest(
		UUID userId,
		String userEmail,
		String userDisplayName,
		String clientRequestId,
		String recordType,
		String sessionTitle,
		String content,
		String studentName,
		String memberId,
		String counselingType,
		Long audioDurationMs,
		MultipartFile audio
	) {}

	private record ResolvedRelation(Long memberInternalId, Long spaceInternalId, String studentName) {}
}
