package world.yeon.backend.space_templates.read.dto;

import java.util.List;
import java.util.Map;

public record TemplateFieldDto(
	String name,
	String fieldType,
	List<Map<String, String>> options,
	boolean isRequired,
	int displayOrder
) {
}
