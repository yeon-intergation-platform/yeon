package world.yeon.backend.sheet_export.snapshot.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import world.yeon.backend.sheet_export.snapshot.dto.ReplaceSheetExportSnapshotsRequest;
import world.yeon.backend.sheet_export.snapshot.dto.ReplaceSheetExportSnapshotsResponse;
import world.yeon.backend.sheet_export.snapshot.dto.SheetExportSnapshotsResponse;
import world.yeon.backend.sheet_export.snapshot.service.SheetExportSnapshotService;

@Validated
@RestController
@RequestMapping("/spaces/{spaceId}/sheet-export/snapshots")
public class SheetExportSnapshotController {

	private final SheetExportSnapshotService service;

	public SheetExportSnapshotController(SheetExportSnapshotService service) {
		this.service = service;
	}

	@GetMapping
	public SheetExportSnapshotsResponse getSnapshots(
		@PathVariable String spaceId,
		@RequestParam String sheetId,
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		return service.getSnapshots(spaceId, sheetId);
	}

	@PutMapping
	public ReplaceSheetExportSnapshotsResponse replaceSnapshots(
		@PathVariable String spaceId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody ReplaceSheetExportSnapshotsRequest request
	) {
		return service.replaceSnapshots(spaceId, request);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException error) {
		String code = "연동된 익스포트 시트를 찾지 못했습니다.".equals(error.getMessage())
			? "SHEET_INTEGRATION_NOT_FOUND"
			: ("스페이스를 찾지 못했습니다.".equals(error.getMessage()) ? "SPACE_NOT_FOUND" : "NOT_FOUND");
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(new ErrorResponse(code, error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.badRequest().body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
