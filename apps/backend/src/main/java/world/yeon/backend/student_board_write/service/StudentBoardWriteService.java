package world.yeon.backend.student_board_write.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.stereotype.Service;
import world.yeon.backend.student_board_read.dto.StudentBoardReadResponse;
import world.yeon.backend.student_board_read.service.StudentBoardReadService;
import world.yeon.backend.student_board_write.dto.UpdateStudentBoardRequest;
import world.yeon.backend.student_board_write.repository.StudentBoardWriteRepository;

@Service
public class StudentBoardWriteService {
	private static final String SOURCE_MANUAL = "manual";
	private final StudentBoardWriteRepository repository;
	private final StudentBoardReadService readService;

	public StudentBoardWriteService(StudentBoardWriteRepository repository, StudentBoardReadService readService) {
		this.repository = repository;
		this.readService = readService;
	}

	public StudentBoardReadResponse updateBoard(String spaceId, String memberId, UUID userId, UpdateStudentBoardRequest request) {
		var context = repository.findOwnedMemberContext(spaceId, memberId, userId);
		if (context == null) {
			throw new StudentBoardWriteServiceException(404, "MEMBER_NOT_FOUND", "해당 수강생을 찾지 못했습니다.");
		}

		var existing = repository.findBoardSnapshot(context.spaceInternalId(), context.memberInternalId());
		String currentAttendanceStatus = existing == null || existing.attendanceStatus() == null ? "unknown" : existing.attendanceStatus();
		String currentAssignmentStatus = existing == null || existing.assignmentStatus() == null ? "unknown" : existing.assignmentStatus();
		String currentAssignmentLink = existing == null ? null : existing.assignmentLink();
		String nextAttendanceStatus = request != null && request.hasAttendanceStatus() ? request.attendanceStatus() : currentAttendanceStatus;
		String nextAssignmentStatus = request != null && request.hasAssignmentStatus() ? request.assignmentStatus() : currentAssignmentStatus;
		String nextAssignmentLink = request != null && request.hasAssignmentLink()
			? normalizeNullable(request.assignmentLink())
			: currentAssignmentLink;

		boolean attendanceChanged = request != null && request.hasAttendanceStatus() && !nextAttendanceStatus.equals(currentAttendanceStatus);
		boolean assignmentStatusChanged = request != null && request.hasAssignmentStatus() && !nextAssignmentStatus.equals(currentAssignmentStatus);
		boolean assignmentLinkChanged = request != null && request.hasAssignmentLink() && !java.util.Objects.equals(nextAssignmentLink, currentAssignmentLink);
		boolean assignmentCleared = request != null && request.hasAssignmentLink() && request.assignmentLink() == null && !java.util.Objects.equals(currentAssignmentLink, null);
		boolean assignmentChanged = assignmentStatusChanged || assignmentLinkChanged || assignmentCleared;
		boolean shouldRefreshAttendanceMark = attendanceChanged;
		boolean shouldRefreshAssignmentMark = assignmentChanged;
		boolean shouldWriteSnapshot = attendanceChanged || assignmentChanged;

		if (shouldWriteSnapshot) {
			OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
			repository.upsertBoardSnapshot(
				generatePublicId("smb"),
				context.spaceInternalId(),
				context.memberInternalId(),
				nextAttendanceStatus,
				shouldRefreshAttendanceMark ? ("unknown".equals(nextAttendanceStatus) ? null : now) : existing == null ? null : existing.attendanceMarkedAt(),
				shouldRefreshAttendanceMark ? ("unknown".equals(nextAttendanceStatus) ? null : SOURCE_MANUAL) : existing == null ? null : existing.attendanceMarkedSource(),
				nextAssignmentStatus,
				nextAssignmentLink,
				shouldRefreshAssignmentMark ? (("unknown".equals(nextAssignmentStatus) && nextAssignmentLink == null) ? null : now) : existing == null ? null : existing.assignmentMarkedAt(),
				shouldRefreshAssignmentMark ? (("unknown".equals(nextAssignmentStatus) && nextAssignmentLink == null) ? null : SOURCE_MANUAL) : existing == null ? null : existing.assignmentMarkedSource(),
				existing == null ? null : existing.lastPublicCheckAt(),
				userId,
				now
			);

			if (attendanceChanged || assignmentChanged) {
				repository.insertHistory(
					generatePublicId("smbh"),
					context.spaceInternalId(),
					context.memberInternalId(),
					nextAttendanceStatus,
					nextAssignmentStatus,
					nextAssignmentLink,
					SOURCE_MANUAL,
					userId,
					now
				);
			}
		}

		return readService.getBoard(spaceId, userId, "7d");
	}
	private String normalizeNullable(String raw) {
		if (raw == null) return null;
		String trimmed = raw.trim();
		return trimmed.isBlank() ? null : trimmed;
	}

	private String generatePublicId(String prefix) {
		return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
	}
}
