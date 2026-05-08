package world.yeon.backend.space_templates.write.dto;

import jakarta.validation.constraints.NotBlank;

public record ApplySpaceTemplateRequest(@NotBlank String templateId) {
}
