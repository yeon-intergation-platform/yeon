package world.yeon.backend.student_board_read.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import world.yeon.backend.student_board_read.dto.PublicCheckSessionSummaryResponse;
import world.yeon.backend.student_board_read.dto.StudentBoardDailyCellResponse;
import world.yeon.backend.student_board_read.dto.StudentBoardReadResponse;
import world.yeon.backend.student_board_read.dto.StudentBoardRowResponse;
import world.yeon.backend.student_board_read.repository.StudentBoardReadRepository;

@Service
public class StudentBoardReadService {
	private static final DateTimeFormatter DATE_KEY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	private static final Map<String, Integer> HISTORY_PERIOD_DAY_COUNT = Map.of(
		"7d", 7,
		"30d", 30,
		"365d", 365
	);

	private final StudentBoardReadRepository repository;

	public StudentBoardReadService(StudentBoardReadRepository repository) {
		this.repository = repository;
	}

	public StudentBoardReadResponse getBoard(String spaceId, UUID userId, String historyPeriod) {
		String period = historyPeriod == null || historyPeriod.isBlank() ? "7d" : historyPeriod;
		if (!List.of("space", "7d", "30d", "365d").contains(period)) {
			throw new StudentBoardReadServiceException(400, "INVALID_PERIOD", "보드 이력 기간 값이 올바르지 않습니다.");
		}

		var space = repository.findOwnedSpaceContext(spaceId, userId);
		if (space == null) throw new StudentBoardReadServiceException(404, "SPACE_NOT_FOUND", "스페이스를 찾을 수 없거나 접근 권한이 없습니다.");

		OffsetDateTime from = resolveFrom(period, space.startDate());
		OffsetDateTime to = resolveTo(period, space.endDate());
		var members = repository.findMembersInOwnedSpace(spaceId, userId);
		var boardSnapshots = repository.findBoardSnapshots(space.spaceInternalId());
		var sessions = repository.findRecentSessions(space.spaceInternalId());
		var historyRows = repository.findHistoryRows(space.spaceInternalId(), from, to);

		Map<Long, StudentBoardReadRepository.BoardSnapshotRow> boardByMemberId = new LinkedHashMap<>();
		for (var row : boardSnapshots) boardByMemberId.put(row.memberInternalId(), row);
		Map<Long, LinkedHashMap<String, StudentBoardDailyCellResponse>> dailyCellMapByMember = new LinkedHashMap<>();
		for (var row : historyRows) {
			if (row.happenedAt() == null) continue;
			String date = getHistoryDateKey(row.happenedAt());
			var memberMap = dailyCellMapByMember.computeIfAbsent(row.memberInternalId(), ignored -> new LinkedHashMap<>());
			memberMap.putIfAbsent(date, new StudentBoardDailyCellResponse(
				date,
				row.attendanceStatus(),
				row.assignmentStatus(),
				row.assignmentLink(),
				row.happenedAt() == null ? null : row.happenedAt().toString(),
				row.source()
			));
		}

		List<StudentBoardRowResponse> rows = new ArrayList<>();
		for (var member : members) {
			var board = boardByMemberId.get(member.memberInternalId());
			List<StudentBoardDailyCellResponse> dailyCells = new ArrayList<>(dailyCellMapByMember.getOrDefault(member.memberInternalId(), new LinkedHashMap<>()).values());
			dailyCells.sort(java.util.Comparator.comparing(StudentBoardDailyCellResponse::date));
			rows.add(new StudentBoardRowResponse(
				member.memberId(),
				board == null || board.attendanceStatus() == null ? "unknown" : board.attendanceStatus(),
				board == null ? null : board.attendanceMarkedAt(),
				board == null ? null : board.attendanceMarkedSource(),
				board == null || board.assignmentStatus() == null ? "unknown" : board.assignmentStatus(),
				board == null ? null : board.assignmentLink(),
				board == null ? null : board.assignmentMarkedAt(),
				board == null ? null : board.assignmentMarkedSource(),
				board == null ? null : board.lastPublicCheckAt(),
				hasPhoneLast4(member.phone()),
				dailyCells
			));
		}

		return new StudentBoardReadResponse(
			rows,
			sessions.stream().map(session -> new PublicCheckSessionSummaryResponse(
				session.id(),
				session.title(),
				session.status(),
				session.checkMode(),
				session.enabledMethods(),
				"/check/" + session.publicToken(),
				session.opensAt(),
				session.closesAt(),
				session.locationLabel(),
				session.radiusMeters(),
				session.createdAt()
			)).toList(),
			period
		);
	}

	private OffsetDateTime resolveFrom(String period, LocalDate spaceStartDate) {
		if ("space".equals(period)) {
			LocalDate startDate = spaceStartDate == null ? LocalDate.of(1970, 1, 1) : spaceStartDate;
			return startDate.atStartOfDay().atOffset(ZoneOffset.ofHours(9)).withOffsetSameInstant(ZoneOffset.UTC);
		}
		LocalDate todaySeoul = OffsetDateTime.now(ZoneOffset.ofHours(9)).toLocalDate();
		LocalDate start = todaySeoul.minusDays(HISTORY_PERIOD_DAY_COUNT.get(period) - 1L);
		return start.atStartOfDay().atOffset(ZoneOffset.ofHours(9)).withOffsetSameInstant(ZoneOffset.UTC);
	}

	private OffsetDateTime resolveTo(String period, LocalDate spaceEndDate) {
		if (!"space".equals(period) || spaceEndDate == null) return null;
		return spaceEndDate.plusDays(1).atStartOfDay().minusNanos(1).atOffset(ZoneOffset.ofHours(9)).withOffsetSameInstant(ZoneOffset.UTC);
	}

	private String getHistoryDateKey(OffsetDateTime value) {
		return value.withOffsetSameInstant(ZoneOffset.ofHours(9)).toLocalDate().format(DATE_KEY_FORMATTER);
	}

	private boolean hasPhoneLast4(String phone) {
		String digits = phone == null ? "" : phone.replaceAll("\\D", "");
		return digits.length() >= 4;
	}
}
