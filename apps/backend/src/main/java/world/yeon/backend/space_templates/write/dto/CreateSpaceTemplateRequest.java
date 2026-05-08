package world.yeon.backend.space_templates.write.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public record CreateSpaceTemplateRequest(
	@NotBlank @Size(max = 80) String name,
	@Size(max = 500) String description,
	@NotNull @NotEmpty List<@Valid TemplateTabRequest> tabsConfig
) {

	public record TemplateTabRequest(
		@NotBlank @Size(max = 80) String name,
		@NotBlank @Pattern(regexp = "system|custom") String tabType,
		String systemKey,
		@Min(0) int displayOrder,
		@NotNull List<@Valid TemplateFieldRequest> fields
	) {
	}

	public record TemplateFieldRequest(
		@NotBlank @Size(max = 80) String name,
		@NotBlank @Pattern(
			regexp = "text|long_text|number|date|select|multi_select|checkbox|url|email|phone"
		) String fieldType,
		List<@Valid TemplateFieldOptionRequest> options,
		boolean isRequired,
		@Min(0) int displayOrder
	) {
	}

	public record TemplateFieldOptionRequest(
		@NotBlank String value,
		@NotBlank String color
	) {
	}
}
