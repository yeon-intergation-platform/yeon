package world.yeon.backend.member_field_values.read.dto;

public record MemberFieldValueDetailedItemResponse(
	String fieldDefinitionId,
	String fieldType,
	String fieldName,
	String valueText,
	String valueNumber,
	Boolean valueBoolean,
	Object valueJson
) {
}
