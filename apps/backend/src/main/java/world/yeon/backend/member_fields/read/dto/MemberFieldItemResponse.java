package world.yeon.backend.member_fields.read.dto;

import java.util.List;
import java.util.Map;

public record MemberFieldItemResponse(
	String id,
	String name,
	String sourceKey,
	String fieldType,
	List<Map<String, String>> options,
	boolean isRequired,
	int displayOrder
) {
}
