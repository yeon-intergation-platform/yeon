package world.yeon.backend.space_templates.read.dto;

import java.util.List;

public record SpaceTemplateListResponse(
	List<SpaceTemplateSummaryResponse> templates
) {
}
