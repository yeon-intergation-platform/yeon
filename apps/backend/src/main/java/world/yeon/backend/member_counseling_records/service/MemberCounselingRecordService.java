package world.yeon.backend.member_counseling_records.service;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import world.yeon.backend.member_counseling_records.dto.MemberCounselingRecordItemResponse;
import world.yeon.backend.member_counseling_records.dto.MemberCounselingRecordsResponse;
import world.yeon.backend.member_counseling_records.repository.MemberCounselingRecordRepository;

@Service
@Profile("jdbc")
public class MemberCounselingRecordService {
	private final MemberCounselingRecordRepository repository;

	public MemberCounselingRecordService(MemberCounselingRecordRepository repository) {
		this.repository = repository;
	}

	public MemberCounselingRecordsResponse listByMember(UUID userId, String memberPublicId, Integer limit, OffsetDateTime beforeCreatedAt) {
		return new MemberCounselingRecordsResponse(
			repository.listByMember(userId, memberPublicId, limit, beforeCreatedAt).stream()
				.map(row -> new MemberCounselingRecordItemResponse(
					row.publicId(), row.studentName(), row.sessionTitle(), row.counselingType(), row.counselorName(), row.status(), row.recordSource(),
					row.audioOriginalName(), row.audioMimeType(), row.audioByteSize(), row.audioDurationMs(), row.processingStage(), row.processingProgress(),
					row.processingMessage(), row.analysisStatus(), row.analysisProgress(), row.analysisErrorMessage(), row.errorMessage(), row.language(), row.sttModel(),
					row.createdAt() == null ? null : row.createdAt().toString(),
					row.updatedAt() == null ? null : row.updatedAt().toString(),
					row.transcriptionCompletedAt() == null ? null : row.transcriptionCompletedAt().toString(),
					row.analysisCompletedAt() == null ? null : row.analysisCompletedAt().toString(),
					row.spacePublicId(), row.memberPublicId()
				)).toList()
		);
	}
}
