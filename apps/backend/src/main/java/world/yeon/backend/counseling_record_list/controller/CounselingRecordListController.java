package world.yeon.backend.counseling_record_list.controller;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.counseling_record_list.dto.CounselingRecordListResponse;
import world.yeon.backend.counseling_record_list.service.CounselingRecordListService;

@RestController
public class CounselingRecordListController {
	private final CounselingRecordListService service;

	public CounselingRecordListController(CounselingRecordListService service) {
		this.service = service;
	}

	@GetMapping("/counseling-records")
	public CounselingRecordListResponse getRecords(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestParam(required = false) String spaceId,
		@RequestParam(required = false, defaultValue = "false") boolean unlinked,
		@RequestParam(required = false) Integer limit,
		@RequestParam(required = false) OffsetDateTime before
	) {
		return service.listRecords(userId, spaceId, unlinked, limit, before);
	}
}
