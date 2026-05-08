package world.yeon.backend.member_fields.reorder.dto;

import java.util.List;

import jakarta.validation.constraints.NotNull;

public record ReorderMemberFieldsRequest(
	@NotNull List<String> order
) {
}
