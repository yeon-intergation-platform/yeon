package world.yeon.backend.member_field_values.read.dto;

public record MemberFieldValueItemResponse(
	String fieldDefinitionId,
	String valueText,
	String valueNumber,
	Boolean valueBoolean,
	Object valueJson
) {
}
