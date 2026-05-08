package world.yeon.backend.member_field_values.write.dto;

import java.util.List;

import jakarta.validation.constraints.NotNull;

public record BulkUpsertMemberFieldValuesRequest(
	@NotNull List<MemberFieldValuePayloadRequest> values
) {
}
