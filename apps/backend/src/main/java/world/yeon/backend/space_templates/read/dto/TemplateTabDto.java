package world.yeon.backend.space_templates.read.dto;

import java.util.List;

public record TemplateTabDto(
	String name,
	String tabType,
	String systemKey,
	int displayOrder,
	List<TemplateFieldDto> fields
) {
}
