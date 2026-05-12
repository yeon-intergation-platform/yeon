package world.yeon.backend.student_board_history.service;

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
import world.yeon.backend.student_board_history.dto.MemberStudentBoardHistoryResponse;
import world.yeon.backend.student_board_history.dto.StudentBoardDailyCellResponse;
import world.yeon.backend.student_board_history.dto.StudentBoardHistoryItemResponse;
import world.yeon.backend.student_board_history.repository.StudentBoardHistoryRepository;

@Service
public class StudentBoardHistoryService {
	private static final DateTimeFormatter DATE_KEY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	private static final Map<String, Integer> HISTORY_PERIOD_DAY_COUNT = Map.of(
		"7d", 7,
		"30d", 30,
		"365d", 365
	);

	private final StudentBoardHistoryRepository repository;

	public StudentBoardHistoryService(StudentBoardHistoryRepository repository) {
		this.repository = repository;
	}

	public MemberStudentBoardHistoryResponse getMemberHistory(String spaceId, String memberId, UUID userId, String period) {
		if (!List.of("space", "7d", "30d", "365d").contains(period)) {
			throw new IllegalArgumentException("학생 이력 기간 값이 올바르지 않습니다.");
		}

		var context = repository.findOwnedMemberContext(spaceId, memberId, userId);
		if (context == null) {
			throw new StudentBoardHistoryServiceException(404, "MEMBER_NOT_FOUND", "해당 수강생을 찾지 못했습니다.");
		}

		OffsetDateTime from = resolveFrom(period, context.spaceStartDate());
		OffsetDateTime to = resolveTo(period, context.spaceEndDate());
		var rows = repository.findHistoryRows(context.spaceInternalId(), context.memberInternalId(), from, to);

		Map<String, StudentBoardDailyCellResponse> dailyCellMap = new LinkedHashMap<>();
		List<StudentBoardHistoryItemResponse> history = new ArrayList<>();

		for (var row : rows) {
			String historyDate = getHistoryDateKey(row.happenedAt());
			dailyCellMap.putIfAbsent(
				historyDate,
				new StudentBoardDailyCellResponse(
					historyDate,
					row.attendanceStatus(),
					row.assignmentStatus(),
					row.assignmentLink(),
					row.happenedAt().toString(),
					row.source()
				)
			);
			history.add(new StudentBoardHistoryItemResponse(
				row.id(),
				context.memberPublicId(),
				context.memberName(),
				historyDate,
				row.happenedAt().toString(),
				row.attendanceStatus(),
				row.assignmentStatus(),
				row.assignmentLink(),
				row.source()
			));
		}

		return new MemberStudentBoardHistoryResponse(period, new ArrayList<>(dailyCellMap.values()), history);
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
}
