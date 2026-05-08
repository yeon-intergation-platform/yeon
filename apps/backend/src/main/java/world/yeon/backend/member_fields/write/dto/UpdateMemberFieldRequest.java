package world.yeon.backend.member_fields.write.dto;

import java.util.List;
import java.util.Map;

public record UpdateMemberFieldRequest(
	String name,
	String fieldType,
	List<Map<String, String>> options,
	Boolean isRequired,
	Integer displayOrder,
	String tabId
) {
}
