package world.yeon.backend.student_board_read.controller;

import java.util.NoSuchElementException;
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
import world.yeon.backend.student_board_read.dto.StudentBoardReadResponse;
import world.yeon.backend.student_board_read.service.StudentBoardReadService;
import world.yeon.backend.student_board_read.service.StudentBoardReadServiceException;

@Validated
@RestController
@Profile("jdbc")
public class StudentBoardReadController {
	private final StudentBoardReadService service;

	public StudentBoardReadController(StudentBoardReadService service) {
		this.service = service;
	}

	@GetMapping("/spaces/{spaceId}/student-board")
	public StudentBoardReadResponse getBoard(
		@PathVariable String spaceId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestParam(defaultValue = "7d") String historyPeriod
	) {
		return service.getBoard(spaceId, userId, historyPeriod);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException error) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("SPACE_NOT_FOUND", error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(StudentBoardReadServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(StudentBoardReadServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
