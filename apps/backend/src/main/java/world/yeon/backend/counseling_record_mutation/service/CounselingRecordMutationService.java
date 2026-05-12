package world.yeon.backend.counseling_record_mutation.service;

import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.counseling_record_audio.service.CounselingRecordAudioStorage;
import world.yeon.backend.counseling_record_details.dto.CounselingRecordTranscriptSegmentResponse;
import world.yeon.backend.counseling_record_mutation.dto.BulkUpdateSpeakerResponse;
import world.yeon.backend.counseling_record_mutation.dto.MutationOkResponse;
import world.yeon.backend.counseling_record_mutation.dto.UpdateTranscriptSegmentRequest;
import world.yeon.backend.counseling_record_mutation.dto.UpdateTranscriptSegmentResponse;
import world.yeon.backend.counseling_record_mutation.repository.CounselingRecordMutationRepository;

@Service
public class CounselingRecordMutationService {
	private static final String AUDIO_UPLOAD = "audio_upload";
	private static final String TEXT_MEMO = "text_memo";
	private static final String DEMO_PLACEHOLDER = "demo_placeholder";
	private static final String READY_STATUS = "ready";
	private static final Set<String> VALID_SPEAKER_TONES = Set.of("teacher", "student", "unknown");

	private final CounselingRecordMutationRepository repository;
	private final CounselingRecordAudioStorage audioStorage;

	public CounselingRecordMutationService(
		CounselingRecordMutationRepository repository,
		CounselingRecordAudioStorage audioStorage
	) {
		this.repository = repository;
		this.audioStorage = audioStorage;
	}

	public MutationOkResponse linkRecord(UUID userId, String recordPublicId, String memberPublicId) {
		CounselingRecordMutationRepository.OwnedRecordRow record = requireOwnedRecord(userId, recordPublicId);
		Long memberInternalId = null;
		Long spaceInternalId = null;

		if (memberPublicId != null) {
			CounselingRecordMutationRepository.OwnedMemberRow member = repository.findOwnedMember(userId, memberPublicId);
			if (member == null) {
				throw new CounselingRecordMutationServiceException(404, "MEMBER_NOT_FOUND", "수강생을 찾지 못했습니다.");
			}
			memberInternalId = member.internalId();
			spaceInternalId = member.spaceInternalId();
		}

		repository.linkRecord(record.internalId(), memberInternalId, spaceInternalId);
		return new MutationOkResponse(true);
	}

	public MutationOkResponse deleteRecord(UUID userId, String recordPublicId) {
		CounselingRecordMutationRepository.OwnedRecordRow record = requireOwnedRecord(userId, recordPublicId);
		repository.deleteRecord(record.internalId());

		if (hasPlayableAudio(record.recordSource(), record.audioStoragePath())) {
			try {
				audioStorage.delete(record.audioStoragePath());
			} catch (Exception error) {
				System.err.println("counseling-record-r2-delete-failed: " + record.publicId());
			}
		}

		return new MutationOkResponse(true);
	}

	@Transactional
	public UpdateTranscriptSegmentResponse updateSegment(
		UUID userId,
		String recordPublicId,
		String segmentPublicId,
		UpdateTranscriptSegmentRequest request
	) {
		if (request == null) {
			throw new IllegalArgumentException("요청 본문이 필요합니다.");
		}
		CounselingRecordMutationRepository.OwnedRecordRow record = requireReadyRecord(
			userId,
			recordPublicId,
			"원문 전사가 모두 준비된 기록만 편집할 수 있습니다. 누락 구간 복구 후 다시 시도해 주세요."
		);

		boolean hasText = request.text() != null;
		boolean hasSpeakerLabel = request.speakerLabel() != null;
		boolean hasSpeakerTone = request.speakerTone() != null;

		validateText(request.text());
		validateSpeakerLabel(request.speakerLabel());
		validateSpeakerTone(request.speakerTone());

		CounselingRecordMutationRepository.SegmentRow segment = repository.updateSegment(
			record.internalId(),
			segmentPublicId,
			hasText,
			request.text(),
			hasSpeakerLabel,
			request.speakerLabel(),
			hasSpeakerTone,
			request.speakerTone()
		);

		if (segment == null) {
			throw new CounselingRecordMutationServiceException(404, "TRANSCRIPT_SEGMENT_NOT_FOUND", "해당 세그먼트를 찾지 못했습니다.");
		}

		if (hasText || hasSpeakerLabel || hasSpeakerTone) {
			repository.rebuildTranscriptText(record.internalId());
			repository.queueAnalysisAfterTranscriptMutation(record.internalId(), "원문이 수정되어 AI 분석을 다시 준비합니다.");
		}

		return new UpdateTranscriptSegmentResponse(toSegmentResponse(segment));
	}

	@Transactional
	public BulkUpdateSpeakerResponse bulkUpdateSpeaker(
		UUID userId,
		String recordPublicId,
		String fromSpeakerLabel,
		String toSpeakerLabel,
		String toSpeakerTone
	) {
		if (fromSpeakerLabel == null || toSpeakerLabel == null) {
			throw new IllegalArgumentException("변경할 화자 이름이 필요합니다.");
		}
		CounselingRecordMutationRepository.OwnedRecordRow record = requireReadyRecord(
			userId,
			recordPublicId,
			"원문 전사가 모두 준비된 기록만 화자 정보를 수정할 수 있습니다. 누락 구간 복구 후 다시 시도해 주세요."
		);

		validateSpeakerLabel(fromSpeakerLabel);
		validateSpeakerLabel(toSpeakerLabel);
		validateSpeakerTone(toSpeakerTone);

		int updatedCount = repository.bulkUpdateSpeaker(record.internalId(), fromSpeakerLabel, toSpeakerLabel, toSpeakerTone);
		if (updatedCount > 0) {
			repository.rebuildTranscriptText(record.internalId());
			repository.queueAnalysisAfterTranscriptMutation(record.internalId(), "화자 정보가 수정되어 AI 분석을 다시 준비합니다.");
		}

		return new BulkUpdateSpeakerResponse(updatedCount);
	}

	private CounselingRecordMutationRepository.OwnedRecordRow requireOwnedRecord(UUID userId, String recordPublicId) {
		CounselingRecordMutationRepository.OwnedRecordRow record = repository.findOwnedRecord(userId, recordPublicId);
		if (record == null) {
			throw new CounselingRecordMutationServiceException(404, "COUNSELING_RECORD_NOT_FOUND", "상담 기록을 찾지 못했습니다.");
		}
		return record;
	}

	private CounselingRecordMutationRepository.OwnedRecordRow requireReadyRecord(UUID userId, String recordPublicId, String message) {
		CounselingRecordMutationRepository.OwnedRecordRow record = requireOwnedRecord(userId, recordPublicId);
		if (!READY_STATUS.equals(record.status())) {
			throw new CounselingRecordMutationServiceException(400, "COUNSELING_RECORD_NOT_READY", message);
		}
		return record;
	}

	private void validateText(String text) {
		if (text != null && text.isBlank()) {
			throw new IllegalArgumentException("세그먼트 원문은 비어 있을 수 없습니다.");
		}
	}

	private void validateSpeakerLabel(String speakerLabel) {
		if (speakerLabel == null) {
			return;
		}
		if (speakerLabel.isBlank() || speakerLabel.length() > 40) {
			throw new IllegalArgumentException("화자 이름은 1자 이상 40자 이하여야 합니다.");
		}
	}

	private void validateSpeakerTone(String speakerTone) {
		if (speakerTone != null && !VALID_SPEAKER_TONES.contains(speakerTone)) {
			throw new IllegalArgumentException("화자 유형이 올바르지 않습니다.");
		}
	}

	private CounselingRecordTranscriptSegmentResponse toSegmentResponse(CounselingRecordMutationRepository.SegmentRow segment) {
		return new CounselingRecordTranscriptSegmentResponse(
			segment.publicId(),
			segment.segmentIndex(),
			segment.startMs(),
			segment.endMs(),
			segment.speakerLabel(),
			VALID_SPEAKER_TONES.contains(segment.speakerTone()) ? segment.speakerTone() : "unknown",
			segment.text()
		);
	}

	private boolean hasPlayableAudio(String rawSource, String audioStoragePath) {
		String source = resolveRecordSource(rawSource, audioStoragePath);
		return AUDIO_UPLOAD.equals(source);
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
}
