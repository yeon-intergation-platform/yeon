package world.yeon.backend.member_counseling_records.controller;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.member_counseling_records.dto.MemberCounselingRecordsResponse;
import world.yeon.backend.member_counseling_records.service.MemberCounselingRecordService;

@RestController
@Profile("jdbc")
public class MemberCounselingRecordController {
	private final MemberCounselingRecordService service;

	public MemberCounselingRecordController(MemberCounselingRecordService service) {
		this.service = service;
	}

	@GetMapping("/spaces/{spaceId}/members/{memberId}/counseling-records")
	public MemberCounselingRecordsResponse getRecords(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String memberId,
		@RequestParam(required = false) Integer limit,
		@RequestParam(required = false) OffsetDateTime before
	) {
		return service.listByMember(userId, memberId, limit, before);
	}
}
