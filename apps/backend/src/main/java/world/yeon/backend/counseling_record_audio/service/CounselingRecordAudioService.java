package world.yeon.backend.counseling_record_audio.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import world.yeon.backend.counseling_record_audio.repository.CounselingRecordAudioRepository;

@Service
public class CounselingRecordAudioService {
	private static final String AUDIO_UPLOAD = "audio_upload";
	private static final String TEXT_MEMO = "text_memo";
	private static final String DEMO_PLACEHOLDER = "demo_placeholder";

	private final CounselingRecordAudioRepository repository;
	private final CounselingRecordAudioStorage storage;

	public CounselingRecordAudioService(
		CounselingRecordAudioRepository repository,
		CounselingRecordAudioStorage storage
	) {
		this.repository = repository;
		this.storage = storage;
	}

	public AudioResponse getAudio(UUID userId, String recordPublicId, String rangeHeader) {
		CounselingRecordAudioRepository.AudioRecordRow record = repository.findOwnedRecord(userId, recordPublicId);
		if (record == null) {
			throw new CounselingRecordAudioServiceException(404, "COUNSELING_RECORD_NOT_FOUND", "상담 기록을 찾지 못했습니다.");
		}

		String recordSource = resolveRecordSource(record.recordSource(), record.audioStoragePath());
		if (TEXT_MEMO.equals(recordSource)) {
			throw new CounselingRecordAudioServiceException(404, "COUNSELING_RECORD_AUDIO_NOT_FOUND", "텍스트 메모에는 재생할 원본 음성이 없습니다.");
		}
		if (DEMO_PLACEHOLDER.equals(recordSource)) {
			throw new CounselingRecordAudioServiceException(404, "COUNSELING_RECORD_AUDIO_PLACEHOLDER", "이 상담 기록은 실제 원본 음성이 없는 데모 데이터라 재생할 수 없습니다.");
		}

		ByteRange byteRange = parseSingleAudioRange(rangeHeader, record.audioByteSize());
		String storageRangeHeader = byteRange == null ? null : "bytes=" + byteRange.start() + "-" + byteRange.end();
		CounselingRecordAudioStorage.AudioObject audio = storage.read(record.audioStoragePath(), storageRangeHeader);

		int contentLength = audio.contentLength() != null
			? audio.contentLength().intValue()
			: (byteRange == null ? record.audioByteSize() : byteRange.end() - byteRange.start() + 1);
		String contentRange = audio.contentRange() != null
			? audio.contentRange()
			: (byteRange == null ? null : "bytes " + byteRange.start() + "-" + byteRange.end() + "/" + record.audioByteSize());

		return new AudioResponse(
			audio.bytes(),
			record.audioMimeType(),
			record.audioOriginalName(),
			contentLength,
			contentRange,
			byteRange == null ? 200 : 206
		);
	}

	private String resolveRecordSource(String raw, String audioStoragePath) {
		if (AUDIO_UPLOAD.equals(raw) || TEXT_MEMO.equals(raw) || DEMO_PLACEHOLDER.equals(raw)) {
			return raw;
		}
		if (audioStoragePath != null && audioStoragePath.startsWith("local://demo/")) {
			return DEMO_PLACEHOLDER;
		}
		if (audioStoragePath != null && audioStoragePath.startsWith("text_memo://")) {
			return TEXT_MEMO;
		}
		return AUDIO_UPLOAD;
	}

	private ByteRange parseSingleAudioRange(String rangeHeader, int totalByteSize) {
		if (rangeHeader == null || rangeHeader.trim().isEmpty()) {
			return null;
		}

		String trimmed = rangeHeader.trim();
		if (!trimmed.startsWith("bytes=")) {
			throw new CounselingRecordAudioServiceException(416, "INVALID_AUDIO_RANGE", "지원하지 않는 오디오 범위 요청입니다.");
		}
		String firstRange = trimmed.substring(6).split(",")[0].trim();
		if (firstRange.isEmpty() || !firstRange.contains("-")) {
			throw new CounselingRecordAudioServiceException(416, "INVALID_AUDIO_RANGE", "오디오 범위 요청 형식이 올바르지 않습니다.");
		}
		String[] tokens = firstRange.split("-", 2);
		String rawStart = tokens[0];
		String rawEnd = tokens[1];

		int start;
		int end;
		try {
			if (rawStart.isEmpty()) {
				int suffixLength = Integer.parseInt(rawEnd);
				if (suffixLength <= 0) {
					throw new NumberFormatException();
				}
				start = Math.max(totalByteSize - suffixLength, 0);
				end = totalByteSize - 1;
			} else {
				start = Integer.parseInt(rawStart);
				end = rawEnd.isEmpty() ? totalByteSize - 1 : Integer.parseInt(rawEnd);
			}
		} catch (NumberFormatException error) {
			throw new CounselingRecordAudioServiceException(416, "INVALID_AUDIO_RANGE", "오디오 범위 요청 형식이 올바르지 않습니다.");
		}

		if (start < 0 || start >= totalByteSize || end < start) {
			throw new CounselingRecordAudioServiceException(416, "INVALID_AUDIO_RANGE", "요청한 오디오 범위가 파일 범위를 벗어났습니다.");
		}
		end = Math.min(end, totalByteSize - 1);
		return new ByteRange(start, end);
	}

	private record ByteRange(int start, int end) {}

	public record AudioResponse(
		byte[] bytes,
		String mimeType,
		String originalName,
		int contentLength,
		String contentRange,
		int status
	) {}
}
