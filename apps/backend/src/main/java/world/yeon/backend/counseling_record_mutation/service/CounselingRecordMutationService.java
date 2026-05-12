package world.yeon.backend.counseling_record_mutation.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import world.yeon.backend.counseling_record_audio.service.CounselingRecordAudioStorage;
import world.yeon.backend.counseling_record_details.service.CounselingRecordDetailService;
import world.yeon.backend.counseling_record_mutation.dto.MutationOkResponse;
import world.yeon.backend.counseling_record_mutation.repository.CounselingRecordMutationRepository;

@Service
public class CounselingRecordMutationService {
	private static final String AUDIO_UPLOAD = "audio_upload";
	private static final String TEXT_MEMO = "text_memo";
	private static final String DEMO_PLACEHOLDER = "demo_placeholder";

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

	private CounselingRecordMutationRepository.OwnedRecordRow requireOwnedRecord(UUID userId, String recordPublicId) {
		CounselingRecordMutationRepository.OwnedRecordRow record = repository.findOwnedRecord(userId, recordPublicId);
		if (record == null) {
			throw new CounselingRecordMutationServiceException(404, "COUNSELING_RECORD_NOT_FOUND", "상담 기록을 찾지 못했습니다.");
		}
		return record;
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
