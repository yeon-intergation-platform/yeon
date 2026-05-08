package world.yeon.backend.space_templates.read.mapper;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.space_templates.read.dto.SpaceTemplateDetailResponse;
import world.yeon.backend.space_templates.read.dto.SpaceTemplateSummaryResponse;
import world.yeon.backend.space_templates.read.dto.TemplateFieldDto;
import world.yeon.backend.space_templates.read.dto.TemplateTabDto;
import world.yeon.backend.space_templates.read.model.SpaceTemplateEntity;

@Component
public class SpaceTemplateReadMapper {

	private static final TypeReference<List<TemplateTabDto>> TEMPLATE_TAB_LIST_TYPE =
		new TypeReference<>() {
		};

	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public SpaceTemplateSummaryResponse toSummary(SpaceTemplateEntity entity) {
		List<TemplateTabDto> tabs = parseTabs(entity.getTabsConfig());
		List<String> tabPreviewNames = tabs.stream()
			.sorted(Comparator.comparingInt(TemplateTabDto::displayOrder))
			.map(TemplateTabDto::name)
			.limit(4)
			.toList();
		List<String> fieldPreviewNames = tabs.stream()
			.flatMap(tab -> tab.fields().stream()
				.sorted(Comparator.comparingInt(TemplateFieldDto::displayOrder)))
			.map(TemplateFieldDto::name)
			.limit(6)
			.toList();
		int fieldCount = tabs.stream().mapToInt(tab -> tab.fields().size()).sum();

		return new SpaceTemplateSummaryResponse(
			entity.getPublicId(),
			entity.getName(),
			entity.getDescription(),
			entity.isSystem(),
			tabs.size(),
			fieldCount,
			tabPreviewNames,
			fieldPreviewNames,
			entity.getCreatedAt(),
			entity.getUpdatedAt()
		);
	}

	public SpaceTemplateDetailResponse toDetail(SpaceTemplateEntity entity) {
		List<TemplateTabDto> tabs = parseTabs(entity.getTabsConfig());
		SpaceTemplateSummaryResponse summary = toSummary(entity);

		return new SpaceTemplateDetailResponse(
			summary.id(),
			summary.name(),
			summary.description(),
			summary.isSystem(),
			summary.tabCount(),
			summary.fieldCount(),
			summary.tabPreviewNames(),
			summary.fieldPreviewNames(),
			summary.createdAt(),
			summary.updatedAt(),
			tabs
		);
	}

	private List<TemplateTabDto> parseTabs(JsonNode tabsConfig) {
		return objectMapper.convertValue(tabsConfig, TEMPLATE_TAB_LIST_TYPE);
	}
}
