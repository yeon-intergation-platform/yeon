package world.yeon.backend.space_templates.write.dto;

import jakarta.validation.constraints.Size;

public record UpdateSpaceTemplateRequest(
	@Size(min = 1, max = 80) String name,
	@Size(max = 500) String description
) {
}
