package world.yeon.backend.member_field_values.write.dto;

public record MemberFieldValueMutationItemResponse(
	String fieldDefinitionId,
	String fieldType,
	String fieldName,
	String valueText,
	String valueNumber,
	Boolean valueBoolean,
	Object valueJson
) {
}
