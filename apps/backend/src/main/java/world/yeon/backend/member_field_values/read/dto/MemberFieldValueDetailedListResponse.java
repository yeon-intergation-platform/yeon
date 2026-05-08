package world.yeon.backend.member_field_values.read.dto;

import java.util.List;

public record MemberFieldValueDetailedListResponse(
	List<MemberFieldValueDetailedItemResponse> values
) {
}
