package world.yeon.backend.member_field_values.write.dto;

import java.util.List;

public record MemberFieldValuesMutationResponse(
	boolean ok,
	List<MemberFieldValueMutationItemResponse> values
) {
	public static MemberFieldValuesMutationResponse success(List<MemberFieldValueMutationItemResponse> values) {
		return new MemberFieldValuesMutationResponse(true, values);
	}
}
