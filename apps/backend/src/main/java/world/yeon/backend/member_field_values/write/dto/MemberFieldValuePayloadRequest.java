package world.yeon.backend.member_field_values.write.dto;

public record MemberFieldValuePayloadRequest(
	String fieldDefinitionId,
	Object value
) {
}
