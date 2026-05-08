package world.yeon.backend.space_templates.read.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record SpaceTemplateDetailResponse(
	String id,
	String name,
	String description,
	boolean isSystem,
	int tabCount,
	int fieldCount,
	List<String> tabPreviewNames,
	List<String> fieldPreviewNames,
	OffsetDateTime createdAt,
	OffsetDateTime updatedAt,
	List<TemplateTabDto> tabsConfig
) {
}
