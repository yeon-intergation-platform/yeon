package world.yeon.backend.student_board_history.controller;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.student_board_history.dto.MemberStudentBoardHistoryResponse;
import world.yeon.backend.student_board_history.service.StudentBoardHistoryService;
import world.yeon.backend.student_board_history.service.StudentBoardHistoryServiceException;

@Validated
@RestController
@Profile("jdbc")
public class StudentBoardHistoryController {
	private final StudentBoardHistoryService service;

	public StudentBoardHistoryController(StudentBoardHistoryService service) {
		this.service = service;
	}

	@GetMapping("/spaces/{spaceId}/members/{memberId}/board-history")
	public MemberStudentBoardHistoryResponse getBoardHistory(@PathVariable String spaceId, @PathVariable String memberId, @RequestHeader("X-Yeon-User-Id") UUID userId, @RequestParam(defaultValue = "30d") String period) {
		return service.getMemberHistory(spaceId, memberId, userId, period);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(StudentBoardHistoryServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(StudentBoardHistoryServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
