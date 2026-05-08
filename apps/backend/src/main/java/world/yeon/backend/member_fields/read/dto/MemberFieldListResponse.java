package world.yeon.backend.member_fields.read.dto;

import java.util.List;

public record MemberFieldListResponse(
	List<MemberFieldItemResponse> fields
) {
}
