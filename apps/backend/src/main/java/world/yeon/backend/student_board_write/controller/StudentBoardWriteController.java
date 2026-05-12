package world.yeon.backend.student_board_write.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.student_board_read.dto.StudentBoardReadResponse;
import world.yeon.backend.student_board_write.dto.UpdateStudentBoardRequest;
import world.yeon.backend.student_board_write.service.StudentBoardWriteService;
import world.yeon.backend.student_board_write.service.StudentBoardWriteServiceException;

@Validated
@RestController
public class StudentBoardWriteController {
	private final StudentBoardWriteService service;

	public StudentBoardWriteController(StudentBoardWriteService service) {
		this.service = service;
	}

	@PatchMapping("/spaces/{spaceId}/student-board/{memberId}")
	public StudentBoardReadResponse updateBoard(
		@PathVariable String spaceId,
		@PathVariable String memberId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody UpdateStudentBoardRequest request
	) {
		return service.updateBoard(spaceId, memberId, userId, request);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(StudentBoardWriteServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(StudentBoardWriteServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
